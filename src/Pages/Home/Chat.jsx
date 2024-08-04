import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
});

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [role, setRole] = useState(""); // To track if the user is 'creator' or 'receiver'

  const senderId = "user1"; // Replace with dynamic senderId

  useEffect(() => {
    if (chatId) {
      // Join the chat room with role
      socket.emit("joinRoom", JSON.stringify({ chatId, senderId, role }));

      // Listen for incoming messages
      socket.on("message", (chatMessage) => {
        setMessages((prevMessages) => [...prevMessages, chatMessage]);
      });

      // Clean up when component unmounts
      return () => {
        socket.disconnect();
      };
    }
  }, [chatId, senderId, role, roomCode, isChatOpen]);

  const createChatRoom = () => {
    const newChatId = Math.random().toString(36).substring(2, 8);
    setChatId(newChatId);
    setRoomCode(newChatId);
    setRole("creator");
    setIsChatOpen(true);
  };

  const joinChatRoom = () => {
    if (roomCode.trim()) {
      setChatId(roomCode);
      setRole("receiver");
      setIsChatOpen(true);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      const chatMessage = {
        chatId,
        senderId,
        message,
        role, // Send the role with the message
      };

      // Emit the chat message
      socket.emit("chatMessage", JSON.stringify(chatMessage));

      // Clear input field
      setMessage("");
    }
  };

  const closeChat = () => {
    socket.emit("closeChat", JSON.stringify({ chatId, senderId }));
    setIsChatOpen(false);
    setMessages([]);
    setRoomCode("");
    setChatId("");
    setRoomCode("");
    setIsChatOpen(false);
    setRole("");
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Live Chat {chatId}</h1>

      {!isChatOpen ? (
        <div className="mb-4">
          <button
            onClick={createChatRoom}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mr-2"
          >
            Create Chat Room
          </button>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className="border rounded-l-lg px-4 py-2"
            placeholder="Enter Room Code"
          />
          <button
            onClick={joinChatRoom}
            className="bg-green-500 text-white px-4 py-2 rounded-r-lg hover:bg-green-600"
          >
            Join Room
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-y-auto h-64 border-b border-gray-200 mb-4 p-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat ${
                  msg.role === "creator" ? "chat-end" : "chat-start"
                }`}
              >
                <div
                  className={`chat-bubble ${
                    msg.role === "creator"
                      ? "bg-blue-200 text-black"
                      : "bg-green-200 text-black"
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-grow border rounded-l-lg px-4 py-2"
              placeholder="Type your message..."
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
            >
              Send
            </button>
            <button
              onClick={closeChat}
              className="bg-red-500 text-white px-4 py-2 ml-2 rounded-lg hover:bg-red-600"
            >
              Close Chat
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;
