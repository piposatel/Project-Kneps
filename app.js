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
  const passwordPrompt = document.getElementById('password-prompt');
  const adminPasswordInput = document.getElementById('admin-password');
  const passwordSubmitButton = document.getElementById('password-submit');
  const passwordError = document.getElementById('password-error');
  const passwordErrorOkButton = document.getElementById('password-error-ok');
  const postForm = document.getElementById('post-form');
  const postButton = document.getElementById('post-button');
  const messageInput = document.getElementById('message-input');
  const visitorLoginButton = document.getElementById('visitor-login-button');
  const visitorUsernameInput = document.getElementById('visitor-username');
  const messagesContainer = document.getElementById('messages-container');
  const reactionError = document.getElementById('reaction-error');
  const reactionErrorClose = document.getElementById('reaction-error-close');
  const reactionErrorOkButton = document.getElementById('reaction-error-ok');
  
  let visitorUsername = localStorage.getItem('visitorUsername') || '';
  
  // Admin Login
  loginButton.addEventListener('click', () => {
    // Show password prompt
    loginButton.style.display = 'none';
    passwordPrompt.style.display = 'block';
  });
  
  // Handle Admin Password Submission
  passwordSubmitButton.addEventListener('click', () => {
    const enteredPassword = adminPasswordInput.value;
    if (enteredPassword === 'knepskneps123') {
      // Correct password, show post form
      passwordPrompt.style.display = 'none';
      postForm.style.display = 'block';
    } else {
      // Show custom error message
      passwordError.style.display = 'block';
    }
  });
  
  // Handle Password Error OK Button
  passwordErrorOkButton.addEventListener('click', () => {
    passwordError.style.display = 'none';
    adminPasswordInput.value = '';
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
      <!-- Reaction Form -->
      <div class="reaction-form" id="reaction-form-${messageKey}" style="display: none;">
        <textarea id="reaction-input-${messageKey}" rows="2" placeholder="Your reaction (max 25 words)"></textarea><br>
        <button class="submit-reaction-button" data-id="${messageKey}">Submit</button>
      </div>
      <div class="reactions" id="reactions-${messageKey}"></div>
    `;
    messagesContainer.prepend(messageElement);
  
    // Handle reactions
    const reactButton = messageElement.querySelector('.react-button');
    const reactionForm = messageElement.querySelector(`#reaction-form-${messageKey}`);
    const reactionInput = messageElement.querySelector(`#reaction-input-${messageKey}`);
    const submitReactionButton = messageElement.querySelector('.submit-reaction-button');
  
    reactButton.addEventListener('click', () => {
      if (!visitorUsername) {
        // Show custom error message
        showReactionError("Please sign in to react.");
        return;
      }
      // Toggle reaction form visibility
      if (reactionForm.style.display === 'none') {
        reactionForm.style.display = 'block';
      } else {
        reactionForm.style.display = 'none';
      }
    });
  
    // Handle submitting a reaction
    submitReactionButton.addEventListener('click', () => {
      const reactionText = reactionInput.value.trim();
      if (reactionText && reactionText.split(' ').length <= 25) {
        const reactionsRef = database.ref(`reactions/${messageKey}`);
        reactionsRef.push({
          username: visitorUsername,
          text: reactionText
        });
        reactionInput.value = '';
        reactionForm.style.display = 'none';
      } else {
        // Show custom error message
        showReactionError("Your reaction exceeds the 25-word limit.");
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
  
  // Function to show reaction error
  function showReactionError(message) {
    reactionError.querySelector('.window-body p').textContent = message;
    reactionError.style.display = 'block';
  }
  
  // Handle Reaction Error Close Button
  reactionErrorClose.addEventListener('click', () => {
    reactionError.style.display = 'none';
  });
  
  // Handle Reaction Error OK Button
  reactionErrorOkButton.addEventListener('click', () => {
    reactionError.style.display = 'none';
  });