from textual_serve.server import Server

server = Server("uv run -m src", host="0.0.0.0", port=5678)

server.serve(debug=True)
