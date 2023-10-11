import os

from flask import Flask, render_template, redirect
from flask_socketio import SocketIO, emit
from dotenv import load_dotenv

load_dotenv()



app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


@app.route("/")
def index():

    return render_template('index.html')