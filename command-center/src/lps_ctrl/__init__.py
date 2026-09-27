import asyncio
import threading

from .bt_sender import ESP32BTSender
from .tcp_server import Esp32TcpServer

__all__ = ["ESP32BTSender", "Esp32TcpServer"]

# sender = ESP32BTSender(port="/dev/tty.usbserial-10", baud_rate=115200)
# sender.connect()

# async def init_server():
#     uploadServer = Esp32TcpServer(
#         control_paths_list=["../../../lighttable/control_" + str(i) + ".dat" for i in range(27)],
#         frame_paths_list=["../../../lighttable/frame_" + str(i) + ".dat" for i in range(27)],
#         port=3333
#     )
#     await uploadServer.start()

# def start_server_thread():
#     loop = asyncio.new_event_loop()
#     asyncio.set_event_loop(loop)
#     loop.run_until_complete(init_server())

# server_thread = threading.Thread(target=start_server_thread, daemon=True)
# server_thread.start()
