// Firebase Configuration
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
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Reference to the database
  const database = firebase.database();
  
  // DOM Elements
  const loginButton = document.getElementById('login-button');
  const postForm = document.getElementById('post-form');
  const postButton = document.getElementById('post-button');
  const messageInput = document.getElementById('message-input');
  const visitorLoginButton = document.getElementById('visitor-login-button');
  const visitorUsernameInput = document.getElementById('visitor-username');
  const messagesContainer = document.getElementById('messages-container');
  
  let visitorUsername = localStorage.getItem('visitorUsername') || '';
  
  // Admin Login
  loginButton.addEventListener('click', () => {
    // Simulate admin login
    loginButton.style.display = 'none';
    postForm.style.display = 'block';
  });
  
  // Publish a Message
  postButton.addEventListener('click', () => {
    const message = messageInput.value;
    if (message.trim() !== '') {
      // Send message to Firebase
      const messagesRef = database.ref('messages');
      const newMessageRef = messagesRef.push();
      newMessageRef.set({
        text: message,
        timestamp: Date.now()
      });
      messageInput.value = '';
    }
  });
  
  // Visitor Login
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
  
  // Function to display a message
  function displayMessage(data) {
    const messageData = data.val();
    const messageKey = data.key;
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `
      <p>${messageData.text}</p>
      <button class="react-button" data-id="${messageKey}">React</button>
      <div class="reactions" id="reactions-${messageKey}"></div>
    `;
    messagesContainer.prepend(messageElement);
  
    // Handle reactions
    const reactButton = messageElement.querySelector('.react-button');
    reactButton.addEventListener('click', () => {
      if (!visitorUsername) {
        alert("Please sign in to react.");
        return;
      }
      const reactionText = prompt("Your reaction (max 25 words):");
      if (reactionText && reactionText.split(' ').length <= 25) {
        const reactionsRef = database.ref(`reactions/${messageKey}`);
        reactionsRef.push({
          username: visitorUsername,
          text: reactionText
        });
      } else {
        alert("Your reaction exceeds the 25-word limit.");
      }
    });
  
    // Listen for reactions to this message
    const reactionsRef = database.ref(`reactions/${messageKey}`);
    const reactionsContainer = messageElement.querySelector(`#reactions-${messageKey}`);
    reactionsRef.on('child_added', (reactionData) => {
      const reaction = reactionData.val();
      const reactionElement = document.createElement('div');
      reactionElement.classList.add('reaction');
      reactionElement.innerHTML = `<strong>${reaction.username}:</strong> ${reaction.text}`;
      reactionsContainer.appendChild(reactionElement);
    });
  }
  
  // Listen for new messages added to Firebase
  const messagesRef = database.ref('messages');
  messagesRef.on('child_added', (data) => {
    displayMessage(data);
  });