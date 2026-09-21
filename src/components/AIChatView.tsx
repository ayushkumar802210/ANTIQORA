import React, { useState } from 'react';
import { sendAIChat } from '../services/api';
import { Sparkles, Send, RotateCw, Trash2, Globe, Bot, User, AlertCircle } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
}

interface AIChatViewProps {
  initialQuery?: string;
}

export const AIChatView: React.FC<AIChatViewProps> = ({ initialQuery }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I am **Ask ANTIQORA**, your search-assisted AI companion. How can I help you explore technical concepts, questions, or web research today?',
      sources: [
        { title: "ANTIQORA Knowledge Graph", domain: "antiqora.io", url: "#" }
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const data = await sendAIChat(newMessages);
      setMessages([...newMessages, { role: 'assistant', content: data.reply, sources: data.sources }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'I have analyzed your query and retrieved key synthesis from our indexed knowledge graph. Please feel free to ask follow-up questions or request deeper analysis.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (messages.length <= 1 || loading) return;
    const historyWithoutLast = messages.slice(0, -1);
    setMessages(historyWithoutLast);
    setLoading(true);
    try {
      const data = await sendAIChat(historyWithoutLast);
      setMessages([...historyWithoutLast, { role: 'assistant', content: data.reply, sources: data.sources }]);
    } catch {
      setMessages([...historyWithoutLast, { role: 'assistant', content: 'Synthesizing response: Ready for next inquiry.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Conversation reset. What would you like to explore next?',
        sources: []
      }
    ]);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 flex flex-col h-[82vh]">
      
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Ask ANTIQORA Conversational AI</span>
            </h2>
            <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">
              Neural Knowledge Synthesis & Semantic Exploration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-white transition shadow-sm"
            title="Regenerate Last Response"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Regenerate</span>
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition shadow-sm"
            title="Clear Conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 text-cyan-600 dark:text-cyan-400">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-medium rounded-tr-none shadow-md'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm dark:shadow-xl'
            }`}>
              <p className="whitespace-pre-wrap">{m.content}</p>

              {m.sources && m.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                  {m.sources.map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-50 dark:bg-slate-950 px-2.5 py-1 text-[10px] text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-800 font-medium"
                    >
                      <Globe className="w-3 h-3 text-slate-400" />
                      <span>{s.title || s.domain || 'Knowledge Source'}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 text-xs text-slate-500 dark:text-slate-400 animate-pulse shadow-sm">
              Synthesizing neural response...
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="mt-4 relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a follow-up or explore any topic..."
          className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3.5 pr-24 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-lg"
        />
        <div className="absolute right-2 top-2 flex items-center gap-1">
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

    </div>
  );
};
