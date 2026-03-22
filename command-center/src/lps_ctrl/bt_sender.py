# import logging
import json
import time

import serial

from ..types.app import ControlScreenParamsType, ControlScreenType

# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
# logger = logging.getLogger(__name__)


class ESP32BTSender:
    # Maps user-friendly command strings to internal hexadecimal IDs
    CMD_MAP = {
        "PLAY": 0x01,
        "PAUSE": 0x02,
        "STOP": 0x03,
        "RELEASE": 0x04,
        "TEST": 0x05,
        "CANCEL": 0x06,
        "CHECK": 0x07,
        "UPLOAD": 0x08,
        "RESET": 0x09,
        "SEEK": 0x0A,
    }
    CMD_MAP_INV = {
        0x01: "PLAY",
        0x02: "PAUSE",
        0x03: "STOP",
        0x04: "RELEASE",
        0x05: "TEST",
        0x06: "CANCEL",
        0x07: "CHECK",
        0x08: "UPLOAD",
        0x09: "RESET",
        0x0A: "SEEK",
    }
    # Maps internal state integers to readable strings for reporting
    STATE_MAP = {0: "UNLOADED", 1: "READY", 2: "PLAYING", 3: "PAUSE", 4: "TEST"}

    def __init__(
        self, screen_ref: ControlScreenType, port, baud_rate=115200, timeout=1
    ):
        self.screen_ref = screen_ref
        self.port = port
        self.baud_rate = baud_rate
        self.timeout = timeout
        self.ser = None

        self.found_devices_buffer = []  # Buffer to store ACK reports from receivers
        self.cmd_list = [0] * 16  # Tracks execution timestamps for the 16 command slots
        self.idx = -1  # Current command slot index

    def connect(self):
        """Opens the serial connection to the ESP32 Sender."""
        try:
            self.ser = serial.Serial(self.port, self.baud_rate, timeout=self.timeout)
            time.sleep(2)  # Wait for ESP32 to reboot after serial connection
            self.ser.reset_input_buffer()
            # logger.info(f"Connected to {self.port}")
            self.screen_ref.notify(f"Connected to {self.port}")
        except serial.SerialException as e:
            # logger.error(f"Failed to connect: {e}")
            self.screen_ref.notify(f"Failed to connect: {e}", severity="error")
            raise

    def close(self):
        """Closes the serial connection."""
        if self.ser and self.ser.is_open:
            self.ser.close()

    def _format_response(self, status_code, cmd, target_ids, cmd_id, message):
        """Helper to format standard JSON responses."""
        return {
            "from": "Host_PC",
            "topic": "command",
            "statusCode": status_code,
            "payload": {
                "target_id": str(target_ids),
                "command": str(cmd),
                "command_id": str(cmd_id),
                "message": message,
            },
        }

    def _read_until_ack_or_timeout(self, expected_ack="ACK:OK", timeout=1.0):
        """Reads serial data until the expected ACK is received or timeout occurs."""
        start_time = time.time()
        last_msg = ""

        while (time.time() - start_time) < timeout:
            if self.ser.in_waiting > 0:
                try:
                    line = (
                        self.ser.read_until(b"\n")
                        .decode("utf-8", errors="ignore")
                        .strip()
                    )
                    if not line:
                        continue

                    if expected_ack in line:
                        return True, "Success"

                    elif line.startswith("FOUND:"):
                        self._parse_found_line(line)

                    elif line == "CHECK_DONE":
                        pass

                    elif "NAK" in line:
                        return False, f"Device rejected: {line}"

                    else:
                        last_msg = line

                except Exception as e:
                    return False, str(e)
            else:
                time.sleep(0.005)

        return False, f"Timeout or Unexpected: {last_msg}"

    def _parse_found_line(self, line):
        """Parses 'FOUND:...' strings from the ESP32 into dicts and stores them."""
        try:
            parts = line.replace("FOUND:", "").split(",")
            if len(parts) >= 5:
                state = self.STATE_MAP.get(int(parts[4]), "UNKNOWN")
                cmd_type = self.CMD_MAP_INV.get(int(parts[2]), "UNKNOWN")
                current_time = time.time()
                packet = {
                    "target_id": int(parts[0]),
                    "cmd_id": int(parts[1]),
                    "cmd_type": cmd_type,
                    "target_delay": int(parts[3]),
                    "state": state,
                    "timestamp": current_time,
                }
                if not self.found_devices_buffer:
                    self.found_devices_buffer.append(packet)
                else:
                    first_ts = self.found_devices_buffer[0]["timestamp"]

                    if current_time - first_ts > 1.0:
                        self.found_devices_buffer = [packet]
                    else:
                        is_duplicate = any(
                            p["target_id"] == int(parts[0])
                            for p in self.found_devices_buffer
                        )
                        if not is_duplicate:
                            self.found_devices_buffer.append(packet)
        except Exception as e:
            # logger.error(f"Parse error: {e}")
            self.screen_ref.notify(f"Parse error: {e}", severity="error")

    def send_burst(
        self,
        cmd_input,
        delay_sec,
        prep_led_sec=0.0,
        target_time_sec=0.0,
        target_ids=None,
        data=None,
    ):
        """Sends a scheduled broadcast command to the ESP32 Sender."""
        self._drain_serial()

        if target_ids is None:
            target_ids = []
        if data is None:
            data = [0, 0, 0]

        error_response = self._format_response(
            -1, cmd_input, target_ids, -1, "Port not open"
        )
        if not self.ser or not self.ser.is_open:
            return error_response

        cmd_int = (
            cmd_input if isinstance(cmd_input, int) else self.CMD_MAP.get(cmd_input, 0)
        )
        delay_ms = int(delay_sec * 1000)
        prep_led_ms = int(prep_led_sec * 1000)
        target_time_ms = int(target_time_sec * 1000)

        target_mask = 0
        if not target_ids:
            target_mask = 0xFFFFFFFFFFFFFFFF
        else:
            for pid in target_ids:
                target_mask |= 1 << pid

        t_start_pc = time.perf_counter()
        target_time = t_start_pc + delay_sec
        add_cmd_fail = 1
        packet = ""

        for i in range(16):
            if self.cmd_list[i] < t_start_pc and i != self.idx:
                self.cmd_list[i] = target_time
                cmd_int = i * 16 + cmd_int
                packet = f"{cmd_int},{delay_ms},{prep_led_ms},{target_mask:x},{data[0]},{data[1]},{data[2]},{target_time_ms}\n"
                add_cmd_fail = 0
                self.idx = i
                break

        if add_cmd_fail == 1:
            return self._format_response(
                -1, cmd_input, target_ids, self.idx, "Queue full"
            )

        # logger.info(f"Sending: {packet.strip()}")
        self.screen_ref.notify(f"Sending: {packet.strip()}")
        self.ser.write(packet.encode("utf-8"))

        success, msg = self._read_until_ack_or_timeout(
            expected_ack="ACK:OK", timeout=0.5
        )

        status = 0 if success else -1
        return self._format_response(status, cmd_input, target_ids, self.idx, msg)

    def trigger_check(self, target_ids=[]):
        """Sends a CHECK command to trigger receivers to broadcast their status."""
        if not self.ser or not self.ser.is_open:
            return self._format_response(-1, "CHECK", target_ids, -1, "Port not open")

        resp = self.send_burst(cmd_input="CHECK", delay_sec=1.0, target_ids=target_ids)
        if resp["statusCode"] != 0:
            return resp

        cmd_id = resp["payload"]["command_id"]
        return {
            "from": "Host_PC",
            "topic": "check_trigger",
            "statusCode": 0,
            "payload": {
                "target_id": str(target_ids),
                "command": "CHECK",
                "command_id": str(cmd_id),
                "message": f"Check started (ID: {cmd_id})",
            },
        }

    def get_latest_report(self):
        """Fetches the aggregated status report after a CHECK scan."""
        self._drain_serial()  # Ensure all pending data is read
        report_snapshot = []
        for device in self.found_devices_buffer:
            report_snapshot.append(
                {
                    "target_id": device["target_id"],
                    "cmd_id": device["cmd_id"],
                    "cmd_type": device["cmd_type"],
                    "target_delay": device["target_delay"],
                    "state": device["state"],
                }
            )
        return {
            "from": "Host_PC",
            "topic": "check_report",
            "statusCode": 0,
            "payload": {
                "scan_duration_sec": 2,
                "found_count": len(report_snapshot),
                "found_devices": report_snapshot,
            },
        }

    def _drain_serial(self):
        """Reads and parses any lingering data in the serial buffer."""
        if self.ser and self.ser.is_open:
            while self.ser.in_waiting > 0:
                try:
                    line = (
                        self.ser.read_until(b"\n")
                        .decode("utf-8", errors="ignore")
                        .strip()
                    )
                    if line.startswith("FOUND:"):
                        self._parse_found_line(line)
                except:
                    break

    # Context manager support (with-statement)
    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
