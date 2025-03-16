const chatContainer = document.getElementById("chat-container");
const promptInput = document.getElementById("prompt");
const cityInput = document.getElementById("city");
const generateBtn = document.getElementById("generate-btn");
const clearBtn = document.getElementById("clear-btn");
const loadingSpinner = document.getElementById("loading-spinner");

let messages = [];

function renderMessages() {
  chatContainer.innerHTML = "";
  messages.forEach((msg) => {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("mb-4");

    if (msg.role === "user") {
      msgDiv.innerHTML = `<div class="flex justify-end"><div class="bg-blue-100 text-blue-900 p-3 rounded-lg max-w-sm"><p>${msg.content}</p></div></div>`;
    } else if (msg.role === "assistant") {
      msgDiv.innerHTML = `<div class="flex justify-start"><div class="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-sm"><p>${msg.content}</p></div></div>`;
    } else if (msg.role === "loading") {
      msgDiv.innerHTML = `<div class="flex justify-start"><div class="bg-black text-cyan-300 p-3 rounded-lg max-w-sm animate-pulse futuristic-loader"><p>⚙️ Generating response...</p></div></div>`;
    }

    chatContainer.appendChild(msgDiv);
  });
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function sendPrompt() {
  const prompt = promptInput.value.trim();
  const city = cityInput.value.trim();

  if (!prompt) return;

  messages.push({ role: "user", content: prompt });
  messages.push({ role: "loading" });
  renderMessages();

  loadingSpinner.classList.remove("hidden");

  try {
    const response = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, city }),
    });

    const data = await response.json();
    loadingSpinner.classList.add("hidden");

    // Remove loading message
    messages = messages.filter((msg) => msg.role !== "loading");

    if (data.error) {
      messages.push({ role: "assistant", content: `Error: ${data.error}` });
    } else {
      messages.push({ role: "assistant", content: data.completion });
    }
    renderMessages();
  } catch (err) {
    loadingSpinner.classList.add("hidden");
    messages = messages.filter((msg) => msg.role !== "loading");
    messages.push({ role: "assistant", content: `Error: ${err.message}` });
    renderMessages();
  }

  promptInput.value = "";
}

// Save messages to localStorage
function saveChatHistory() {
  localStorage.setItem("chatMessages", JSON.stringify(messages));
}

// Load messages from localStorage
function loadChatHistory() {
  const savedMessages = localStorage.getItem("chatMessages");
  if (savedMessages) {
    messages = JSON.parse(savedMessages);
    renderMessages();
  }
}

// Export chat history
function exportChat() {
  const blob = new Blob([JSON.stringify(messages, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "chat_history.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

generateBtn.addEventListener("click", () => {
  sendPrompt();
  saveChatHistory();
});

clearBtn.addEventListener("click", () => {
  messages = [];
  renderMessages();
  promptInput.value = "";
  cityInput.value = "";
  localStorage.removeItem("chatMessages");
});

document.addEventListener("DOMContentLoaded", loadChatHistory);
