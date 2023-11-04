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