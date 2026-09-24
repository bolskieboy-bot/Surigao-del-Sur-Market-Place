import React, { useState, useEffect } from 'react';
import { X, Send, MessageSquare, Store, User, ShoppingBag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChatMessage } from '../../types';
import { api } from '../../services/api';

export const ChatModal: React.FC = () => {
  const { chatRecipient, setChatRecipient, currentUser, currentSeller, role } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const myId = role === 'seller' ? currentSeller?.id : currentUser?.id;
  const myName = role === 'seller' ? currentSeller?.shopName : currentUser?.fullName;

  useEffect(() => {
    if (!chatRecipient || !myId) return;

    const fetchMessages = () => {
      api.getMessages(myId, chatRecipient.id)
        .then((res) => setMessages(res.messages || []))
        .catch(console.error);
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [chatRecipient, myId]);

  if (!chatRecipient) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !myId || !myName) return;

    const textToSend = inputText.trim();
    setInputText('');

    try {
      const res = await api.sendMessage({
        senderId: myId,
        senderName: myName,
        senderRole: role,
        recipientId: chatRecipient.id,
        text: textToSend
      });

      if (res.message) {
        setMessages((prev) => [...prev, res.message]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full h-[580px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden relative">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-800 text-amber-400 flex items-center justify-center font-bold">
              {chatRecipient.role === 'seller' ? <Store className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{chatRecipient.name}</h3>
              <p className="text-[10px] text-slate-300 capitalize">{chatRecipient.role} • Surigao del Sur</p>
            </div>
          </div>

          <button
            onClick={() => setChatRecipient(null)}
            className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300" />
              <p>Say hello to start the conversation!</p>
              <p className="text-[11px] text-slate-400">Ask about availability, delivery options, or custom requests.</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.senderId === myId;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 shadow-xs ${
                      isMine
                        ? 'bg-blue-950 text-white rounded-br-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    <p className="leading-relaxed">{m.text}</p>
                    <span
                      className={`text-[9px] mt-1 block text-right ${
                        isMine ? 'text-blue-300' : 'text-slate-400'
                      }`}
                    >
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-600 outline-hidden"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="bg-blue-950 hover:bg-blue-900 text-amber-400 p-2.5 rounded-xl transition-all disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
