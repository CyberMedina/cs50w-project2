import os

from flask import Flask, render_template, redirect, url_for, request, g, session
from flask_session import Session
from flask_socketio import SocketIO, emit
from dotenv import load_dotenv

load_dotenv()



app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.jinja_env.globals['g'] = g
socketio = SocketIO(app)

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)


@app.before_request
def before_request():
    if 'userName' in session:

        g.name = session['userName'] 

    



@app.route("/",methods= ["GET", "POST"])
def index():

    if request.method == 'POST':

        session['userName'] = request.form.get('userName')

        return redirect(url_for('index'))
    
    return render_template('index.html')

@app.route("/close_session")
def close_session():
    session.pop('userName', None)
    return redirect(url_for('index'))