# 🎨 Live Board - Collaborative Whiteboard

A real-time collaborative whiteboard application built with Next.js, Socket.IO, and MongoDB. Create boards, invite collaborators, and draw together in real-time with powerful drawing tools and export capabilities.


##DEPLOYED_LINK= "https://live-board-k8m1-ec9o51pzf-condense39s-projects.vercel.app/" 


## ✨ Features

### 🎯 Core Functionality
- *Real-time Collaboration*: Multiple users can draw simultaneously
- *Room Management*: Create public or private rooms with unique IDs
- *User Permissions*: Edit and view-only modes
- *Live User Presence*: See who's currently in the room
- *Canvas Persistence*: Your drawings are saved and restored

### 🖌 Drawing Tools
- *Pen Tool*: Freehand drawing with adjustable brush size
- *Shapes*: Rectangle and circle tools
- *Text Tool*: Add text with custom fonts and sizes
- *Eraser*: Remove drawings with adjustable size
- *Selection Tool*: Move, resize, and edit existing objects

### 🎨 Customization
- *Color Picker*: Full color palette with custom colors
- *Brush Sizes*: Adjustable from 1-50 pixels
- *Font Options*: Multiple font families and sizes
- *Background*: Clean white canvas

### 📤 Export & Sharing
- *PNG Export*: Download canvas as high-quality image
- *PDF Export*: Save your work as a PDF document
- *Share Links*: Easy room sharing with unique URLs
- *Copy Link*: One-click link copying

### 💬 Communication
- *Real-time Chat*: Built-in chat system for collaboration
- *Private Messages*: Send direct messages to specific users
- *User List*: See all active participants

## 🛠 Tech Stack

### Frontend
- *Next.js 14* - React framework with SSR
- *React 18* - UI library with hooks
- *Fabric.js* - Canvas manipulation and drawing
- *Socket.IO Client* - Real-time communication
- *Tailwind CSS* - Utility-first CSS framework
- *Lucide React* - Beautiful icons
- *React Color* - Color picker component
- *jsPDF* - PDF generation
- *HTML2Canvas* - Canvas to image conversion

### Backend
- *Node.js* - JavaScript runtime
- *Express.js* - Web framework
- *Socket.IO* - Real-time bidirectional communication
- *MongoDB* - NoSQL database
- *Mongoose* - MongoDB object modeling
- *CORS* - Cross-origin resource sharing
- *UUID* - Unique identifier generation

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Git

### 1. Clone the Repository
bash



### 2. Backend Setup
bash
cd backend
npm install
npm run dev

Create .env file:
env
MONGODB_URI=mongodb://localhost:27017/whiteboard
FRONTEND_URL=http://localhost:3000
PORT=5000


### 3. Frontend Setup
bash
cd frontend
npm install
npm run dev


Create .env.local file:
env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000


### 4. Start Development Servers

*Terminal 1 - Backend:*
bash
cd backend
npm run dev


*Terminal 2 - Frontend:*
bash
cd frontend
npm run dev


Visit http://localhost:3000 to start using the application!

## 🚀 Usage Guide

### Creating a New Board
1. Enter your name
2. Choose board type (Public or Private)
3. Click "Create & Go"
4. Share the generated link with collaborators

### Joining a Board
1. Enter your name
2. Paste the board link
3. Click "Join Board"
4. Start collaborating!

### Drawing Tools
- *Pen*: Click and drag to draw freehand
- *Shapes*: Click and drag to create rectangles/circles
- *Text*: Click anywhere to add text, double-click to edit
- *Eraser*: Click and drag to erase
- *Select*: Click objects to move, resize, or delete

### Collaboration Features
- *Real-time Drawing*: See others' drawings instantly
- *User List*: View all active participants
- *Chat*: Communicate with collaborators
- *Permissions*: Room creator can manage access

### Export Options
- *PNG*: High-quality image export
- *PDF*: Document format export
- *Copy Link*: Share board URL

## 🏗 Project Structure


collaborative-whiteboard/
├── backend/
│   ├── models/
│   │   └── Room.js          # MongoDB room schema
│   │   └── utils/
│   │       └── helpers.js       # Utility functions
│   │   └── server.js            # Express + Socket.IO server
│   └── package.json
├── frontend/
│   ├── components/
│   │   ├── WhiteboardCanvas.js  # Main canvas component
│   │   ├── Toolbar.js           # Drawing tools
│   │   ├── ChatSidebar.js       # Chat interface
│   │   └── UsersList.js         # User presence
│   ├── context/
│   │   └── SocketContext.js     # Socket.IO context
│   ├── pages/
│   │   ├── index.js             # Landing page
│   │   ├── _app.js              # App wrapper
│   │   └── whiteboard/
│   │       └── [roomId].js      # Whiteboard page
│   ├── styles/
│   │   └── globals.css          # Global styles
│   └── package.json
└── README.md
