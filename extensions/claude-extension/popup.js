const API_KEY = process.env.ANTHROPIC_API_KEY || 'YOUR_API_KEY_HERE';

document.addEventListener('DOMContentLoaded', function() {
  const chatDiv = document.getElementById('chat');
  const input = document.getElementById('input');
  const sendBtn = document.getElementById('send');

  function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
    messageDiv.textContent = content;
    chatDiv.appendChild(messageDiv);
    chatDiv.scrollTop = chatDiv.scrollHeight;
  }

  async function sendToClaude(message) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: message
          }]
        })
      });

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      return 'เกิดข้อผิดพลาด: ' + error.message;
    }
  }

  async function handleSend() {
    const message = input.value.trim();
    if (!message) return;

    addMessage(message, true);
    input.value = '';
    
    const response = await sendToClaude(message);
    addMessage(response);
  }

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') handleSend();
  });
});