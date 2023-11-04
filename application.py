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
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_TYPE"] = "filesystem"
Session(app)


MAX_MESSAGES = 100
channels = set()
connversations = []
user_rooms = {}




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


    



    

@socketio.on('get_messages')
def get_messages(data):
    room = data['room']
    print(f'La sala es: {room}')
    print(channels)
    if room in channels:
        for conversation in connversations:
            if room == conversation['room']:
                print(conversation)
                emit('status', conversation)
            else:
                emit('status', {'msg': '404'})
                print("No existe conversación")
    else:
        emit('status', {'msg': '404'})
        print("No existe la sala")
    

@socketio.on('create_channel')
def on_join(data):
    room = data['room'].lower()  # Convertir el nombre de la sala a minúsculas
    lower_channels = {channel.lower() for channel in channels}
    if room not in lower_channels:
        channels.add(room)
        print(channels)
        emit('new_channel', list(channels), broadcast=True)
        return {'status': 'created'}

    else:
        return {'status': 'noCreated'}


@socketio.on('joinBtn')
def on_joinBtn(data):
    room = data['room']
    print(f'Te acabas de unir a {room}')
    join_room(room)
    g.roomstatus = room
    emit('status', room)
    return {'status': 'joined'}  # Enviando confirmación al cliente


@socketio.on('get_channels')
def get_channels():
    print(channels)
    print("Entró!")
    emit('new_channel', list(channels))

@socketio.on('leave')
def on_leave(data):
    room = data['room']
    leave_room(room)
    print(f'Te acabas de salir de {room}')
    emit('leave_channel')


@socketio.on('list_messages')
def list_messages(data):
    especificUserConversation = []
    room = data['room']
    print(f'Estás almacenando en el canal: {room}')

    for conversation in connversations:
        if room == conversation['room']:
            print(conversation)
            especificUserConversation.append(conversation)
    
    emit('list_messages', especificUserConversation)


@socketio.on('message')
def handle_message(data):
    room = data['room']
    print(f'función envio de mensaje{room}')
    message = data['message']
    datetimeStatus = datetime.datetime.today().strftime("%Y-%m-%d a las %H:%M:")

    # Almacenando el mensaje en la lista de conversaciones
    connversations.append({
        'room': room,
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
    



    