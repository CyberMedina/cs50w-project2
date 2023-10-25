import os, datetime

from flask import Flask, render_template, redirect, url_for, request, g, session
from flask_session import Session
from flask_socketio import SocketIO, emit, join_room, leave_room
from dotenv import load_dotenv

load_dotenv()



app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.jinja_env.globals['g'] = g
socketio = SocketIO(app, cors_allowed_origins='*')

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)


MAX_MESSAGES = 100
channels = set()
connversations = []



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


@socketio.on('join')
def on_join(data):
    room = data['room']
    channels.add(room)
    join_room(room)
    emit('status', {'msg': 'Te has unido a la sala' + room + '!'})

@socketio.on('get_channels')
def get_channels():
    print(channels)
    print("Entró!")
    emit('channel_list', list(channels))

@socketio.on('leave')
def on_leave(data):
    room = data['room']
    leave_room(room)
    emit('status', {'msg' : 'Te has salido de la sala: ' + room + '!'})

@socketio.on('message')
def handle_message(data):
    room = data['room']
    message = data['message']
    datetimeStatus = datetime.datetime.today().strftime("%Y-%m-%d a las %H:%M:")

    # Almacenando el mensaje en la lista de conversaciones
    connversations.append({
        'msg': message, 
                     'user': session['userName'], 
                     'datetime': datetime.datetime.today().strftime("%Y-%m-%d a las %H:%M:")
    })

    if len(connversations) > MAX_MESSAGES:
        connversations.pop(0)

    print(connversations)
    emit('message', {'msg': message, 
                     'user': session['userName'], 
                     'datetime': datetimeStatus }, room=room)



@app.route("/close_session")
def close_session():
    session.pop('userName', None)
    return redirect(url_for('index'))