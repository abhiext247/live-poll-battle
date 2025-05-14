

import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { 
  createOrJoinRoom, 
  vote, 
  getRoomData, 
  startTimer, 
  updateRoomSettings, 
  getUsersInRoom,
  checkIsFirstUser,
  deleteRoom,
  checkUserVoted,
  getDeletedRooms
} from './rooms.js';

const app = express();
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS || '*',
  methods: ['GET', 'POST'],
  credentials: true
}));

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// API endpoint to get deleted rooms
app.get('/api/deleted-rooms', (req, res) => {
  res.status(200).json({ deletedRooms: getDeletedRooms() });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { 
    origin: process.env.ALLOWED_ORIGINS || '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Middleware to log connections
io.use((socket, next) => {
  const clientIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  console.log(`Client connected: ${socket.id} from ${clientIp}`);
  next();
});

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);
  
  // Provide list of deleted rooms
  socket.emit('deleted-rooms', getDeletedRooms());
  
  // Handle joining a room
  socket.on('join-room', ({ room, name }) => {
    // Clean inputs
    const cleanRoom = (room || '').toString().trim().toUpperCase();
    const cleanName = (name || '').toString().trim();
    
    if (!cleanRoom || !cleanName) {
      socket.emit('error', 'Room and name are required');
      return;
    }
    
    // Join the socket.io room
    socket.join(cleanRoom);
    
    // Create or join the room in our data store
    const isFirstUser = checkIsFirstUser(cleanRoom);
    const isAdmin = createOrJoinRoom(cleanRoom, cleanName, socket.id);
    
    // Check if room is deleted
    const roomData = getRoomData(cleanRoom);
    if (roomData.deleted) {
      socket.emit('room-deleted');
      return;
    }
    
    // If first user, grant admin rights
    if (isFirstUser || isAdmin) {
      socket.emit('admin-rights');
    }
    
    // Check if user has already voted in this room
    const userVote = checkUserVoted(cleanRoom, socket.id);
    if (userVote) {
      socket.emit('already-voted', { option: userVote });
    }
    
    // Send initial room data to the new user
    socket.emit('vote-update', roomData);
    
    // Broadcast to everyone in the room that a new user joined
    const users = getUsersInRoom(cleanRoom);
    io.to(cleanRoom).emit('users-update', users);
    
    // Start the timer if it's not already running
    startTimer(io, cleanRoom);
    
    console.log(`${cleanName} joined room ${cleanRoom}`);
  });
  
  // Handle voting
  socket.on('vote', ({ room, option }) => {
    // Clean inputs
    const cleanRoom = (room || '').toString().trim().toUpperCase();
    const cleanOption = (option || '').toString().trim();
    
    if (!cleanRoom || !cleanOption || (cleanOption !== 'A' && cleanOption !== 'B')) {
      socket.emit('error', 'Invalid vote');
      return;
    }
    
    // Record the vote
    const voteSuccess = vote(cleanRoom, cleanOption, socket.id);
    
    if (!voteSuccess) {
      // Check if timer has expired or user already voted
      const userVote = checkUserVoted(cleanRoom, socket.id);
      if (userVote) {
        socket.emit('already-voted', { option: userVote });
      } else {
        socket.emit('error', 'Voting is no longer allowed for this poll');
      }
      return;
    }
    
    // Send updated vote counts to all users in the room
    const roomData = getRoomData(cleanRoom);
    io.to(cleanRoom).emit('vote-update', roomData);
    
    // Confirm the vote to the user
    socket.emit('vote-confirmed', { option: cleanOption });
  });
  
  // Handle room settings update (admin only)
  socket.on('update-room-settings', ({ room, question, options }) => {
    // Clean inputs
    const cleanRoom = (room || '').toString().trim().toUpperCase();
    
    if (!cleanRoom) {
      socket.emit('error', 'Room is required');
      return;
    }
    
    // Verify sender is room admin
    const roomData = getRoomData(cleanRoom);
    if (!roomData || roomData.admin !== socket.id) {
      socket.emit('error', 'You are not authorized to update settings');
      return;
    }
    
    // Update room settings
    updateRoomSettings(cleanRoom, {
      question: question ? question.toString().trim() : undefined,
      options: options ? {
        A: options.A ? options.A.toString().trim() : undefined,
        B: options.B ? options.B.toString().trim() : undefined,
      } : undefined
    });
    
    // Broadcast updated settings to all users in the room
    const updatedRoomData = getRoomData(cleanRoom);
    io.to(cleanRoom).emit('vote-update', updatedRoomData);
  });
  
  // Handle room deletion (admin only)
  socket.on('delete-room', ({ room }) => {
    // Clean input
    const cleanRoom = (room || '').toString().trim().toUpperCase();
    
    if (!cleanRoom) {
      socket.emit('error', 'Room is required');
      return;
    }
    
    // Try to delete the room
    const deleted = deleteRoom(cleanRoom, socket.id);
    
    if (deleted) {
      // Notify all users in the room that it's been deleted
      io.to(cleanRoom).emit('room-deleted');
      
      // Update the deleted rooms list for all connected clients
      io.emit('deleted-rooms', getDeletedRooms());
      
      console.log(`Room ${cleanRoom} deleted by ${socket.id}`);
    } else {
      socket.emit('error', 'Failed to delete room. You may not be the admin.');
    }
  });
  
  // Handle disconnections
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    // Note: we could update the room user list here, but for simplicity
    // we're not tracking which rooms each socket is in
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('Server shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});