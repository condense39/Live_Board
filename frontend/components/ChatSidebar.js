import { useState, useRef, useEffect } from 'react'
import { Send, CornerDownLeft, Users, Lock } from 'lucide-react'

export default function ChatSidebar({ users, messages, onSendMessage, selfId }) {
  const [message, setMessage] = useState('')
  const [recipient, setRecipient] = useState('everyone')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message, recipient)
      setMessage('')
    }
  }

  const otherUsers = users.filter(u => u.id !== selfId)

  return (
    <div className="w-1/5 bg-white border-l border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">Live Chat</h3>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex flex-col ${msg.senderId === selfId ? 'items-end' : 'items-start'}`}>
            <div className={`rounded-lg px-3 py-2 max-w-xs ${msg.senderId === selfId ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
              <div className="flex items-center gap-2 mb-1">
                {msg.isPrivate && <Lock className="w-3 h-3 text-yellow-400" />}
                <p className="font-bold text-sm">{msg.senderId === selfId ? 'You' : msg.senderName}</p>
                {msg.isPrivate && msg.recipientName && <span className="text-xs opacity-80">(to {msg.recipientName})</span>}
              </div>
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-500">To:</label>
            <select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full p-2 text-sm border-gray-300 rounded-md"
            >
              <option value="everyone">Everyone</option>
              {otherUsers.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Type your message..."
              rows="3"
              className="w-full p-2 pr-10 text-sm border-gray-300 rounded-md resize-none"
            />
            <button
              onClick={handleSend}
              className="absolute bottom-2 right-2 p-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
              disabled={!message.trim()}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 