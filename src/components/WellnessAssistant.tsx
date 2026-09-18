'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

type ChatTurn = { role: 'user' | 'assistant'; content: string };

const API_BASE_URL = 'https://coiwellness.com';

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
  }, [messages]);

  async function sendQuestion() {
    const question = input.trim();
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
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Trợ lý Wellness</h1>
        <p className="text-sm text-gray-600 mt-1">Y học phương Đông & thiền — chỉ mang tính tham khảo</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <p className="text-gray-500 text-sm">
              Hỏi về giấc ngủ, căng thẳng, tiêu hoá, hoặc cách thiền phù hợp với bạn...
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex items-center gap-3 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Trợ lý đang soạn câu trả lời...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 px-4 sm:px-6 py-4 sm:py-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendQuestion();
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập câu hỏi của bạn..."
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 text-sm"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            onClick={sendQuestion}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold px-6 py-3 rounded-full flex items-center gap-2 transition-colors text-sm"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Gửi</span>
          </button>
        </form>
      </div>
    </div>
  );
}
