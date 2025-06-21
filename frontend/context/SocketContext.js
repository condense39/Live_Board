import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import io from 'socket.io-client'

const SocketContext = createContext(null)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef(null)

  const connectSocket = useCallback(() => {
    if (socketRef.current?.connected) {
      return
    }

    const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000', {
      reconnection: true,
      reconnectionDelay: 1000,
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to server:', newSocket.id)
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
      console.log('Disconnected from server')
    })

    socketRef.current = newSocket
    setSocket(newSocket)
  }, [])

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setSocket(null)
      setIsConnected(false)
    }
  }, [])

  useEffect(() => {
    connectSocket()
    return () => {
      disconnectSocket()
    }
  }, [connectSocket, disconnectSocket])

  const contextValue = {
    socket,
    isConnected,
    connectSocket,
    disconnectSocket,
    emit: (event, data) => {
      socketRef.current?.emit(event, data)
    },
    on: (event, callback) => {
      socketRef.current?.on(event, callback)
      return () => socketRef.current?.off(event, callback)
    },
  }

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  )
}