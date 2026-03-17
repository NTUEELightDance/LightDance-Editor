from textual_serve.server import Server

server = Server("uv run -m src")

server.serve(debug=True)
