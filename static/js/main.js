var socket = io();

    // Variable para mantener el estado de enfoque de la ventana
    let isWindowFocused = true;

    // Evento para detectar cuando la ventana está en foco
    window.onfocus = function () {
        isWindowFocused = true;
    };

    // Evento para detectar cuando la ventana pierde el foco
    window.onblur = function () {
        isWindowFocused = false;
    };

    // Función para reproducir el sonido
    function playSound() {
        var audio = new Audio('/static/sounds/ringtone.mp3'); // Ruta al archivo de sonido
        console.log('se escuchó el audio!')
        audio.play();
    }

    function ToEndButton(){
        var scrollToEndButton = document.getElementById('scroll-up');
        var chatbox = document.getElementById('chatbox');

        scrollToEndButton.style.display = 'none';

        scrollToEndButton.addEventListener('click', function(event){
            event.preventDefault();

            chatbox.scrollTop = chatbox.scrollHeight;
        })

        chatbox.addEventListener('scroll', function(){
            var isAtBottom = chatbox.scrollTop + chatbox.clientHeight >= chatbox.scrollHeight;

            if (!isAtBottom){
                scrollToEndButton.style.display = 'block';
            }
            else{
                scrollToEndButton.style.display = 'none'
            }

        })
    }

    // Función para reproducir el sonido
    function playSoundSend() {
        var audio = new Audio('/static/sounds/soundSend.mp3'); // Ruta al archivo de sonido
        console.log('se escuchó el audio!')
        audio.play();
    }

    // Función para reproducir el sonido
    function playSoundPersonEnterChannel() {
        var audio = new Audio('/static/sounds/soundPersonEnter.mp3'); // Ruta al archivo de sonido
        console.log('se escuchó el audio!')
        audio.play();
    }

    // Función para reproducir el sonido
    function playSoundReceive() {
        var audio = new Audio('/static/sounds/soundRecieve.mp3'); // Ruta al archivo de sonido
        console.log('se escuchó el audio!')
        audio.play();
    }


    let lastroom = null; // Con esta variable podremos al macenar la sala anterior a la hora de realizar un cambio de sala
    statusFrontEndChat = null;

    // Con esto cargaremos la lista de canales a la hora de cargar la página
    document.addEventListener("DOMContentLoaded", function () {
        let latestRoom = localStorage.getItem("lastestRoom")
        console.log(latestRoom)
        if (latestRoom !== null) {
            joinRoomBtn(latestRoom);
        }
        get_channels();


        ToEndButton();
    });

    // Creación de los canales
    function createChannel() {
        let room = document.getElementById("room").value.trim();

        var icon = document.getElementById('icon-room');

        var toast = new bootstrap.Toast(document.getElementById('toastStatus'))
        // Selecciono el id de los componentes de mi toastStatus
        var titleToast = document.getElementById('titleToast');
        var bodyToast = document.getElementById('bodyToast');

        socket.emit('create_channel', { 'room': room }, function (confirmation) {
            if (confirmation.status === 'created') {


                // Insertamos el texto a los componentes de mi toast
                titleToast.innerText = "La sala ha sido creada con éxito!"
                bodyToast.innerText = "Ahora a chatear chele"

                document.getElementById("room").value = '';
                toast.show();
                icon.classList.remove('activateIconChannel');

            }
            else if ((confirmation.status === 'noCreated')) {
                // Insertamos el texto a los componentes de mi toast
                titleToast.innerText = "La sala no se pudo crear"
                bodyToast.innerText = "No puedes crear salas repetidas"


                toast.show();
            }
            else {
                // Insertamos el texto a los componentes de mi toast
                titleToast.innerText = "La sala no se pudo crear"
                bodyToast.innerText = "¿Cómo quieres crear una sala sin nombre?"


                toast.show();

            }
        });


    }

    function setupEmojilist() {
        const emojiSelectorIcon = document.getElementById('emojiSelectorIcon');
        const emojiSelector = document.getElementById('emojiSelector');
        const emojiList = document.getElementById("emojiList");

        // Escuchador de eventos para el icono del selector de emojis
        emojiSelectorIcon.addEventListener('click', (event) => {
            emojiSelector.classList.toggle('active');
            event.stopPropagation(); // Previene que el evento se propague al documento
        });

        // Escuchador de eventos para el documento
        document.addEventListener('click', (event) => {
            // Si el clic no es dentro del emojiSelector o emojiSelectorIcon, cierra el emojiSelector
            if (!emojiSelector.contains(event.target) && event.target !== emojiSelectorIcon) {
                emojiSelector.classList.remove('active');
            }
        });


        fetch('https://emoji-api.com/emojis?access_key=43d52a40507c756a69edc32b10fef4fce1393d47')
            .then(res => res.json())
            .then(data => loadEmoji(data))


        function loadEmoji(data) {
            data.forEach(emoji => {
                let li = document.createElement('li');
                li.setAttribute('emoji-name', emoji.slug);
                li.textContent = emoji.character;
                // Añadir un escuchador de eventos para cada emoji
                li.addEventListener('click', () => {
                    const messageInput = document.getElementById('message');
                    messageInput.value += emoji.character; // Agrega el emoji al contenido del input
                });
                emojiList.appendChild(li);
            });
        }


        emojiSearch.addEventListener('keyup', e => {
            let value = e.target.value;
            let emojis = document.querySelectorAll('#emojiList li');
            emojis.forEach(emoji => {
                if (emoji.getAttribute('emoji-name').toLowerCase().includes(value)) {
                    emoji.style.display = 'flex';
                }
                else {
                    emoji.style.display = 'none';
                }
            })
        })
    }

    // Entraremos a una sala obteniendo su nombre de sala mediante su onclick
    function joinRoomBtn(room) {

        let rightSide = document.getElementById("rightSide");

        localStorage.setItem("statusFrontEndChat", true)


        if (localStorage.getItem("statusFrontEndChat")) {
            rightSide.innerHTML = ` <div class="header">
                <div class="imgText" id="title-channel">
                    <div class="userimg">
                        <img src="images/img1.jpg" alt="" class="cover">
                    </div>
                </div>
            </div>
    
            <!-- CHAT-BOX -->
            <div class="chatbox" id="chatbox">

                
                
            </div>
    
            <!-- CHAT INPUT -->
            <div class="chat_input">
                <li class="emoji-selector" id="emojiSelector">
                    <div class="input-container">
                        <input id="emojiSearch" type="text" placeholder="Buscar...">
                    </div>
                    <ul id="emojiList" class="emoji-list">
                        <!-- Los emojis se cargarán aquí -->
                    </ul>
                </li>
                <li id="emojiSelectorIcon">
                    <ion-icon name="happy-outline"></ion-icon>
                </li>
                <input type="text" placeholder="Escribe un mensaje" id="message" onkeyup="SendWithEnter(event)">
                <ion-icon class="IconMessage" id="icon-send" name="send" onclick="sendMessage()"></ion-icon>
            </div>
            `;
            setupEmojilist();
        }


        // Si existe una sala, nos saldremos
        if (lastroom) {
            leaveRoom();
        }

        // Entramos a la sala esperando una confirmación del backend
        // para luego cargar la lista de mensajes de esa sala
        socket.emit('joinBtn', { 'room': room }, function (confirmation) {

            let username = document.getElementById("userName").value
            console.log(username)

            if (confirmation.status === 'joined') {
                lastroom = room;
                localStorage.setItem("lastestRoom", room)
                socket.emit('list_messages', { 'room': room });



            }
        });
    }

    socket.on('joinChannelStatus', function (data) {
        let chatbox = document.getElementById("chatbox");
        let user = data.userName; // Asegúrate de que el servidor envía el nombre de usuario con el evento
        let message = `${user} se ha dejado caer del techo como un alacrán!`;
        let frontendRoom = document.getElementById("title-channelinChat").innerText;
        console.log("debería de imprimir el aviso");
        console.log(data.room);
        console.log(frontendRoom);

        if (data.room === frontendRoom) {
            chatbox.innerHTML += `
        <div class="custom_tooltip">
            <div class="content">
                <p>${message}</p>
            </div>
        </div>
        `;
            playSoundPersonEnterChannel();
        }
    });




    // Función para salir de la sala
    function leaveRoom() {
        let room = document.getElementById("room").value;
        socket.emit('leave', { 'room': room });
        lastroom = null;

    }

    // Con esta función le enviarmeos al backend la petición de cargar la lista de los canales 
    function get_channels() {
        socket.emit('get_channels');
    }

    // Con esta función le enviaremos al backend la petición de cargar los mensajes
    function get_messages() {
        let room = document.getElementById("btnRoom").value;
        socket.emit('get_messages', { 'room': room })
    }

    // Función para poder enviar mensajes desde el input con la tecla enter
    function SendWithEnter(event) {
        var input = document.getElementById('message');
        var icon = document.getElementById('icon-send');

        // Verificar si el input está vacío y actualizar la clase del ícono
        if (input.value.trim() !== '') {
            icon.classList.add('activateIconMessage');
        } else {
            icon.classList.remove('activateIconMessage');
        }

        // Envía el mensaje si la tecla presionada es 'Enter'
        if (event.key === 'Enter') {
            sendMessage();
        }
    }

    function statusColorIconChannel(event) {
        var input = document.getElementById('room');
        var icon = document.getElementById('icon-room');

        // Verificar si el input está vacío y actualizar la clase del ícono
        if (input.value.trim() !== '') {
            icon.classList.add('activateIconChannel');
        } else {
            icon.classList.remove('activateIconChannel');
        }

        // Envía el mensaje si la tecla presionada es 'Enter'
        if (event.key === 'Enter') {
            createChannel();
        }
    }



    // Función para enviar mensaje, mandando los datos del mensaje al backend
    function sendMessage() { // ACÁ ESTÁS ERROR
        let room = document.getElementById("title-channelinChat").innerText;
        let message = document.getElementById("message").value.trim();
        let icon = document.getElementById('icon-send');

        if (message) {
            socket.emit('message', { 'room': room, 'message': message });
            document.getElementById("message").value = '';

            // Remover la clase del ícono ya que el input está vacío
            icon.classList.remove('activateIconMessage');
        }


    }


    // Recibiendo del backend la creación de un nuevo canal e insertarlo en el HTML
    socket.on('new_channel', function (data) {
        let channels = document.getElementById("chatlist");
        channels.innerHTML = "";

        // Esto se encarga de insertar el nombre del canal y además crear una función en cada div del canal,
        //para luego de hacer un evento on click se pueda unir a el
        data.forEach(function (channel) {
            channels.innerHTML += `
                <div class="block unread" id="btnRoom" onclick="joinRoomBtn('${channel}')">
                    <div class="details">
                        <div class="listHead">
                            <h4 id="div-channel">${channel}</h4>
                        </div>
                    </div>
                </div>`;
        });


    });

    // Esta función de enviar una petición al backend la lista de mensajes de una sala
    function list_messages() {
        socket.emit('list_messages')
    }


    function closeSession() {
        socket.emit('closeSession')
    }


    // Con esta recibimos del backend el nombre de la sala en la que entramos
    // y la insertamos en el HTML el titulo
    socket.on('status', function (data) {
        let titleChannel = document.getElementById("title-channel");
        titleChannel.innerHTML = '<h4 id="title-channelinChat">' + data + '</h4>';
    });

    // Objeto para almacenar los colores de los usuarios
    let userColors = {};

    // Paleta de colores legibles para los titulos de los nombres
    let readableColors = [
        '#e6194b', // Rojo Brillante
        '#3cb44b', // Verde Brillante
        '#ffe119', // Amarillo
        '#4363d8', // Azul Fuerte
        '#f58231', // Naranja
        '#911eb4', // Púrpura
        '#20b2aa', // Turquesa Oscuro
        '#f032e6', // Fucsia
        '#6a9c02', // Verde Lima Oscuro
        '#fa8072', // Salmón
        '#008080', // Teal
        '#aa7eff', // Lavanda
        '#9a6324', // Marrón
        '#a0a0a0', // Gris Claro
        '#800000', // Granate
        '#aaffc3', // Menta Claro
        '#808000', // Oliva
        '#ffd8b1', // Melocotón
        '#000075', // Azul Marino
        '#404040', // Gris Oscuro
        '#000000', // Negro
        '#0056b3', // Azul Zafiro
    ];


    function getRandomColor() {
        // Función para seleccionar un color aleatorio de la paleta

        // Con math.floor truncamos el valor de los decimales
        // Luego math.random hacemos decimales aleatorios de 0 a 1 osea 0.55
        // Multiplicamos eso por la cantidad de paletas de colores que hay
        let index = Math.floor(Math.random() * readableColors.length);


        // retornamos la paleta de color del arreglo readableColors en la posición de nuestra operación
        return readableColors[index];
    }

    function assignUserColor(userName) {
        // Si el usuario no tiene un color, se le asigna uno
        if (!userColors[userName]) {
            userColors[userName] = getRandomColor();
        }


        // si si lo tiene, simplemente retornamos el color nombre de usuario asociado
        console.log(userColors)
        return userColors[userName];
    }


    // Recibimos del backend la lista de mensajes para esa sala y luego la insertaremos en el HTML
    socket.on('list_messages', function (data) {
        ToEndButton();
        console.log(data);
        let user_name = document.getElementById("userName").innerText;
        let chatbox = document.getElementById("chatbox");

        data.forEach(function (datas) {
            let color = assignUserColor(datas.user);
            // Validando si el usuario es el que envió esos mensajes para cambiar el nombre de su clase
            if (datas.user === user_name) {
                chatbox.innerHTML += `
                <div class="message my_msg">
                    <p>${datas.msg}<br><span>${datas.datetime}</span></p>
                </div>
            `;
            }
            // Si no es el usuario le cambiamos el nombre a la clase para hacer ver que es invitado
            else {
                chatbox.innerHTML += `
                <div class="message friend_msg">
                    <p><b style="color:${color};">${datas.user}</b><br>${datas.msg}<br><span>${datas.datetime}</span></p>
                </div>
            `;
            }
        });






    });

    // Recibimos del backend el mensaje en tiempo real que se acaba de enviar al canal
    socket.on('message', function (data) {
        let user_name = document.getElementById("userName").innerText;
        let chatbox = document.getElementById("chatbox")

        let color = assignUserColor(data.user);

        // Se realiza la validación si es el usuario que ha iniciado sesión 
        //para cambiar el nobmre de su clase en el HTML que se insertará
        if (data.user === user_name) {
            chatbox.innerHTML += `
            <div class="message my_msg">
                <p>${data.msg}<br><span>${data.datetime}</span></p>
            </div>
        `;
            // Desplaza la vista al último mensaje
            chatbox.scrollTop = chatbox.scrollHeight;
            // Función para reproducir el sonido
            playSoundSend();
        }


        else {

            // Calcula si estamos cerca del fondo antes de agregar el nuevo mensaje
            const isNearBottom = chatbox.scrollTop + chatbox.clientHeight >= chatbox.scrollHeight - 100;

            // Añade tu nuevo mensaje al chatbox aquí
            chatbox.innerHTML += `
            <div class="message friend_msg">
                <p><b style="color:${color};">${data.user}</b><br>${data.msg}<br><span>${data.datetime}</span></p>
            </div>
        `;

            // Si estábamos cerca del fondo, nos desplazamos al nuevo fondo
            if (isNearBottom) {
                chatbox.scrollTop = chatbox.scrollHeight;
            }





            if (isWindowFocused) {
                playSoundReceive();
            }


        }

        if (!isWindowFocused) {
            playSound();
        }

    });

    // Función que recibe del backend que se salío del canal
    socket.on('leave_channel', function () {
        let chatbox = document.getElementById("chatbox")
        chatbox.innerHTML = '';
    });

