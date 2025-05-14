

const rooms = new Map();

/**
 * Creates a new room or adds a user to an existing room
 * @param {string} room - Room code
 * @param {string} name - User name
 * @param {string} socketId - Socket ID of the user
 * @returns {boolean} - True if user is admin, false otherwise
 */
export function createOrJoinRoom(room, name, socketId) {
  if (!rooms.has(room)) {
    // Create new room with default settings
    rooms.set(room, {
      users: [{
        name,
        socketId,
        joinedAt: Date.now()
      }],
      votes: { A: 0, B: 0 },
      votedUsers: new Map(),
      timer: 60,
      timerStarted: false,
      createdAt: Date.now(),
      admin: socketId,
      question: "Cats vs Dogs",
      options: { A: "Cats", B: "Dogs" },
      deleted: false,
      timerInterval: null
    });
    return true; // New user is admin
  } else {
    // Check if room is deleted
    const roomData = rooms.get(room);
    if (roomData.deleted) {
      return false; // Room is deleted
    }
    
    // Add user to existing room
    const existingUserIndex = roomData.users.findIndex(u => u.socketId === socketId);
    
    if (existingUserIndex >= 0) {
      // Update existing user
      roomData.users[existingUserIndex] = {
        ...roomData.users[existingUserIndex],
        name,
        lastActive: Date.now()
      };
    } else {
      // Add new user
      roomData.users.push({
        name,
        socketId,
        joinedAt: Date.now()
      });
      
      // Reset timer when a new user joins
      resetRoomTimer(room);
    }
    
    return socketId === roomData.admin; // Return true if user is admin
  }
}

/**
 * Checks if this is the first user in a room
 * @param {string} room - Room code
 * @returns {boolean} - True if first user, false otherwise
 */
export function checkIsFirstUser(room) {
  return !rooms.has(room) || rooms.get(room).deleted;
}

/**
 * Records a vote for a specific option in a room
 * @param {string} room - Room code
 * @param {string} option - Vote option (A or B)
 * @param {string} socketId - Socket ID of the user who voted
 * @returns {boolean} - True if vote was recorded, false otherwise
 */
export function vote(room, option, socketId) {
  if (!rooms.has(room) || rooms.get(room).deleted) return false;
  
  const roomData = rooms.get(room);
  
  // Check if timer has expired
  if (roomData.timer <= 0) {
    return false;
  }
  
  // Check if user already voted
  if (roomData.votedUsers.has(socketId)) {
    return false;
  }
  
  // Record vote
  if (option === 'A' || option === 'B') {
    roomData.votes[option]++;
    roomData.votedUsers.set(socketId, option);
    return true;
  }
  
  return false;
}

/**
 * Gets all room data including votes, question, and options
 * @param {string} room - Room code
 * @returns {Object} - Room data or default empty values
 */
export function getRoomData(room) {
  if (!rooms.has(room) || rooms.get(room).deleted) {
    return {
      votes: { A: 0, B: 0 },
      question: "Cats vs Dogs",
      options: { A: "Cats", B: "Dogs" },
      deleted: true
    };
  }
  
  const roomData = rooms.get(room);
  return {
    votes: roomData.votes,
    question: roomData.question,
    options: roomData.options,
    admin: roomData.admin,
    votedUsers: Array.from(roomData.votedUsers.keys()),
    deleted: false
  };
}

/**
 * Checks if a user has voted in a room
 * @param {string} room - Room code
 * @param {string} socketId - Socket ID of the user
 * @returns {string|null} - The option voted for or null if not voted
 */
export function checkUserVoted(room, socketId) {
  if (!rooms.has(room) || rooms.get(room).deleted) return null;
  
  const roomData = rooms.get(room);
  return roomData.votedUsers.has(socketId) ? roomData.votedUsers.get(socketId) : null;
}

/**
 * Gets list of users in a room
 * @param {string} room - Room code
 * @returns {Array} - Array of user names
 */
export function getUsersInRoom(room) {
  if (!rooms.has(room) || rooms.get(room).deleted) return [];
  
  return rooms.get(room).users.map(user => user.name);
}

/**
 * Updates room settings (admin only)
 * @param {string} room - Room code
 * @param {Object} settings - New settings
 */
export function updateRoomSettings(room, settings) {
  if (!rooms.has(room) || rooms.get(room).deleted) return;
  
  const roomData = rooms.get(room);
  
  if (settings.question) {
    roomData.question = settings.question;
  }
  
  if (settings.options) {
    if (settings.options.A) {
      roomData.options.A = settings.options.A;
    }
    if (settings.options.B) {
      roomData.options.B = settings.options.B;
    }
  }
}

/**
 * Deletes a room (admin only)
 * @param {string} room - Room code
 * @param {string} socketId - Socket ID of the requestor
 * @returns {boolean} - True if deletion was successful, false otherwise
 */
export function deleteRoom(room, socketId) {
  if (!rooms.has(room)) return false;
  
  const roomData = rooms.get(room);
  
  // Only admin can delete the room
  if (roomData.admin !== socketId) {
    return false;
  }
  
  // Mark room as deleted
  roomData.deleted = true;
  
  // Clear any active timers
  if (roomData.timerInterval) {
    clearInterval(roomData.timerInterval);
    roomData.timerInterval = null;
  }
  
  // Add to deleted rooms list for localStorage cleanup
  addToDeletedRooms(room);
  
  return true;
}

/**
 * Keep track of deleted rooms
 * @param {string} room - Room code
 */
function addToDeletedRooms(room) {
  try {
    // This will be accessed from server memory
    // In a production environment, you'd use a database
    global.deletedRooms = global.deletedRooms || new Set();
    global.deletedRooms.add(room);
  } catch (err) {
    console.error('Error adding to deleted rooms:', err);
  }
}

/**
 * Get list of deleted rooms
 * @returns {Array} - Array of deleted room codes
 */
export function getDeletedRooms() {
  try {
    return Array.from(global.deletedRooms || []);
  } catch (err) {
    console.error('Error getting deleted rooms:', err);
    return [];
  }
}

/**
 * Reset the timer for a room when a new user joins
 * @param {string} room - Room code
 */
function resetRoomTimer(room) {
  if (!rooms.has(room) || rooms.get(room).deleted) return;
  
  const roomData = rooms.get(room);
  
  // Reset timer to 60 seconds
  roomData.timer = 60;
  roomData.timerStarted = false;
}

/**
 * Starts the timer for a room if not already started
 * @param {Object} io - Socket.io instance
 * @param {string} room - Room code
 */
export function startTimer(io, room) {
  if (!rooms.has(room) || rooms.get(room).deleted) return;
  
  const roomData = rooms.get(room);
  
  // Clear any existing timer
  if (roomData.timerInterval) {
    clearInterval(roomData.timerInterval);
    roomData.timerInterval = null;
  }
  
  // Don't start timer if already started
  if (roomData.timerStarted) return;
  
  roomData.timerStarted = true;
  let count = roomData.timer;
  
  // Immediately send current timer value
  io.to(room).emit('timer', count);
  
  const interval = setInterval(() => {
    count--;
    
    // Ensure room still exists and isn't deleted
    if (!rooms.has(room) || rooms.get(room).deleted) {
      clearInterval(interval);
      return;
    }
    
    // Update timer in room data
    rooms.get(room).timer = count;
    
    if (count >= 0) {
      io.to(room).emit('timer', count);
    }
    
    if (count <= 0) {
      clearInterval(interval);
      roomData.timerInterval = null;
      
      // Emit voting-ended event
      io.to(room).emit('voting-ended');
      
      // After timer ends, keep the room data for some time before cleanup
      setTimeout(() => {
        cleanupOldRooms();
      }, 1000 * 60 * 60); // Clean up after 1 hour
    }
  }, 1000);
  
  roomData.timerInterval = interval;
}

/**
 * Cleans up old unused rooms to prevent memory leaks
 */
function cleanupOldRooms() {
  const now = Date.now();
  const MAX_ROOM_AGE = 1000 * 60 * 60; // 1 hour
  
  rooms.forEach((data, room) => {
    // Remove rooms older than 24 hours
    if (now - data.createdAt > MAX_ROOM_AGE) {
      rooms.delete(room);
      console.log(`Cleaned up old room: ${room}`);
      
      // Add to deleted rooms
      addToDeletedRooms(room);
    }
  });
}

// Run cleanup periodically
setInterval(cleanupOldRooms, 1000 * 60 * 60); // Every hour