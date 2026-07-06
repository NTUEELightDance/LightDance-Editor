from textual_serve.server import Server

server = Server("python -m src", host="192.168.0.140")

server.serve(debug=True)
