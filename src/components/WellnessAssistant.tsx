'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, User } from 'lucide-react';

type ChatTurn = { role: 'user' | 'assistant'; content: string };

const API_BASE_URL = 'https://coiwellness.com';

const SUGGESTIONS = [
  'Tôi hay mất ngủ và dễ cáu gắt, nên làm gì?',
  'Cách thiền nào phù hợp khi tôi hay lo âu?',
  'Tôi thường xuyên mệt mỏi, hụt hơi, tư vấn giúp tôi',
];

export function WellnessAssistant() {
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  async function sendQuestion(overrideText?: string) {
    const question = (overrideText ?? input).trim();
    if (!question || loading) return;

    setError(null);
    setInput('');
    const nextMessages: ChatTurn[] = [...messages, { role: 'user', content: question }];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/wellness-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history: messages }),
      });
      const data = await response.json();

      if (!data.ok) {
        setError(data.message ?? 'Có lỗi xảy ra, vui lòng thử lại.');
        return;
      }

      setMessages([...nextMessages, { role: 'assistant', content: data.answer }]);
    } catch {
      setError('Không kết nối được tới máy chủ. Kiểm tra mạng và thử lại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#FAF9F6]">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 sm:px-6 py-4 sm:py-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">Trợ lý Wellness</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Y học phương Đông & thiền — chỉ mang tính tham khảo</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-5 sm:py-8 space-y-5">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-6 px-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-emerald-600" />
            </div>
            <p className="text-gray-500 text-sm sm:text-base max-w-sm">
              Hỏi về giấc ngủ, căng thẳng, tiêu hoá, hoặc cách thiền phù hợp với bạn...
            </p>
            <div className="flex flex-col gap-2 w-full max-w-md">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendQuestion(s)}
                  className="text-left text-sm text-gray-700 bg-white border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 rounded-xl px-4 py-3 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-end gap-2 sm:gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                </div>
              )}
              <div
                className={`max-w-[80%] sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                }`}
              >
                <p className="text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="flex items-end gap-2 sm:gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm shadow-sm px-4 py-3 flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Trợ lý đang soạn câu trả lời...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm max-w-md">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-3 sm:px-6 py-3 sm:py-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendQuestion();
          }}
          className="flex gap-2 sm:gap-3 max-w-3xl mx-auto"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập câu hỏi của bạn..."
            disabled={loading}
            autoFocus
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 text-sm sm:text-base"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold px-5 sm:px-6 py-3 rounded-full flex items-center gap-2 transition-colors text-sm shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Gửi</span>
          </button>
        </form>
        <p className="text-center text-[11px] text-gray-400 mt-2">
          Thông tin chỉ mang tính tham khảo, không thay thế chẩn đoán y khoa.
        </p>
      </div>
    </div>
  );
}
