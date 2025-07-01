"use client"

import { useState, useEffect, useRef } from "react";

export default function TelegramPanel() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [status, setStatus] = useState(null);
  const [messages, setMessages] = useState([]);

  const messageEndRef = useRef(null);

  // 1️⃣ Cargar lista de chats una vez
  useEffect(() => {
    async function fetchChats() {
      const res = await fetch("/api/telegram/get-users-with-chatid");
      const data = await res.json();
      setChats(data);
    }
    fetchChats();
  }, []);

  // 2️⃣ Función para cargar mensajes del chat seleccionado
  async function fetchMessages(chatId) {
    if (!chatId) return;

    try {
      const res = await fetch(`/api/telegram/getMessages?chatId=${chatId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (error) {
      console.error("Error al obtener mensajes:", error);
    }
  }

  // 3️⃣ Efecto: actualizar mensajes cada 3s si hay un chat seleccionado
  useEffect(() => {
    if (!selectedChat) return;

    fetchMessages(selectedChat.chatId); // carga inicial

    const interval = setInterval(() => {
      fetchMessages(selectedChat.chatId);
    }, 3000);

    return () => clearInterval(interval); // limpieza
  }, [selectedChat]);

  // 4️⃣ Scroll automático al final cada vez que cambian los mensajes
/*  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
*/
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

      // Carga inmediata luego de enviar
      fetchMessages(selectedChat.chatId);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  };

  return (
    <div className="flex h-screen">
      <aside className="w-1/3 border-r border-gray-300 overflow-y-auto">
        <div className="p-4 font-bold text-lg border-b">Chats</div>
        {chats.map(chat => (
          <div
            key={chat.chatId}
            onClick={() => setSelectedChat(chat)}
            className={`p-4 hover:bg-gray-100 cursor-pointer border-b ${selectedChat?.chatId === chat.chatId ? 'bg-gray-100' : ''}`}
          >
            {chat.name || `Usuario ${chat.chatId}`}
          </div>
        ))}
      </aside>

      <section className="flex-1 flex flex-col">
        <div className="p-4 border-b font-bold">
          {selectedChat ? (selectedChat.name || selectedChat.chatId) : 'Selecciona un chat'}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {selectedChat ? (
            <>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2 rounded max-w-sm ${msg.from_bot ? 'bg-blue-100 text-right ml-auto' : 'bg-gray-100 text-left'}`}
                >
                  {msg.text}
                </div>
              ))}
              <div ref={messageEndRef} /> {/* ← Para scroll al fondo */}
            </>
          ) : (
            <p className="text-gray-500">Selecciona un chat para comenzar</p>
          )}
        </div>

        <div className="border-t p-4 flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={e => setMessageInput(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 border p-2 rounded"
          />
          <button onClick={handleSend} className="bg-blue-500 text-white px-4 py-2 rounded">
            Enviar
          </button>
        </div>

        {status && <div className="text-center text-sm text-green-600 py-2">{status}</div>}
      </section>
    </div>
  );
}