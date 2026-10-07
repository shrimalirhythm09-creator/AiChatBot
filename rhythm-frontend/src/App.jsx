import { useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([
    {
      text: "Hi! I'm Rhythm. How can I help you with your food order?",
      sender: "bot",
    },
  ]);

  const [input, setInput] = useState("");

  const sendMessage = async (message = input) => {
    if (!message.trim()) return;

    // Show user message
    setMessages((previous) => [
      ...previous,
      {
        text: message,
        sender: "user",
      },
    ]);

    setInput("");

    try {
      // Send message to Spring Boot
      const response = await fetch("http://localhost:8083/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: message,
      });

      if (!response.ok) {
        throw new Error("Backend request failed");
      }

      // Get AI response from backend
      const botResponse = await response.text();

      // Show bot response
      setMessages((previous) => [
        ...previous,
        {
          text: botResponse,
          sender: "bot",
        },
      ]);
    } catch (error) {
      console.error("Error:", error);

      setMessages((previous) => [
        ...previous,
        {
          text: "Sorry, I couldn't connect to the server.",
          sender: "bot",
        },
      ]);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  return (
      <div className="app">
        <div className="chat-container">

          {/* Header */}
          <div className="header">
            <div className="logo">R</div>

            <div>
              <h2>Rhythm</h2>
              <p>Food Delivery Support</p>
            </div>

            <span className="online">● Online</span>
          </div>

          {/* Messages */}
          <div className="messages">
            {messages.map((message, index) => (
                <div
                    key={index}
                    className={`message-row ${message.sender}`}
                >
                  <div className="message">
                    {message.text}
                  </div>
                </div>
            ))}
          </div>

          {/* Quick Buttons */}
          <div className="quick-buttons">

            <button onClick={() => sendMessage("Track Order")}>
              Track Order
            </button>

            <button onClick={() => sendMessage("Cancel Order")}>
              Cancel Order
            </button>

            <button onClick={() => sendMessage("Refund")}>
              Refund
            </button>

            <button onClick={() => sendMessage("Missing Item")}>
              Missing Item
            </button>

          </div>

          {/* Input */}
          <form className="input-area" onSubmit={handleSubmit}>

            <input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
            />

            <button type="submit">
              Send
            </button>

          </form>

        </div>
      </div>
  );
}

export default App;