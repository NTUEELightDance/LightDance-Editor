import asyncio
import os
import socket
import struct
import time

from ..types.app import ControlScreenParamsType, ControlScreenType

dancer_list = [
    "all",
    "0_liao",
    "1_lin",
    "2_feng",
    "3_chen",
    "4_roy",
    "5_chiu",
    "6_su",
    "7_li",
    "8_hsieh",
    "9_yang",
    "10_tsai",
    "11_luo",
    "12_coffin",
    "13_altar_top1",
    "14_altar_bottom1",
    "15_altar_top2",
    "16_altar_bottom2",
    "17_cross",
    "18_gem",
    "19_pole",
    "20_fireplace",
    "21_axe1",
    "22_axe2",
    "23_balcony",
    "24_gun",
    "25_staff1",
    "26_staff2",
]


class Esp32TcpServer:
    def __init__(
        self,
        screen_ref: ControlScreenType,
        dancer_status,
        act_fcn,
        control_paths_list,
        frame_paths_list,
        host="0.0.0.0",
        port=3333,
    ):
        """Initializes the async TCP server settings."""
        self.act_fcn = act_fcn
        self.dancer_status = dancer_status
        self.screen_ref = screen_ref
        self.host = host
        self.port = port
        self.control_paths_list = control_paths_list
        self.frame_paths_list = frame_paths_list
        self.server = None

    def _get_file_data(self, filepath):
        """Reads binary data from a file."""
        if not os.path.exists(filepath):
            # Raise exception to be caught by handle_client
            raise FileNotFoundError(f"File not found: {filepath}")

        with open(filepath, "rb") as f:
            return f.read()

    def _update_response(self, id, text):
        try:
            self.dancer_status[dancer_list[id]].response = text
            self.act_fcn()
        except:
            self.screen_ref.notify(
                "TCP server failed to fetch dancer data.", severity="error"
            )

    async def handle_client(self, reader, writer):
        """Async task to handle an individual ESP32 connection."""
        addr = writer.get_extra_info("peername")
        print(f"Connection successful! From: {addr}")

        try:
            # 1. Receive Player ID
            player_id_data = await reader.read(1024)
            if not player_id_data:
                print("No data received, disconnecting.")
                return

            player_id_str = player_id_data.decode("utf-8").strip()
            print(f"Received Player ID: {player_id_str}")

            try:
                pid = int(player_id_str)
                idx = pid - 1
            except ValueError:
                print(f"Error: Invalid Player ID format '{player_id_str}'")
                return

            # Verify ID is within bounds
            if (
                idx < 0
                or idx >= len(self.control_paths_list)
                or idx >= len(self.frame_paths_list)
            ):
                print(
                    f"Error: Player ID {pid} is out of bounds (Max: {len(self.control_paths_list)})."
                )
                return

            player_control_path = self.control_paths_list[idx]
            player_frame_path = self.frame_paths_list[idx]

            # --- Attempt to load files ---
            self._update_response(pid, f"Loading local file")
            try:
                control_data = self._get_file_data(player_control_path)
                frame_data = self._get_file_data(player_frame_path)
            except FileNotFoundError as e:
                # Abort transmission if files are missing to protect existing SD card data
                print(f"Incomplete data for Player {pid}: {e}")
                print(f"Disconnected Player {pid} to preserve existing SD card data.")
                self._update_response(pid, f"Incomplete data for Player: {e}")
                return

            # 2. Send control file
            print(
                f"Sending Control data ({len(control_data)} bytes) to Player {pid}..."
            )
            self._update_response(
                pid, f"Sending Control data ({len(control_data)} bytes) to Player..."
            )
            size_header = struct.pack(">I", len(control_data))
            writer.write(size_header)
            writer.write(control_data)
            await writer.drain()

            await asyncio.sleep(0.1)  # Brief pause between files

            # 3. Send frame file
            print(f"Sending Frame data ({len(frame_data)} bytes) to Player {pid}...")
            self._update_response(
                pid, f"Sending Frame data ({len(frame_data)} bytes) to Player..."
            )
            size_header = struct.pack(">I", len(frame_data))
            writer.write(size_header)
            writer.write(frame_data)
            await writer.drain()

            # 4. Wait for ESP32 to confirm save completion (ACK)
            print(f"Waiting for Player {pid} to save to SD card and send ACK...")
            self._update_response(
                pid, f"Waiting for Player to save to SD card and send ACK..."
            )
            try:
                ack_data = await asyncio.wait_for(reader.read(1024), timeout=15.0)
                if ack_data:
                    ack_msg = ack_data.decode("utf-8").strip()
                    if ack_msg == "DONE":
                        print(
                            f"Player {pid} successfully received and saved all files!"
                        )
                        self._update_response(
                            pid, f"Player successfully received and saved all files!"
                        )
                    else:
                        print(f"Received unknown message from Player {pid}: {ack_msg}")
                        self._update_response(
                            pid, f"Received unknown message from Player: {ack_msg}"
                        )
                else:
                    print(f"Connection closed early, Player {pid} did not send ACK.")
                    self._update_response(
                        pid, f"Connection closed early, Player did not send ACK."
                    )

            except asyncio.TimeoutError:
                print(
                    f"ACK timeout! Player {pid} might have failed to save or disconnected."
                )
                self._update_response(
                    pid,
                    f"ACK timeout! Player might have failed to save or disconnected.",
                )

        except Exception as e:
            print(f"Error during transmission: {e}")
            self.screen_ref.notify(f"Error during transmission: {e}", severity="error")

        finally:
            writer.close()
            await writer.wait_closed()
            print("----------------------------------------")

    async def start(self):
        """Starts the async TCP server."""
        self.server = await asyncio.start_server(
            self.handle_client, self.host, self.port
        )

        hostname = socket.gethostname()
        local_ip = socket.gethostbyname(hostname)
        print(f"========================================")
        print(f"Async TCP Server Starting...")
        print(f"Listening on Port: {self.port}")
        print(f"Local IP (for reference): {local_ip}")
        print(
            f"Loaded {len(self.control_paths_list)} control paths and {len(self.frame_paths_list)} frame paths."
        )
        print(f"========================================")

        self.screen_ref.notify(f"TCP server is listening on port {self.port}")

        async with self.server:
            await self.server.serve_forever()
