import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  ShieldCheck, 
  User, 
  MoreVertical, 
  FileIcon,
  CheckCheck
} from 'lucide-react';

// Relative imports based on feature-based architecture
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const LiveChat = ({ participantName = "Dr. Sarah Johnson" }) => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'system', 
      text: 'This chat is end-to-end encrypted. Only you and your provider can see these messages.', 
      time: '10:00 AM' 
    },
    { 
      id: 2, 
      sender: 'them', 
      text: 'Hello! I have reviewed your latest vitals. How are you feeling today?', 
      time: '10:01 AM' 
    },
    { 
      id: 3, 
      sender: 'me', 
      text: 'A bit better, but the chest tightness is still there in the mornings.', 
      time: '10:03 AM' 
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: 'me',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputText('');
  };

  return (
    <Card className="flex flex-col h-full min-h-[500px] border-slate-100 overflow-hidden shadow-xl">
      {/* 1. Chat Header */}
      <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
              <User size={20} />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-800">{participantName}</h4>
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
              <ShieldCheck size={10} />
              Secure Session
            </div>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600 p-1">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* 2. Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scroll-smooth"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} ${msg.sender === 'system' ? 'justify-center' : ''}`}
          >
            {msg.sender === 'system' ? (
              <div className="bg-white border border-slate-100 px-4 py-1.5 rounded-full text-[10px] text-slate-400 font-medium italic">
                {msg.text}
              </div>
            ) : (
              <div className={`max-w-[80%] flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                <div className={`
                  px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${msg.sender === 'me' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}
                `}>
                  {msg.text}
                </div>
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="text-[9px] text-slate-400 font-bold">{msg.time}</span>
                  {msg.sender === 'me' && <CheckCheck size={12} className="text-indigo-400" />}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 3. Input Footer */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-50">
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 focus-within:border-indigo-200 focus-within:ring-4 focus-within:ring-indigo-600/5 transition-all">
          <button type="button" className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
            <Paperclip size={20} />
          </button>
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2"
          />
          <button 
            type="submit" 
            disabled={!inputText.trim()}
            className={`p-2.5 rounded-xl transition-all ${
              inputText.trim() 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'bg-slate-200 text-slate-400'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </Card>
  );
};

export default LiveChat;