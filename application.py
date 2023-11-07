import os, datetime

from flask import Flask, render_template, redirect, url_for, request, g, session, flash
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
        userName = request.form.get('userName').strip()

        if (userName):
             session['userName'] = request.form.get('userName')
             return redirect(url_for('index'))

        else:
            print(f'No deben de haber espacios en blanco {userName}')
            flash('Hey! debes de poner un nombre para poder continuar', 'Error')
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
    lower_room = data['room'].lower()  # Convertir el nombre de la sala a minúsculas
    room = data['room'] 
    lower_channels = {channel.lower() for channel in channels}
    if (lower_room):
        if lower_room not in lower_channels:
            channels.add(room)
            print(channels)
            emit('new_channel', list(channels), broadcast=True)
            return {'status': 'created'}

        else:
            return {'status': 'noCreated'}
    else:
        return {'status': 'noInfo'}




@socketio.on('joinBtn')
def on_joinBtn(data):
    room = data['room']
    print(f'Te acabas de unir a {room}')
    join_room(room)
    
    # Usaremos un diccionario con la lista de las salas y los usuarios
    # Luego validaremos si existe la sala en el diccionario
    # Si la sala no está en el diccionario, o el nombre de usuario no está en la lista de la sala...
    if room not in user_rooms or session['userName'] not in user_rooms.get(room, []):
        # Si la sala no está en el diccionario, inicializamos una nueva lista
        if room not in user_rooms:
            user_rooms[room] = []
        # Añadimos el nombre de usuario a la lista de la sala
        user_rooms[room].append(session['userName'])
        emit('joinChannelStatus', {'room': room, 'userName': session['userName']}, broadcast=True)    



    g.roomstatus = room
    print(f'El diccionario de salas y user_rooms es {user_rooms}')
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

socketio.on('joinChannelStatus')
def joinChannelStatus(data):
    room = data['room']
    print(f'EL TOOLTIP STATUS ES {room}')
    g.roomstatus = room
    emit('status', room, user=session['userName'])
    return {'data': 'joined'}  # Enviando confirmación al cliente


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


# Ejecuta la aplicación Flask
if __name__ == '__main__':
    app.run(host='0.0.0.0')
    app.run()
    



    