import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { useSocket } from '../../context/SocketContext'
import Toolbar from '../../components/Toolbar'
import WhiteboardCanvas from '../../components/WhiteboardCanvas'
import UsersList from '../../components/UsersList'
import ChatSidebar from '../../components/ChatSidebar'
import { Copy, LogOut, Users, Check, X, Bell } from 'lucide-react'

const JoinRequestToast = ({ request, onApprove, onReject }) => (
  <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-lg">
    <p><span className="font-bold">{request.userName}</span> wants to join.</p>
    <div className="flex gap-2">
      <button onClick={onApprove} className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200"><Check size={20} /></button>
      <button onClick={onReject} className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200"><X size={20} /></button>
    </div>
  </div>
);

const Whiteboard = () => {
  const router = useRouter()
  const { socket, emit, on } = useSocket()
  const { roomId } = router.query

  const [users, setUsers] = useState([])
  const [permission, setPermission] = useState('view') // 'edit' or 'view'
  const [joinRequests, setJoinRequests] = useState([])
  const [waitingForApproval, setWaitingForApproval] = useState(false)
  const [joinRejected, setJoinRejected] = useState(false)

  const [tool, setTool] = useState('pen')
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(3)
  const [fontSize, setFontSize] = useState(24)
  const [fontFamily, setFontFamily] = useState('Arial')
  const [activeObject, setActiveObject] = useState(null)
  const [showUsersList, setShowUsersList] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const usersListRef = useRef(null)
  
  const [userName, setUserName] = useState('')
  const [showNamePrompt, setShowNamePrompt] = useState(false)
  const [promptName, setPromptName] = useState('')

  const canvasRef = useRef(null)

  const [messages, setMessages] = useState([])

  useEffect(() => {
    const nameFromQuery = router.query.name
    if (router.isReady) {
      if (nameFromQuery) {
        setUserName(nameFromQuery)
      } else {
        setShowNamePrompt(true)
      }
    }
  }, [router.isReady, router.query.name])

  useEffect(() => {
    if (socket && roomId && userName) {
      emit('join-room', { roomId, userName, isCreator: router.query.creator === 'true' })
    }
  }, [socket, roomId, userName, emit, router.query.creator])
  
  useEffect(() => {
    if (!socket) return
    const unSubRoomJoined = on('room-joined', (data) => {
      console.log('Room joined:', data)
      setUsers(data.users)
      setPermission(data.permission)
      setWaitingForApproval(false)
      if (data.room.canvasData) {
        canvasRef.current?.loadCanvas(data.room.canvasData)
      }
    })
    const unSubUserJoined = on('user-joined', ({ users }) => {
      console.log('User joined event:', users)
      setUsers(users)
    })
    const unSubUserLeft = on('user-left', ({ users }) => {
      console.log('User left event:', users)
      setUsers(users)
    })
    const unSubJoinRequest = on('join-request', (request) => {
      console.log('Join request received:', request)
      setJoinRequests(prev => [...prev, request])
    })
    const unSubWaiting = on('waiting-for-approval', () => {
      setWaitingForApproval(true)
    })
    const unSubJoinRejected = on('join-request-rejected', () => {
      setJoinRejected(true)
      setWaitingForApproval(false)
    })
     const unSubNewMessage = on('new-message', (msg) => {
      setMessages(prev => [...prev, msg])
    })
    return () => {
      unSubRoomJoined()
      unSubUserJoined()
      unSubUserLeft()
      unSubJoinRequest()
      unSubWaiting()
      unSubJoinRejected()
      unSubNewMessage()
    }
  }, [socket, on])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (usersListRef.current && !usersListRef.current.contains(event.target)) {
        setShowUsersList(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [usersListRef])

  const handleNameSubmit = () => {
    if (promptName.trim()) {
      setUserName(promptName)
      setShowNamePrompt(false)
    }
  }

  const handleToolChange = (newTool) => {
    setTool(newTool)
    if (newTool !== 'select') {
      canvasRef.current?.canvas.discardActiveObject().renderAll()
    }
  }
  
  const handleAction = (action) => {
    switch (action) {
      case 'undo': canvasRef.current.undo(); break
      case 'redo': canvasRef.current.redo(); break
      case 'clearCanvas':
        if (window.confirm('Are you sure you want to clear the canvas?')) {
          canvasRef.current.clearCanvas()
        }
        break
      case 'downloadAsPNG': canvasRef.current.downloadAsPNG(); break
      case 'downloadAsPDF': canvasRef.current.downloadAsPDF(); break
      case 'toggleExportMenu': setShowExportMenu(!showExportMenu); break
      default: break
    }
  }

  const handleSelectionChange = (object) => {
    setActiveObject(object)
    if (object) {
      setFontSize(object.fontSize || 24)
      setFontFamily(object.fontFamily || 'Arial')
    }
  }
  
  const handleApprove = (request) => {
    emit('approve-join-request', { roomId, requestSocketId: request.requestSocketId })
    setJoinRequests(prev => prev.filter(r => r.requestSocketId !== request.requestSocketId))
  }
  const handleReject = (request) => {
    emit('reject-join-request', { roomId, requestSocketId: request.requestSocketId })
    setJoinRequests(prev => prev.filter(r => r.requestSocketId !== request.requestSocketId))
  }
  
   const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Link copied to clipboard!')
  }
  const leaveRoom = () => {
    router.push('/')
  }
  
  const handleSendMessage = (content, recipient) => {
    if (!content.trim()) return
    emit('send-message', { roomId, content, recipient })
  }

  if (joinRejected) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <X className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600">Your request to join the room was rejected.</p>
          <button onClick={() => router.push('/')} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Go to Homepage</button>
        </div>
      </div>
    )
  }

  if (waitingForApproval) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="w-12 h-12 mx-auto mb-4 text-blue-600">
            <Bell className="animate-swing" size={48} />
          </div>
          <h2 className="text-2xl font-bold mb-4">Request Sent</h2>
          <p className="text-gray-600">Waiting for the room creator to approve your request...</p>
        </div>
      </div>
    )
  }

  if (showNamePrompt) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Enter your name</h2>
          <p className="text-gray-600 mb-6">Please provide a name to join the board.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={promptName}
              onChange={(e) => setPromptName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
              placeholder="Your name..."
              className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleNameSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              Join
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 font-sans">
      {/* Join Requests Toast */}
      <div className="absolute top-4 right-4 z-50 space-y-2">
        {joinRequests.map(req => (
          <JoinRequestToast key={req.requestSocketId} request={req} onApprove={() => handleApprove(req)} onReject={() => handleReject(req)} />
        ))}
      </div>

      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-2 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-gray-800">Live Board</h1>
          <button onClick={copyShareLink} className="p-1.5 flex items-center gap-2 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700">
            <Copy className="w-4 h-4" />
            <span className="text-sm">Copy Link</span>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative" ref={usersListRef}>
            <button
              onClick={() => setShowUsersList(!showUsersList)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              <Users className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700 font-medium">{users.length}</span>
            </button>
            {showUsersList && (
              <div className="absolute top-full right-0 mt-2 z-30">
                <UsersList users={users} />
              </div>
            )}
          </div>
          <button
            onClick={leaveRoom}
            className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Leave</span>
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Toolbar
          permission={permission}
          currentTool={tool}
          onToolChange={handleToolChange}
          currentColor={color}
          onColorChange={setColor}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          fontFamily={fontFamily}
          onFontFamilyChange={setFontFamily}
          activeObject={activeObject}
          onAction={handleAction}
          showExportMenu={showExportMenu}
        />
        <div className="flex-1 flex overflow-hidden">
          {/* Canvas */}
          <div className="flex-1 relative bg-gray-200">
            <WhiteboardCanvas
              ref={canvasRef}
              roomId={roomId}
              permission={permission}
              tool={tool}
              color={color}
              brushSize={brushSize}
              fontSize={fontSize}
              fontFamily={fontFamily}
              onSelectionChange={handleSelectionChange}
            />
          </div>
          
          {/* Chat Sidebar */}
          <ChatSidebar users={users} messages={messages} onSendMessage={handleSendMessage} selfId={socket?.id} />
        </div>
      </div>
    </div>
  )
}

export default Whiteboard