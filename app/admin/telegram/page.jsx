"use client"

import { useState, useEffect } from "react";

export default function TelegramPanel() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [status, setStatus] = useState(null);

  useEffect(() => {
    async function fetchChats() {
      try {
        const res = await fetch("/api/telegram/get-users-with-chatid");
        const data = await res.json();
        setChats(data);
      } catch (error) {
        console.error("Error al obtener los chats:", error);
      }
    }
    fetchChats();
  }, []);

  const handleSend = async () => {
    if (!messageInput.trim() || !selectedChat) return;

    try {
      const res = await fetch("/api/telegram/sendMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: selectedChat.chatId,
          text: messageInput,
        }),
      });
      const result = await res.json();
      setStatus(result.message);
      setMessageInput("");
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Lista de chats */}
      <aside className="w-1/3 border-r border-gray-300 overflow-y-auto">
        <div className="p-4 font-bold text-lg border-b">Chats</div>
        <ul>
          {chats.map((chat) => (
            <li
              key={chat.chatId}
              onClick={() => setSelectedChat(chat)}
              className={`p-4 hover:bg-gray-100 cursor-pointer border-b ${
                selectedChat?.chatId === chat.chatId ? "bg-gray-100" : ""
              }`}
            >
              {chat.name || `Usuario ${chat.chatId}`}
            </li>
          ))}
        </ul>
      </aside>

      {/* Panel de conversación */}
      <section className="flex-1 flex flex-col">
        <div className="p-4 border-b font-bold">
          {selectedChat ? selectedChat.name || selectedChat.chatId : "Selecciona un chat"}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Simulación de mensajes */}
          {selectedChat ? (
            <>
              <div className="text-left bg-gray-100 p-2 rounded max-w-sm">
                Hola, ¿en qué puedo ayudarte?
              </div>
              <div className="text-right bg-blue-100 p-2 rounded max-w-sm ml-auto">
                Hola, necesito ayuda con un pedido
              </div>
            </>
          ) : (
            <p className="text-gray-500">Selecciona un chat para comenzar</p>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-4 flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 border p-2 rounded"
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Enviar
          </button>
        </div>

        {status && (
          <div className="text-center text-sm text-green-600 py-2">{status}</div>
        )}
      </section>
    </div>
  );
}
