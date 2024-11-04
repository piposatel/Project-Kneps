// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCwHS-7ld1gCVZGxAdYq9BN2siv3armZ4E",
    authDomain: "project-kneps.firebaseapp.com",
    databaseURL: "https://project-kneps-default-rtdb.firebaseio.com",
    projectId: "project-kneps",
    storageBucket: "project-kneps.appspot.com",
    messagingSenderId: "855207133317",
    appId: "1:855207133317:web:55a87c22e7eb80c317e9ec",
    measurementId: "G-7NYX9KTM38"
  };
  
  // Initialiser Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Référence à la base de données
  const database = firebase.database();
  
  // Éléments du DOM
  const loginButton = document.getElementById('login-button');
  const postForm = document.getElementById('post-form');
  const postButton = document.getElementById('post-button');
  const messageInput = document.getElementById('message-input');
  const visitorLoginButton = document.getElementById('visitor-login-button');
  const visitorUsernameInput = document.getElementById('visitor-username');
  const messagesContainer = document.getElementById('messages-container');
  
  let visitorUsername = localStorage.getItem('visitorUsername') || '';
  
  // Gestion de la connexion administrateur
  loginButton.addEventListener('click', () => {
    // Simuler une connexion administrateur
    loginButton.style.display = 'none';
    postForm.style.display = 'block';
  });
  
  // Publier un message
  postButton.addEventListener('click', () => {
    const message = messageInput.value;
    if (message.trim() !== '') {
      // Envoyer le message à Firebase
      const messagesRef = database.ref('messages');
      const newMessageRef = messagesRef.push();
      newMessageRef.set({
        text: message,
        timestamp: Date.now()
      });
      messageInput.value = '';
    }
  });
  
  // Gestion de l'identification du visiteur
  if (visitorUsername) {
    document.getElementById('visitor-login').style.display = 'none';
  }
  
  visitorLoginButton.addEventListener('click', () => {
    visitorUsername = visitorUsernameInput.value.trim();
    if (visitorUsername !== '') {
      localStorage.setItem('visitorUsername', visitorUsername);
      document.getElementById('visitor-login').style.display = 'none';
    }
  });
  
  // Fonction pour afficher un message
  function displayMessage(data) {
    const messageData = data.val();
    const messageKey = data.key;
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `
      <p>${messageData.text}</p>
      <button class="react-button" data-id="${messageKey}">Réagir</button>
      <div class="reactions" id="reactions-${messageKey}"></div>
    `;
    messagesContainer.prepend(messageElement);
  
    // Gérer les réactions
    const reactButton = messageElement.querySelector('.react-button');
    reactButton.addEventListener('click', () => {
      if (!visitorUsername) {
        alert("Veuillez vous identifier pour réagir.");
        return;
      }
      const reactionText = prompt("Votre réaction (25 mots max) :");
      if (reactionText && reactionText.split(' ').length <= 25) {
        const reactionsRef = database.ref(`reactions/${messageKey}`);
        reactionsRef.push({
          username: visitorUsername,
          text: reactionText
        });
      } else {
        alert("Votre réaction dépasse la limite de 25 mots.");
      }
    });
  
    // Écouter les réactions pour ce message
    const reactionsRef = database.ref(`reactions/${messageKey}`);
    const reactionsContainer = messageElement.querySelector(`#reactions-${messageKey}`);
    reactionsRef.on('child_added', (reactionData) => {
      const reaction = reactionData.val();
      const reactionElement = document.createElement('div');
      reactionElement.classList.add('reaction');
      reactionElement.innerHTML = `<strong>${reaction.username} :</strong> ${reaction.text}`;
      reactionsContainer.appendChild(reactionElement);
    });
  }
  
  // Écouter les nouveaux messages ajoutés à Firebase
  const messagesRef = database.ref('messages');
  messagesRef.on('child_added', (data) => {
    displayMessage(data);
  });