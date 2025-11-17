(function () {
  const vscode = acquireVsCodeApi();

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    let currentMode = 'explain';
    let isWaitingForResponse = false;

    // Get DOM elements
    const conversationDiv = document.getElementById('conversation');
    const userInput = document.getElementById('userInput');
    const newSessionBtn = document.getElementById('newSessionBtn');
    const exportBtn = document.getElementById('exportBtn');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const codeIndicator = document.getElementById('codeIndicator');
    const clearCodeBtn = document.getElementById('clearCodeBtn');

    // Check if elements were found
    if (!newSessionBtn) {
      console.error('New Session button not found!');
      return;
    }

  // Mode button click handlers
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode');
      if (mode !== currentMode) {
        currentMode = mode;
        updateActiveModeButton();
        vscode.postMessage({
          type: 'changeMode',
          mode: mode
        });
      }
    });
  });

  function updateActiveModeButton() {
    modeButtons.forEach(btn => {
      if (btn.getAttribute('data-mode') === currentMode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Send message handler
  function sendMessage() {
    const message = userInput.value.trim();
    if (!message || isWaitingForResponse) return;

    // Add user message to conversation
    addMessage('user', message);

    // Clear input
    userInput.value = '';

    // Show loading state
    isWaitingForResponse = true;
    userInput.disabled = true;
    userInput.placeholder = 'Thinking...';

    // Send to extension
    vscode.postMessage({
      type: 'sendMessage',
      message: message
    });
  }

  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // New session handler - direct clear, no confirmation
  newSessionBtn.addEventListener('click', () => {
    vscode.postMessage({
      type: 'newSession'
    });
  });

  // Export handler
  exportBtn.addEventListener('click', () => {
    vscode.postMessage({
      type: 'exportConversation'
    });
  });

  // Clear code selection handler
  clearCodeBtn.addEventListener('click', () => {
    codeIndicator.style.display = 'none';
    vscode.postMessage({
      type: 'clearCodeSelection'
    });
  });

  // Add message to conversation
  function addMessage(role, content) {
    // Remove welcome message if it exists
    const welcomeMessage = conversationDiv.querySelector('.welcome-message');
    if (welcomeMessage) {
      welcomeMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const headerDiv = document.createElement('div');
    headerDiv.className = 'message-header';
    headerDiv.textContent = role === 'user' ? 'You' : 'Socretes';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    // Format content with code blocks
    contentDiv.innerHTML = formatMessage(content);

    messageDiv.appendChild(headerDiv);
    messageDiv.appendChild(contentDiv);
    conversationDiv.appendChild(messageDiv);

    // Scroll to bottom
    conversationDiv.scrollTop = conversationDiv.scrollHeight;
  }

  // Format message content with markdown-like syntax
  function formatMessage(content) {
    // Convert code blocks
    content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || '';
      return `<div class="code-block">
        ${language ? `<div class="code-language">${language}</div>` : ''}
        <pre><code>${escapeHtml(code.trim())}</code></pre>
      </div>`;
    });

    // Convert inline code
    content = content.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Convert bold
    content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Convert line breaks
    content = content.replace(/\n/g, '<br>');

    return content;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Handle messages from extension
  window.addEventListener('message', event => {
    const message = event.data;

    switch (message.type) {
      case 'conversationStarted':
        // Clear conversation
        conversationDiv.innerHTML = '';

        // Update mode
        currentMode = message.mode;
        updateActiveModeButton();

        // Add the initial AI message
        addMessage('assistant', message.message);

        // Focus input
        userInput.focus();
        break;

      case 'assistantMessage':
        // Add assistant response
        addMessage('assistant', message.message);

        // Reset input state
        isWaitingForResponse = false;
        userInput.disabled = false;
        userInput.placeholder = 'Type your response here (Press Enter to send, Shift+Enter for new line)...';

        // Focus input
        userInput.focus();
        break;

      case 'error':
        // Show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message error';
        errorDiv.innerHTML = `
          <div class="message-header">Error</div>
          <div class="message-content">${escapeHtml(message.message)}</div>
        `;
        conversationDiv.appendChild(errorDiv);
        conversationDiv.scrollTop = conversationDiv.scrollHeight;

        // Reset input state
        isWaitingForResponse = false;
        userInput.disabled = false;
        userInput.placeholder = 'Type your response here (Press Enter to send, Shift+Enter for new line)...';
        break;

      case 'sessionCleared':
        conversationDiv.innerHTML = `
          <div class="welcome-message">
            <h3>New Session Started</h3>
            <p>Select some code and choose a mode to begin a new conversation.</p>
          </div>
        `;
        userInput.value = '';
        break;

      case 'modeChanged':
        currentMode = message.mode;
        updateActiveModeButton();
        break;

      case 'codeSelected':
        // Show indicator when code is selected
        codeIndicator.style.display = 'flex';
        userInput.placeholder = 'Ask a question about the selected code...';
        userInput.focus();
        break;

      case 'codeContextCleared':
        // Hide indicator when code context is cleared
        codeIndicator.style.display = 'none';
        userInput.placeholder = 'Select code in editor and type your question here...';
        break;
    }
  });

  // Initialize
  updateActiveModeButton();
  } // End of init function
})();
