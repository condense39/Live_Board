const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const Room = require('./models/Room')
const { generateRoomId } = require('./utils/helpers')

const app = express()
const server = http.createServer(app)

// Unified CORS options
const corsOptions = {
  methods: ['GET', 'POST'],
  credentials: true,
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // For production, check against the FRONTEND_URL env var
    // and allow any vercel.app subdomains for preview/branch deployments
    if (process.env.NODE_ENV === 'production') {
      try {
        const originHostname = new URL(origin).hostname;
        const allowedHostname = new URL(process.env.FRONTEND_URL).hostname;
        
        // Allow the main production URL or any Vercel preview/branch URL
        if (originHostname === allowedHostname || originHostname.endsWith('.vercel.app')) {
          return callback(null, true);
        }
      } catch (e) {
        // Fallback for invalid URLs
        return callback(new Error('Not allowed by CORS'));
      }
    } else {
      // Allow all for local development
      return callback(null, true);
    }
    
    // Block all other origins
    return callback(new Error('Not allowed by CORS'));
  }
};

const io = new Server(server, {
  cors: corsOptions,
})

// Apply CORS to Express
app.use(cors(corsOptions))

app.use(express.json())

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/whiteboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

let rooms = {}

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id)

  socket.on('create-room', ({ roomId, userName, roomType, isCreator }) => {
    console.log(`Creating room ${roomId} with user ${userName}`)
    if (!rooms[roomId]) {
      rooms[roomId] = {
        users: [],
        canvasData: null,
        chatMessages: [],
        permissions: {},
        joinRequests: [],
        type: roomType, // 'public' or 'private'
        creatorId: socket.id
      }
    }
    
    // Check if user already exists in the room
    const existingUserIndex = rooms[roomId].users.findIndex(u => u.id === socket.id)
    if (existingUserIndex === -1) {
      const user = { id: socket.id, name: userName, isCreator, isOnline: true }
      rooms[roomId].users.push(user)
      rooms[roomId].permissions[socket.id] = 'edit' // Creator always has edit permission
      console.log(`Added user ${userName} to room ${roomId}. Total users: ${rooms[roomId].users.length}`)
    }
    
    socket.join(roomId)
    // Emit to the creator that they have joined the room
    socket.emit('room-joined', {
      room: rooms[roomId],
      users: rooms[roomId].users,
      permission: 'edit'
    });
    // Inform other users (if any)
    socket.to(roomId).emit('user-joined', { users: rooms[roomId].users })
  })

  socket.on('join-room', ({ roomId, userName }) => {
    console.log(`User ${userName} attempting to join room ${roomId}`)
    if (!rooms[roomId]) {
      // Room doesn't exist
      console.log(`Room ${roomId} not found`)
      return socket.emit('room-not-found')
    }
    
    const room = rooms[roomId]

    // Determine if the joining user is the creator
    const isCreator = room.creatorId === socket.id;

    if (room.type === 'private' && !isCreator) {
      const creatorSocket = io.sockets.sockets.get(room.creatorId);
      if (creatorSocket) {
        // Put user in a waiting state
        room.joinRequests.push({ requestSocketId: socket.id, userName });
        creatorSocket.emit('join-request', { requestSocketId: socket.id, userName });
        socket.emit('waiting-for-approval');
        console.log(`Join request sent for user ${userName} to room ${roomId}`)
      } else {
        // Creator is not connected, can't join private room
        socket.emit('join-request-rejected');
        console.log(`Creator not connected for room ${roomId}`)
      }
      return;
    }

    // Check if user already exists in the room
    const existingUserIndex = room.users.findIndex(u => u.id === socket.id)
    if (existingUserIndex === -1) {
      const user = { id: socket.id, name: userName, isCreator, isOnline: true }
      room.users.push(user)
      // Always set edit permission for now (you can modify this logic later)
      room.permissions[socket.id] = 'edit'
      console.log(`Added user ${userName} to room ${roomId}. Total users: ${room.users.length}`)
    }

    socket.join(roomId)
    
    // Ensure permission is set and send room details to the joining user
    const userPermission = room.permissions[socket.id] || 'edit'
    console.log(`Sending room-joined event to ${userName} with permission: ${userPermission}`)
    socket.emit('room-joined', {
      room,
      users: room.users,
      permission: userPermission
    })
    
    // Inform other users in the room
    socket.to(roomId).emit('user-joined', { users: room.users })
  })

  socket.on('approve-join-request', ({ roomId, requestSocketId }) => {
    console.log(`Approving join request for ${requestSocketId} in room ${roomId}`)
    const room = rooms[roomId];
    if (room && room.creatorId === socket.id) {
      const request = room.joinRequests.find(r => r.requestSocketId === requestSocketId);
      if (request) {
        const userSocket = io.sockets.sockets.get(requestSocketId);
        if (userSocket) {
          const user = { id: requestSocketId, name: request.userName, isCreator: false, isOnline: true };
          
          // Check if user already exists
          const existingUserIndex = room.users.findIndex(u => u.id === requestSocketId)
          if (existingUserIndex === -1) {
            room.users.push(user);
            room.permissions[requestSocketId] = 'edit'; // Approved users get edit permission
            console.log(`Approved user ${request.userName} to room ${roomId}. Total users: ${room.users.length}`)
          }

          userSocket.join(roomId);

          userSocket.emit('room-joined', {
            room,
            users: room.users,
            permission: room.permissions[requestSocketId],
          });
          
          // Notify all users in the room about the updated user list
          io.to(roomId).emit('user-joined', { users: room.users });
          room.joinRequests = room.joinRequests.filter(r => r.requestSocketId !== requestSocketId);
        }
      }
    }
  });

  socket.on('reject-join-request', ({ roomId, requestSocketId }) => {
    console.log(`Rejecting join request for ${requestSocketId} in room ${roomId}`)
    const room = rooms[roomId];
    if (room && room.creatorId === socket.id) {
      const userSocket = io.sockets.sockets.get(requestSocketId);
      if (userSocket) {
        userSocket.emit('join-request-rejected');
      }
      room.joinRequests = room.joinRequests.filter(r => r.requestSocketId !== requestSocketId);
    }
  });

  socket.on('drawing', (payload) => {
    const { roomId, data } = payload
    if (rooms[roomId]) {
      socket.to(roomId).emit('drawing', data)
    }
  })
  
  socket.on('clear-canvas', ({ roomId }) => {
    if (rooms[roomId]) {
        rooms[roomId].canvasData = null
        socket.to(roomId).emit('clear-canvas')
    }
  })

  socket.on('get-canvas-state', ({ roomId }) => {
    if (rooms[roomId] && rooms[roomId].canvasData) {
      socket.emit('canvas-state', rooms[roomId].canvasData)
    }
  })
  
  socket.on('canvas-state', (payload) => {
      const { roomId, state } = payload
      if (rooms[roomId]) {
          rooms[roomId].canvasData = state
          socket.to(roomId).emit('canvas-state', state)
      }
  })

  socket.on('send-message', ({ roomId, content, recipient }) => {
    const room = rooms[roomId];
    const sender = room?.users.find(u => u.id === socket.id);
    if (!room || !sender) return;

    const message = {
      senderId: socket.id,
      senderName: sender.name,
      content: content,
      timestamp: new Date(),
      isPrivate: recipient !== 'everyone'
    };
    
    if (recipient === 'everyone') {
      io.to(roomId).emit('new-message', message);
    } else {
      const recipientSocket = io.sockets.sockets.get(recipient);
      if (recipientSocket) {
        const recipientUser = room.users.find(u => u.id === recipient);
        message.recipientName = recipientUser?.name
        recipientSocket.emit('new-message', message);
        socket.emit('new-message', message); // Also send to self
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id)
    for (const roomId in rooms) {
      const room = rooms[roomId]
      const userIndex = room.users.findIndex((user) => user.id === socket.id)
      if (userIndex !== -1) {
        const disconnectedUser = room.users[userIndex]
        room.users.splice(userIndex, 1)
        console.log(`User ${disconnectedUser.name} left room ${roomId}. Remaining users: ${room.users.length}`)
        
        // Notify all remaining users in the room
        io.to(roomId).emit('user-left', { userId: socket.id, users: room.users })
        
        // If creator disconnects, a new creator could be assigned or room closed
        if (disconnectedUser.isCreator) {
          // Simple logic: make the next user the creator
          if (room.users.length > 0) {
            room.users[0].isCreator = true
            room.creatorId = room.users[0].id
            io.to(roomId).emit('new-creator', { newCreatorId: room.creatorId })
            console.log(`New creator assigned: ${room.users[0].name}`)
          } else {
            // No users left, delete room
            delete rooms[roomId]
            console.log(`Room ${roomId} deleted - no users remaining`)
          }
        }
        break
      }
    }
  })
})

// REST API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.get('/api/rooms/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params
    const room = await Room.findOne({ roomId })
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' })
    }

    res.json({
      roomId: room.roomId,
      roomType: room.roomType,
      createdAt: room.createdAt,
      activeUsers: Object.keys(rooms).length
    })
  } catch (error) {
    console.error('Error fetching room:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))