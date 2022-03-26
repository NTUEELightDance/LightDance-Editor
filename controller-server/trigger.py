from flask import Flask, request

app = Flask(__name__)
@app.route("/api/nthu_play")
def play():
    sys_time = request.args.get('sys_time')
    return ("Play at system time: %d" % sys_time)


if __name__ == '__main__':
    app.run(debug=True)