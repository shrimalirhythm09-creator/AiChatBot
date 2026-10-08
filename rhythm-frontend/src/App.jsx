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
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message = input) => {
    if (!message.trim() || loading) return;

    // Show user message
    setMessages((previous) => [
      ...previous,
      {
        text: message,
        sender: "user",
      },
    ]);

    setInput("");
    setLoading(true);

    try {
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

      // Check if browser supports streaming response
      if (!response.body) {
        throw new Error("Streaming is not supported by this response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Create an empty bot message first
      setMessages((previous) => [
        ...previous,
        {
          text: "",
          sender: "bot",
        },
      ]);

      let botMessage = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        // Convert received bytes to text
        const chunk = decoder.decode(value, { stream: true });

        botMessage += chunk;

        // Update the last bot message as chunks arrive
        setMessages((previous) => {
          const updatedMessages = [...previous];

          updatedMessages[updatedMessages.length - 1] = {
            text: botMessage,
            sender: "bot",
          };

          return updatedMessages;
        });
      }

      // Flush any remaining decoder data
      botMessage += decoder.decode();

      setMessages((previous) => {
        const updatedMessages = [...previous];

        updatedMessages[updatedMessages.length - 1] = {
          text: botMessage,
          sender: "bot",
        };

        return updatedMessages;
      });
    } catch (error) {
      console.error("Error:", error);

      setMessages((previous) => [
        ...previous,
        {
          text: "Sorry, I couldn't connect to the server.",
          sender: "bot",
        },
      ]);
    } finally {
      setLoading(false);
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

          {loading && (
            <div className="message-row bot">
              <div className="message">
                <span className="typing">● ● ●</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Buttons */}
        <div className="quick-buttons">

          <button
            onClick={() => sendMessage("Track Order")}
            disabled={loading}
          >
            Track Order
          </button>

          <button
            onClick={() => sendMessage("Cancel Order")}
            disabled={loading}
          >
            Cancel Order
          </button>

          <button
            onClick={() => sendMessage("Refund")}
            disabled={loading}
          >
            Refund
          </button>

          <button
            onClick={() => sendMessage("Missing Item")}
            disabled={loading}
          >
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
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? "..." : "Send"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default App;

