// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCwHS-7ld1gCVZGxAdYq9BN2siv3armZ4E",
    authDomain: "project-kneps.firebaseapp.com",
    databaseURL: "https://project-kneps-default-rtdb.europe-west1.firebasedatabase.app",
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
  
  // Global Reference to Messages
  const messagesRef = database.ref('messages');
  
  // DOM Elements
  const loginSelection = document.getElementById('login-selection');
  const loginAdminButton = document.getElementById('login-admin-button');
  const loginGuestButton = document.getElementById('login-guest-button');
  
  const adminLogin = document.getElementById('admin-login');
  const adminPasswordInput = document.getElementById('admin-password');
  const adminLoginSubmit = document.getElementById('admin-login-submit');
  const adminLoginBack = document.getElementById('admin-login-back');
  const adminPanel = document.getElementById('admin-panel');
  const postButton = document.getElementById('post-button');
  const messageInput = document.getElementById('message-input');
  const adminLogoutButton = document.getElementById('admin-logout-button');
  
  const guestLogin = document.getElementById('guest-login');
  const guestUsernameInput = document.getElementById('guest-username');
  const guestLoginSubmit = document.getElementById('guest-login-submit');
  const guestLoginBack = document.getElementById('guest-login-back');
  const guestPanel = document.getElementById('guest-panel');
  const guestLogoutButton = document.getElementById('guest-logout-button');
  
  const passwordError = document.getElementById('password-error');
  const passwordErrorOkButton = document.getElementById('password-error-ok');
  
  const messagesContainer = document.getElementById('messages-container');
  const reactionError = document.getElementById('reaction-error');
  const reactionErrorClose = document.getElementById('reaction-error-close');
  const reactionErrorOkButton = document.getElementById('reaction-error-ok');
  
  const confirmationDialog = document.getElementById('confirmation-dialog');
  const confirmationMessage = document.getElementById('confirmation-message');
  const confirmDeleteButton = document.getElementById('confirm-delete-button');
  const cancelDeleteButton = document.getElementById('cancel-delete-button');
  const confirmationDialogClose = document.getElementById('confirmation-dialog-close');
  
  const titleBarText = document.getElementById('title-bar-text');
  
  let userType = null; // 'admin' or 'guest'
  let visitorUsername = localStorage.getItem('visitorUsername') || '';
  let pendingDelete = null;
  
  // Login Selection
  loginAdminButton.addEventListener('click', () => {
    loginSelection.style.display = 'none';
    adminLogin.style.display = 'block';
  });
  
  loginGuestButton.addEventListener('click', () => {
    loginSelection.style.display = 'none';
    guestLogin.style.display = 'block';
  });
  
  // Admin Login
  adminLoginSubmit.addEventListener('click', () => {
    const enteredPassword = adminPasswordInput.value;
    if (enteredPassword === 'knepskneps123') {
      // Correct password, show admin panel
      userType = 'admin';
      adminLogin.style.display = 'none';
      adminPanel.style.display = 'block';
      titleBarText.textContent = 'Kneps The Menace';
      // Reload messages to show edit and delete buttons
      loadMessages();
    } else {
      // Show custom error message
      passwordError.style.display = 'block';
    }
  });
  
  // Admin Login Back Button
  adminLoginBack.addEventListener('click', () => {
    adminLogin.style.display = 'none';
    loginSelection.style.display = 'block';
  });
  
  // Admin Logout
  adminLogoutButton.addEventListener('click', () => {
    userType = null;
    adminPanel.style.display = 'none';
    loginSelection.style.display = 'block';
    titleBarText.textContent = 'Kneps The Menace';
    // Reload messages to hide edit and delete buttons
    loadMessages();
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
      const newMessageRef = messagesRef.push();
      newMessageRef.set({
        text: message,
        timestamp: Date.now()
      });
      messageInput.value = '';
    }
  });
  
  // Guest Login
  guestLoginSubmit.addEventListener('click', () => {
    visitorUsername = guestUsernameInput.value.trim();
    if (visitorUsername !== '') {
      localStorage.setItem('visitorUsername', visitorUsername);
      userType = 'guest';
      guestLogin.style.display = 'none';
      guestPanel.style.display = 'block';
      titleBarText.textContent = `Kneps The Menace - Hello ${visitorUsername}`;
      // Reload messages to show delete buttons for the guest's reactions
      loadMessages();
    }
  });
  
  // Guest Login Back Button
  guestLoginBack.addEventListener('click', () => {
    guestLogin.style.display = 'none';
    loginSelection.style.display = 'block';
  });
  
  // Guest Logout
  guestLogoutButton.addEventListener('click', () => {
    userType = null;
    visitorUsername = '';
    localStorage.removeItem('visitorUsername');
    guestPanel.style.display = 'none';
    loginSelection.style.display = 'block';
    titleBarText.textContent = 'Kneps The Menace';
    // Reload messages to hide delete buttons for the guest's reactions
    loadMessages();
  });
  
  // Function to display a message
  function displayMessage(data) {
    const messageData = data.val();
    const messageKey = data.key;
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.setAttribute('data-message-key', messageKey);
  
    // Build message content
    let messageContent = `
      <div class="message-content">
        <p class="message-text">${messageData.text}</p>
      </div>
      <button class="react-button" data-id="${messageKey}">React</button>
    `;
  
    // If user is admin, add edit and delete buttons
    if (userType === 'admin') {
      messageContent += `
        <button class="edit-button" data-id="${messageKey}">Edit</button>
        <button class="delete-button" data-id="${messageKey}">Delete</button>
      `;
    }
  
    // Add reaction form and reactions container
    messageContent += `
      <!-- Reaction Form -->
      <div class="reaction-form" id="reaction-form-${messageKey}" style="display: none;">
        <textarea id="reaction-input-${messageKey}" rows="2" placeholder="Your reaction (max 25 words)"></textarea><br>
        <button class="submit-reaction-button" data-id="${messageKey}">Submit</button>
      </div>
      <div class="reactions" id="reactions-${messageKey}"></div>
    `;
  
    messageElement.innerHTML = messageContent;
    messagesContainer.prepend(messageElement);
  
    // Handle reactions
    const reactButton = messageElement.querySelector('.react-button');
    const reactionForm = messageElement.querySelector(`#reaction-form-${messageKey}`);
    const reactionInput = messageElement.querySelector(`#reaction-input-${messageKey}`);
    const submitReactionButton = messageElement.querySelector('.submit-reaction-button');
  
    reactButton.addEventListener('click', () => {
      if (userType !== 'guest') {
        // Show custom error message
        showReactionError("Please log in as a guest to react.");
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
  
    reactionsRef.off(); // Clear previous listeners
  
    reactionsRef.on('child_added', (reactionData) => {
      displayReaction(reactionData, reactionsContainer, messageKey);
    });
  
    reactionsRef.on('child_removed', (reactionData) => {
      const reactionKey = reactionData.key;
      const reactionElement = reactionsContainer.querySelector(`[data-reaction-key="${reactionKey}"]`);
      if (reactionElement) {
        reactionElement.remove();
      }
    });
  
    // Handle edit if admin
    const editButton = messageElement.querySelector('.edit-button');
    if (editButton) {
      editButton.addEventListener('click', () => {
        const messageContentDiv = messageElement.querySelector('.message-content');
        const messageTextElement = messageElement.querySelector('.message-text');
        const currentText = messageTextElement.textContent;
  
        // Create edit form
        const editForm = document.createElement('div');
        editForm.classList.add('edit-form');
        editForm.innerHTML = `
          <textarea class="edit-input" rows="2">${currentText}</textarea><br>
          <button class="save-edit-button">Save</button>
          <button class="cancel-edit-button">Cancel</button>
        `;
  
        // Replace message content with edit form
        messageContentDiv.replaceWith(editForm);
  
        const editInput = editForm.querySelector('.edit-input');
        const saveEditButton = editForm.querySelector('.save-edit-button');
        const cancelEditButton = editForm.querySelector('.cancel-edit-button');
  
        // Handle save edit
        saveEditButton.addEventListener('click', () => {
          const newText = editInput.value.trim();
          if (newText !== '') {
            // Update the message in Firebase
            database.ref(`messages/${messageKey}`).update({
              text: newText
            });
            // Replace edit form with updated message content
            const newMessageContent = document.createElement('div');
            newMessageContent.classList.add('message-content');
            newMessageContent.innerHTML = `<p class="message-text">${newText}</p>`;
            editForm.replaceWith(newMessageContent);
          }
        });
  
        // Handle cancel edit
        cancelEditButton.addEventListener('click', () => {
          // Replace edit form with original message content
          editForm.replaceWith(messageContentDiv);
        });
      });
    }
  
    // Handle delete if admin
    const deleteButton = messageElement.querySelector('.delete-button');
    if (deleteButton) {
      deleteButton.addEventListener('click', () => {
        showConfirmationDialog("Are you sure you want to delete this post?", () => {
          // Remove message from Firebase
          database.ref(`messages/${messageKey}`).remove();
          // Remove reactions associated with the message
          database.ref(`reactions/${messageKey}`).remove();
          // Remove message element from DOM
          messageElement.remove();
        });
      });
    }
  }
  
  // Function to display a reaction
  function displayReaction(reactionData, reactionsContainer, messageKey) {
    const reaction = reactionData.val();
    const reactionKey = reactionData.key;
    const reactionElement = document.createElement('div');
    reactionElement.classList.add('reaction');
    reactionElement.setAttribute('data-reaction-key', reactionKey);
  
    let reactionContent = `<strong>${reaction.username}:</strong> ${reaction.text}`;
  
    // If the user is the author of the reaction and is logged in, add delete button
    if (userType === 'guest' && reaction.username === visitorUsername) {
      reactionContent += ` <button class="delete-reaction-button" data-id="${reactionKey}">Delete</button>`;
    }
  
    reactionElement.innerHTML = reactionContent;
    reactionsContainer.appendChild(reactionElement);
  
    // Handle deleting own reaction
    if (userType === 'guest' && reaction.username === visitorUsername) {
      const deleteReactionButton = reactionElement.querySelector('.delete-reaction-button');
      deleteReactionButton.addEventListener('click', () => {
        showConfirmationDialog("Are you sure you want to delete your reaction?", () => {
          database.ref(`reactions/${messageKey}/${reactionKey}`).remove();
          reactionElement.remove();
        });
      });
    }
  }
  
  // Function to load messages
  function loadMessages() {
    messagesContainer.innerHTML = '';
    messagesRef.off(); // Remove previous listeners
  
    messagesRef.on('child_added', (data) => {
      displayMessage(data);
    });
  
    messagesRef.on('child_changed', (data) => {
      const messageKey = data.key;
      const messageData = data.val();
      const messageElement = document.querySelector(`[data-message-key="${messageKey}"]`);
      if (messageElement) {
        const messageTextElement = messageElement.querySelector('.message-text');
        messageTextElement.textContent = messageData.text;
      }
    });
  
    messagesRef.on('child_removed', (data) => {
      const messageKey = data.key;
      const messageElement = document.querySelector(`[data-message-key="${messageKey}"]`);
      if (messageElement) {
        messageElement.remove();
      }
    });
  }
  
  // Initial load of messages
  loadMessages();
  
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
  
  // Function to show confirmation dialog
  function showConfirmationDialog(message, onConfirm) {
    confirmationMessage.textContent = message;
    confirmationDialog.style.display = 'block';
    pendingDelete = onConfirm;
  }
  
  // Handle Confirmation Dialog Buttons
  confirmDeleteButton.addEventListener('click', () => {
    if (pendingDelete) {
      pendingDelete();
      pendingDelete = null;
    }
    confirmationDialog.style.display = 'none';
  });
  
  cancelDeleteButton.addEventListener('click', () => {
    pendingDelete = null;
    confirmationDialog.style.display = 'none';
  });
  
  confirmationDialogClose.addEventListener('click', () => {
    pendingDelete = null;
    confirmationDialog.style.display = 'none';
  });
  // Handle Desktop Icon Clicks
document.addEventListener('DOMContentLoaded', function() {
    const icons = document.querySelectorAll('.desktop .icon');
    icons.forEach(icon => {
      icon.addEventListener('dblclick', function() {
        const app = this.getAttribute('data-app');
        if (app === 'photo-knefe') {
          const windowElement = document.getElementById('photo-knefe-window');
          windowElement.style.display = 'block';
        }
      });
    });
  
    // Close button for Photo Knefe window
    const photoKnefeWindow = document.getElementById('photo-knefe-window');
    const closeButton = photoKnefeWindow.querySelector('.close-button');
    closeButton.addEventListener('click', function() {
      photoKnefeWindow.style.display = 'none';
    });
  });