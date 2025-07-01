"use client"

import { useState, useEffect, useRef } from "react";

export default function TelegramPanel() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [status, setStatus] = useState(null);
  const [messages, setMessages] = useState([]);
  const messageEndRef = useRef(null);

  useEffect(() => {
    async function fetchChats() {
      const res = await fetch("/api/telegram/get-users-with-chatid");
      const data = await res.json();
      setChats(data);
    }
    fetchChats();
  }, []);

  async function fetchMessages(chatId) {
    if (!chatId) return;
    try {
      const res = await fetch(`/api/telegram/getMessages?chatId=${chatId}`);
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch (error) {
      console.error("Error al obtener mensajes:", error);
    }
  }

  useEffect(() => {
    if (!selectedChat) return;
    fetchMessages(selectedChat.chatId);
    const interval = setInterval(() => {
      fetchMessages(selectedChat.chatId);
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedChat]);

  const handleSend = async () => {
    if (!messageInput.trim() || !selectedChat) return;
    try {
      const res = await fetch("/api/telegram/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: selectedChat.chatId, text: messageInput }),
      });

      const result = await res.json();
      setStatus(result.message);
      setMessageInput("");
      fetchMessages(selectedChat.chatId);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[90vh] relative top-[-2rem]">
      {/* Lista de chats */}
      <aside className="md:w-1/3 w-full border-r border-slate-300 overflow-y-auto">
        <div className="p-2 font-bold text-lg border-b">Chats</div>
        {chats.map(chat => (
          <div
            key={chat.chatId}
            onClick={() => setSelectedChat(chat)}
            className={`p-2 hover:bg-white cursor-pointer border-b ${
              selectedChat?.chatId === chat.chatId ? 'bg-slate-100' : ''
            }`}
          >
            {chat.name || `Usuario ${chat.chatId}`}
          </div>
        ))}
      </aside>

      {/* Panel de mensajes */}
      <section className="flex-1 flex flex-col">
        <div className="p-2 border-b border-slate-300 font-bold">
          {selectedChat ? (selectedChat.name || selectedChat.chatId) : 'Selecciona un chat'}
        </div>

        <div className="flex-1 overflow-y-scroll p-2 space-y-1">
          {selectedChat ? (
            <>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-1 rounded max-w-sm break-words ${
                    msg.from_bot
                      ? 'bg-blue-200 text-right ml-auto'
                      : 'bg-white text-left'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              <div ref={messageEndRef} />
            </>
          ) : (
            <p className="text-slate-500">Selecciona un chat para comenzar</p>
          )}
        </div>

        {/* Input de mensaje */}
        <div className="border-t p-2 flex gap-1">
          <input
            type="text"
            value={messageInput}
            onChange={e => setMessageInput(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 border p-1 rounded"
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-2 py-1 rounded"
          >
            Enviar
          </button>
        </div>

        {status && <div className="text-center text-sm text-green-600 py-2">{status}</div>}
      </section>
    </div>
  );
}