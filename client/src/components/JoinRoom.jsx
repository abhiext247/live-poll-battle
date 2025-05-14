
// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';

// export default function JoinRoom({ onJoin }) {
//   const [name, setName] = useState('');
//   const [room, setRoom] = useState('');
//   const [isCreating, setIsCreating] = useState(false);
//   const [recentRooms, setRecentRooms] = useState([]);

//   useEffect(() => {
//     // Load recent rooms from local storage
//     try {
//       const saved = localStorage.getItem('recentRooms');
//       if (saved) {
//         setRecentRooms(JSON.parse(saved).slice(0, 5)); // Keep only 5 most recent
//       }
//     } catch (err) {
//       console.error('Error loading recent rooms:', err);
//     }
//   }, []);

//   const saveRecentRoom = (roomCode) => {
//     try {
//       const existing = JSON.parse(localStorage.getItem('recentRooms') || '[]');
//       const updated = [roomCode, ...existing.filter(r => r !== roomCode)].slice(0, 5);
//       localStorage.setItem('recentRooms', JSON.stringify(updated));
//       setRecentRooms(updated);
//     } catch (err) {
//       console.error('Error saving recent room:', err);
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     if (!name.trim()) return;
    
//     let roomCode = room.trim();
//     if (isCreating) {
//       roomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
//     }
    
//     if (!roomCode) return;
    
//     saveRecentRoom(roomCode);
//     onJoin({ name: name.trim(), room: roomCode });
//   };

//   const generateRoomCode = () => {
//     return Math.random().toString(36).substr(2, 6).toUpperCase();
//   };

//   return (
//     <motion.div 
//       className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-2xl p-8 w-full max-w-md shadow-xl"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//     >
//       <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
//         {isCreating ? 'Create a New Poll' : 'Join a Poll Room'}
//       </h2>
      
//       <form onSubmit={handleSubmit}>
//         <div className="mb-5">
//           <label htmlFor="name" className="block text-sm font-medium mb-2 dark:text-gray-300">
//             Your Name
//           </label>
//           <input
//             id="name"
//             type="text"
//             placeholder="Enter your display name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700"
//             required
//           />
//         </div>
        
//         {isCreating ? (
//           <div className="mb-5">
//             <div className="flex justify-between items-center mb-2">
//               <label className="block text-sm font-medium dark:text-gray-300">Room Code</label>
//               <button 
//                 type="button"
//                 onClick={() => setRoom(generateRoomCode())}
//                 className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
//               >
//                 Generate Code
//               </button>
//             </div>
//             <input
//               type="text"
//               placeholder="Room code will be generated"
//               value={room}
//               onChange={(e) => setRoom(e.target.value)}
//               className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700"
//             />
//           </div>
//         ) : (
//           <div className="mb-5">
//             <label htmlFor="room" className="block text-sm font-medium mb-2 dark:text-gray-300">
//               Room Code
//             </label>
//             <input
//               id="room"
//               type="text"
//               placeholder="Enter the room code"
//               value={room}
//               onChange={(e) => setRoom(e.target.value)}
//               className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700"
//               required
//             />
//           </div>
//         )}
        
//         <button
//           type="submit"
//           className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
//         >
//           {isCreating ? 'Create Room' : 'Join Room'}
//         </button>
//       </form>
      
//       <div className="mt-4 flex justify-center">
//         <button
//           onClick={() => setIsCreating(!isCreating)}
//           className="w-full bg-white text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 border-2 border-gray-400 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl"
//         >
//           {isCreating ? 'Join Existing Room Instead' : 'Create a New Room Instead'}
//         </button>
//       </div>
      
//       {recentRooms.length > 0 && !isCreating && (
//         <div className="mt-6">
//           <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Recent rooms:</p>
//           <div className="flex flex-wrap gap-2">
//             {recentRooms.map((recentRoom) => (
//               <button
//                 key={recentRoom}
//                 onClick={() => setRoom(recentRoom)}
//                 className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
//               >
//                 {recentRoom}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}
//     </motion.div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function JoinRoom({ onJoin }) {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [recentRooms, setRecentRooms] = useState([]);
  const [deletedRooms, setDeletedRooms] = useState(new Set());

  useEffect(() => {
    // Load recent rooms from local storage
    try {
      const saved = localStorage.getItem('recentRooms');
      if (saved) {
        setRecentRooms(JSON.parse(saved).slice(0, 5)); // Keep only 5 most recent
      }
    } catch (err) {
      console.error('Error loading recent rooms:', err);
    }
    
    // Load deleted rooms from localStorage
    try {
      const savedDeletedRooms = localStorage.getItem('deletedRooms');
      if (savedDeletedRooms) {
        setDeletedRooms(new Set(JSON.parse(savedDeletedRooms)));
      }
    } catch (err) {
      console.error('Error loading deleted rooms:', err);
    }
    
    // Listen for socket connection to get updated deleted rooms
    const socketUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
    fetch(`${socketUrl}/api/deleted-rooms`)
      .then(response => response.json())
      .then(data => {
        if (data.deletedRooms && Array.isArray(data.deletedRooms)) {
          // Update deleted rooms
          const newDeletedRooms = new Set([...data.deletedRooms]);
          setDeletedRooms(newDeletedRooms);
          localStorage.setItem('deletedRooms', JSON.stringify([...newDeletedRooms]));
          
          // Filter out deleted rooms from recent rooms
          if (recentRooms.length > 0) {
            const filteredRooms = recentRooms.filter(room => !newDeletedRooms.has(room));
            setRecentRooms(filteredRooms);
            localStorage.setItem('recentRooms', JSON.stringify(filteredRooms));
          }
        }
      })
      .catch(err => {
        console.error('Error fetching deleted rooms:', err);
      });
  }, []);

  const saveRecentRoom = (roomCode) => {
    try {
      // Don't save if the room is in the deleted list
      if (deletedRooms.has(roomCode)) {
        return;
      }
      
      const existing = JSON.parse(localStorage.getItem('recentRooms') || '[]');
      const updated = [roomCode, ...existing.filter(r => r !== roomCode)].slice(0, 5);
      localStorage.setItem('recentRooms', JSON.stringify(updated));
      setRecentRooms(updated);
    } catch (err) {
      console.error('Error saving recent room:', err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    let roomCode = room.trim().toUpperCase();
    if (isCreating) {
      roomCode = generateRoomCode();
    }
    
    if (!roomCode) return;
    
    // Check if room is deleted
    if (deletedRooms.has(roomCode)) {
      toast.error('This room has been deleted by the admin');
      return;
    }
    
    saveRecentRoom(roomCode);
    onJoin({ name: name.trim(), room: roomCode });
  };

  const generateRoomCode = () => {
    let code;
    do {
      code = Math.random().toString(36).substr(2, 6).toUpperCase();
    } while (deletedRooms.has(code));
    
    return code;
  };

  const filteredRecentRooms = recentRooms.filter(roomCode => !deletedRooms.has(roomCode));

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-2xl p-8 w-full max-w-md shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
        {isCreating ? 'Create a New Poll' : 'Join a Poll Room'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label htmlFor="name" className="block text-sm font-medium mb-2 dark:text-gray-300">
            Your Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Enter your display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700"
            required
          />
        </div>
        
        {isCreating ? (
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium dark:text-gray-300">Room Code</label>
              <button 
                type="button"
                onClick={() => setRoom(generateRoomCode())}
                className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
              >
                Generate Code
              </button>
            </div>
            <input
              type="text"
              placeholder="Room code will be generated"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700"
            />
          </div>
        ) : (
          <div className="mb-5">
            <label htmlFor="room" className="block text-sm font-medium mb-2 dark:text-gray-300">
              Room Code
            </label>
            <input
              id="room"
              type="text"
              placeholder="Enter the room code"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700"
              required
            />
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
        >
          {isCreating ? 'Create Room' : 'Join Room'}
        </button>
      </form>
      
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="w-full bg-white text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 border-2 border-gray-400 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl"
        >
          {isCreating ? 'Join Existing Room Instead' : 'Create a New Room Instead'}
        </button>
      </div>
      
      {filteredRecentRooms.length > 0 && !isCreating && (
        <div className="mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Recent rooms:</p>
          <div className="flex flex-wrap gap-2">
            {filteredRecentRooms.map((recentRoom) => (
              <button
                key={recentRoom}
                onClick={() => setRoom(recentRoom)}
                className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {recentRoom}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}