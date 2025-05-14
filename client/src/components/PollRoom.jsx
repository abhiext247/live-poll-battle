
// import React, { useEffect, useState, useRef } from 'react';
// import { io } from 'socket.io-client';
// import VoteResult from './VoteResult';
// import { motion, AnimatePresence } from 'framer-motion';
// import { toast } from 'react-hot-toast';
// import confetti from 'canvas-confetti';

// export default function PollRoom({ userData, onLeaveRoom }) {
//   const [socket, setSocket] = useState(null);
//   const [hasVoted, setHasVoted] = useState(false);
//   const [userVote, setUserVote] = useState(null);
//   const [votes, setVotes] = useState({ A: 0, B: 0 });
//   const [timer, setTimer] = useState(60);
//   const [votingOpen, setVotingOpen] = useState(true);
//   const [connected, setConnected] = useState(false);
//   const [usersInRoom, setUsersInRoom] = useState([]);
//   const [pollQuestion, setPollQuestion] = useState("Cats vs Dogs");
//   const [pollOptions, setPollOptions] = useState({ A: "Cats", B: "Dogs" });
//   const [error, setError] = useState(null);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [showSettings, setShowSettings] = useState(false);
//   const [customQuestion, setCustomQuestion] = useState("");
//   const [customOptionA, setCustomOptionA] = useState("");
//   const [customOptionB, setCustomOptionB] = useState("");
  
//   const timerRef = useRef(null);
//   const roomRef = useRef(userData?.room);

//   useEffect(() => {
//     // Check if user already voted in this room
//     const savedVote = localStorage.getItem(`vote_${userData.room}`);
//     if (savedVote) {
//       setHasVoted(true);
//       setUserVote(savedVote);
//     }
    
//     // Connect to socket
//     const newSocket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3000', {
//       reconnectionAttempts: 5,
//       timeout: 10000,
//     });
    
//     setSocket(newSocket);
    
//     // Clean up function
//     return () => {
//       if (newSocket) newSocket.disconnect();
//       if (timerRef.current) clearInterval(timerRef.current);
//     };
//   }, []);
  
//   useEffect(() => {
//     if (!socket) return;
    
//     // Socket event handlers
//     socket.on('connect', () => {
//       setConnected(true);
//       socket.emit('join-room', userData);
//       toast.success('Connected to server');
//     });
    
//     socket.on('connect_error', () => {
//       setError('Failed to connect to server');
//       toast.error('Connection error! Trying to reconnect...');
//     });
    
//     socket.on('vote-update', (data) => {
//       setVotes(data.votes);
//       if (data.question) setPollQuestion(data.question);
//       if (data.options) setPollOptions(data.options);
//     });
    
//     socket.on('users-update', (users) => {
//       setUsersInRoom(users);
//     });
    
//     socket.on('timer', (timeLeft) => {
//       setTimer(timeLeft);
//       if (timeLeft <= 0) {
//         setVotingOpen(false);
//         // Trigger confetti for the winning option if voting has ended
//         const total = votes.A + votes.B;
//         if (total > 0) {
//           if (votes.A > votes.B) {
//             triggerConfetti();
//           } else if (votes.B > votes.A) {
//             triggerConfetti();
//           }
//         }
//       }
//     });
    
//     socket.on('admin-rights', () => {
//       setIsAdmin(true);
//       toast.success('You are the room admin');
//     });
    
//     socket.on('room-settings', (settings) => {
//       if (settings.question) setPollQuestion(settings.question);
//       if (settings.options) setPollOptions(settings.options);
//     });
    
//     socket.on('disconnect', () => {
//       setConnected(false);
//       toast.error('Disconnected from server');
//     });
    
//     return () => {
//       socket.off('connect');
//       socket.off('connect_error');
//       socket.off('vote-update');
//       socket.off('users-update');
//       socket.off('timer');
//       socket.off('admin-rights');
//       socket.off('room-settings');
//       socket.off('disconnect');
//     };
//   }, [socket, votes]);

//   const handleVote = (option) => {
//     if (hasVoted || !votingOpen || !connected) return;
    
//     socket.emit('vote', { room: userData.room, option });
//     setHasVoted(true);
//     setUserVote(option);
//     localStorage.setItem('voted', 'true');
//     localStorage.setItem(`vote_${userData.room}`, option);
    
//     toast.success(`Voted for ${pollOptions[option]}`);
//   };
  
//   const triggerConfetti = () => {
//     confetti({
//       particleCount: 150,
//       spread: 70,
//       origin: { y: 0.6 }
//     });
//   };
  
//   const updateRoomSettings = () => {
//     if (!isAdmin) return;
    
//     const newQuestion = customQuestion.trim() || pollQuestion;
//     const newOptionA = customOptionA.trim() || pollOptions.A;
//     const newOptionB = customOptionB.trim() || pollOptions.B;
    
//     socket.emit('update-room-settings', {
//       room: userData.room,
//       question: newQuestion,
//       options: { A: newOptionA, B: newOptionB }
//     });
    
//     setShowSettings(false);
//     toast.success('Room settings updated');
//   };
  
//   const copyRoomCode = () => {
//     navigator.clipboard.writeText(userData.room);
//     toast.success('Room code copied to clipboard');
//   };

//   const getTimerColor = () => {
//     if (timer > 30) return 'text-green-500';
//     if (timer > 10) return 'text-yellow-500';
//     return 'text-red-500';
//   };

//   if (error) {
//     return (
//       <div className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-2xl p-8 w-full max-w-md shadow-xl text-center">
//         <h2 className="text-2xl font-bold mb-4 text-red-500">Connection Error</h2>
//         <p className="mb-4">{error}</p>
//         <button 
//           onClick={onLeaveRoom}
//           className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded"
//         >
//           Back to Home
//         </button>
//       </div>
//     );
//   }

//   return (
//     <motion.div 
//       className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-2xl p-8 w-full max-w-2xl shadow-xl"
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ duration: 0.5 }}
//     >
//       {/* Header */}
//       <div className="flex justify-between items-center mb-4">
//         <div>
//           <h2 className="text-2xl font-bold">Poll Room</h2>
//           <div className="flex items-center gap-2 mt-1">
//             <span className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded cursor-pointer" onClick={copyRoomCode}>
//               {userData.room}
//             </span>
//             <button 
//               onClick={copyRoomCode} 
//               className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
//             >
//               Copy
//             </button>
//           </div>
//         </div>
//         <div className="flex gap-2">
//           {isAdmin && (
//             <button
//               onClick={() => setShowSettings(!showSettings)}
//               className="text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-lg"
//             >
//               Settings
//             </button>
//           )}
//           <button
//             onClick={onLeaveRoom}
//             className="text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-3 py-1 rounded-lg"
//           >
//             Leave
//           </button>
//         </div>
//       </div>
      
//       {/* Connection status */}
//       <div className="mb-4 flex items-center">
//         <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
//         <p className="text-sm text-gray-600 dark:text-gray-400">
//           {connected ? 'Connected' : 'Disconnected'} • {usersInRoom.length} users in room
//         </p>
//       </div>
      
//       {/* Admin settings panel */}
//       <AnimatePresence>
//         {showSettings && isAdmin && (
//           <motion.div 
//             className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//           >
//             <h3 className="font-medium mb-2">Room Settings</h3>
//             <div className="space-y-3">
//               <div>
//                 <label className="text-sm">Poll Question</label>
//                 <input
//                   type="text"
//                   value={customQuestion}
//                   onChange={(e) => setCustomQuestion(e.target.value)}
//                   placeholder={pollQuestion}
//                   className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded mt-1 bg-white dark:bg-gray-800"
//                 />
//               </div>
//               <div className="grid grid-cols-2 gap-2">
//                 <div>
//                   <label className="text-sm">Option A</label>
//                   <input
//                     type="text"
//                     value={customOptionA}
//                     onChange={(e) => setCustomOptionA(e.target.value)}
//                     placeholder={pollOptions.A}
//                     className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded mt-1 bg-white dark:bg-gray-800"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm">Option B</label>
//                   <input
//                     type="text"
//                     value={customOptionB}
//                     onChange={(e) => setCustomOptionB(e.target.value)}
//                     placeholder={pollOptions.B}
//                     className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded mt-1 bg-white dark:bg-gray-800"
//                   />
//                 </div>
//               </div>
//               <button
//                 onClick={updateRoomSettings}
//                 className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded text-sm"
//               >
//                 Update Settings
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
      
//       {/* Poll content */}
//       <div className="text-center mb-6">
//         <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Question</p>
//         <h3 className="text-2xl font-bold mb-6">{pollQuestion}</h3>
        
//         <div className="flex justify-center gap-4 mb-6">
//           <motion.button
//             disabled={hasVoted || !votingOpen}
//             onClick={() => handleVote('A')}
//             className={`px-8 py-4 rounded-lg font-medium transition-all ${
//               hasVoted && userVote === 'A'
//                 ? 'bg-indigo-100 border-2 border-indigo-500 text-indigo-700 dark:bg-indigo-900 dark:border-indigo-400 dark:text-indigo-300'
//                 : hasVoted
//                 ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
//                 : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg hover:shadow-xl'
//             } ${!votingOpen || !connected ? 'opacity-50 cursor-not-allowed' : ''}`}
//             whileHover={!hasVoted && votingOpen ? { scale: 1.05 } : {}}
//             whileTap={!hasVoted && votingOpen ? { scale: 0.95 } : {}}
//           >
//             {pollOptions.A}
//           </motion.button>
          
//           <motion.button
//             disabled={hasVoted || !votingOpen}
//             onClick={() => handleVote('B')}
//             className={`px-8 py-4 rounded-lg font-medium transition-all ${
//               hasVoted && userVote === 'B'
//                 ? 'bg-purple-100 border-2 border-purple-500 text-purple-700 dark:bg-purple-900 dark:border-purple-400 dark:text-purple-300'
//                 : hasVoted
//                 ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
//                 : 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-xl'
//             } ${!votingOpen || !connected ? 'opacity-50 cursor-not-allowed' : ''}`}
//             whileHover={!hasVoted && votingOpen ? { scale: 1.05 } : {}}
//             whileTap={!hasVoted && votingOpen ? { scale: 0.95 } : {}}
//           >
//             {pollOptions.B}
//           </motion.button>
//         </div>
        
//         <div className="flex items-center justify-center mb-6">
//           <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//           </svg>
//           <p className={`font-mono font-bold text-xl ${getTimerColor()}`}>
//             {votingOpen ? `${timer}s remaining` : 'Voting ended'}
//           </p>
//         </div>
        
//         {/* Status message */}
//         {hasVoted && (
//           <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
//             You voted for <span className="font-medium">{pollOptions[userVote]}</span>
//           </p>
//         )}
        
//         {!votingOpen && (
//           <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
//             Voting has ended
//           </p>
//         )}
//       </div>
      
//       {/* Results */}
//       <VoteResult votes={votes} pollOptions={pollOptions} hasVoted={hasVoted} votingEnded={!votingOpen} />
//     </motion.div>
//   );
// }

import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import VoteResult from './VoteResult';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';

export default function PollRoom({ userData, onLeaveRoom, onRoomDeleted }) {
  const [socket, setSocket] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [votes, setVotes] = useState({ A: 0, B: 0 });
  const [timer, setTimer] = useState(60);
  const [votingOpen, setVotingOpen] = useState(true);
  const [connected, setConnected] = useState(false);
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [pollQuestion, setPollQuestion] = useState("Cats vs Dogs");
  const [pollOptions, setPollOptions] = useState({ A: "Cats", B: "Dogs" });
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [customQuestion, setCustomQuestion] = useState("");
  const [customOptionA, setCustomOptionA] = useState("");
  const [customOptionB, setCustomOptionB] = useState("");
  const [roomDeleted, setRoomDeleted] = useState(false);
  
  const timerRef = useRef(null);
  const roomRef = useRef(userData?.room);

  useEffect(() => {
    // Check if user already voted in this room
    const savedVote = localStorage.getItem(`vote_${userData.room}`);
    if (savedVote) {
      setHasVoted(true);
      setUserVote(savedVote);
    }
    
    // Connect to socket
    const newSocket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3000', {
      reconnectionAttempts: 5,
      timeout: 10000,
    });
    
    setSocket(newSocket);
    
    // Clean up function
    return () => {
      if (newSocket) newSocket.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  
  useEffect(() => {
    if (!socket) return;
    
    // Socket event handlers
    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join-room', userData);
      toast.success('Connected to server');
    });
    
    socket.on('connect_error', () => {
      setError('Failed to connect to server');
      toast.error('Connection error! Trying to reconnect...');
    });
    
    socket.on('vote-update', (data) => {
      setVotes(data.votes);
      if (data.question) setPollQuestion(data.question);
      if (data.options) setPollOptions(data.options);
    });
    
    socket.on('users-update', (users) => {
      setUsersInRoom(users);
    });
    
    socket.on('timer', (timeLeft) => {
      setTimer(timeLeft);
      if (timeLeft <= 0) {
        setVotingOpen(false);
        // Trigger confetti for the winning option if voting has ended
        const total = votes.A + votes.B;
        if (total > 0) {
          if (votes.A > votes.B) {
            triggerConfetti();
          } else if (votes.B > votes.A) {
            triggerConfetti();
          }
        }
      }
    });
    
    socket.on('admin-rights', () => {
      setIsAdmin(true);
      toast.success('You are the room admin');
    });
    
    socket.on('room-settings', (settings) => {
      if (settings.question) setPollQuestion(settings.question);
      if (settings.options) setPollOptions(settings.options);
    });
    
    socket.on('room-deleted', () => {
      setRoomDeleted(true);
      if (onRoomDeleted) {
        onRoomDeleted();
      } else {
        onLeaveRoom();
      }
    });
    
    socket.on('disconnect', () => {
      setConnected(false);
      toast.error('Disconnected from server');
    });
    
    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('vote-update');
      socket.off('users-update');
      socket.off('timer');
      socket.off('admin-rights');
      socket.off('room-settings');
      socket.off('room-deleted');
      socket.off('disconnect');
    };
  }, [socket, votes, onRoomDeleted, onLeaveRoom]);

  const handleVote = (option) => {
    if (hasVoted || !votingOpen || !connected || timer <= 0) return;
    
    socket.emit('vote', { room: userData.room, option });
    setHasVoted(true);
    setUserVote(option);
    localStorage.setItem('voted', 'true');
    localStorage.setItem(`vote_${userData.room}`, option);
    
    toast.success(`Voted for ${pollOptions[option]}`);
  };
  
  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  };
  
  const updateRoomSettings = () => {
    if (!isAdmin) return;
    
    const newQuestion = customQuestion.trim() || pollQuestion;
    const newOptionA = customOptionA.trim() || pollOptions.A;
    const newOptionB = customOptionB.trim() || pollOptions.B;
    
    socket.emit('update-room-settings', {
      room: userData.room,
      question: newQuestion,
      options: { A: newOptionA, B: newOptionB }
    });
    
    setShowSettings(false);
    toast.success('Room settings updated');
  };
  
  const deleteRoom = () => {
    if (!isAdmin) return;
    
    if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      socket.emit('delete-room', { room: userData.room });
      onLeaveRoom();
    }
  };
  
  const copyRoomCode = () => {
    navigator.clipboard.writeText(userData.room);
    toast.success('Room code copied to clipboard');
  };

  const getTimerColor = () => {
    if (timer > 30) return 'text-green-500';
    if (timer > 10) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-2xl p-8 w-full max-w-md shadow-xl text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-500">Connection Error</h2>
        <p className="mb-4">{error}</p>
        <button 
          onClick={onLeaveRoom}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (roomDeleted) {
    return (
      <div className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-2xl p-8 w-full max-w-md shadow-xl text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-500">Room Deleted</h2>
        <p className="mb-4">This room has been deleted by the owner.</p>
        <button 
          onClick={onLeaveRoom}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-2xl p-8 w-full max-w-2xl shadow-xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">Poll Room</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded cursor-pointer" onClick={copyRoomCode}>
              {userData.room}
            </span>
            <button 
              onClick={copyRoomCode} 
              className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
            >
              Copy
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-lg"
              >
                Settings
              </button>
              <button
                onClick={deleteRoom}
                className="text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-3 py-1 rounded-lg"
              >
                Delete Room
              </button>
            </>
          )}
          <button
            onClick={onLeaveRoom}
            className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-lg"
          >
            Leave
          </button>
        </div>
      </div>
      
      {/* Connection status */}
      <div className="mb-4 flex items-center">
        <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {connected ? 'Connected' : 'Disconnected'} • {usersInRoom.length} users in room
        </p>
      </div>
      
      {/* Admin settings panel */}
      <AnimatePresence>
        {showSettings && isAdmin && (
          <motion.div 
            className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3 className="font-medium mb-2">Room Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm">Poll Question</label>
                <input
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder={pollQuestion}
                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded mt-1 bg-white dark:bg-gray-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm">Option A</label>
                  <input
                    type="text"
                    value={customOptionA}
                    onChange={(e) => setCustomOptionA(e.target.value)}
                    placeholder={pollOptions.A}
                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded mt-1 bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="text-sm">Option B</label>
                  <input
                    type="text"
                    value={customOptionB}
                    onChange={(e) => setCustomOptionB(e.target.value)}
                    placeholder={pollOptions.B}
                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded mt-1 bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
              <button
                onClick={updateRoomSettings}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded text-sm"
              >
                Update Settings
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Poll content */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Question</p>
        <h3 className="text-2xl font-bold mb-6">{pollQuestion}</h3>
        
        {hasVoted ? (
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-6">
            <p className="text-blue-700 dark:text-blue-300 font-medium">
              You have already voted in this Poll: <span className="font-bold">{pollOptions[userVote]}</span>
            </p>
          </div>
        ) : (
          <div className="flex justify-center gap-4 mb-6">
            <motion.button
              disabled={!votingOpen || !connected || timer <= 0}
              onClick={() => handleVote('A')}
              className={`px-8 py-4 rounded-lg font-medium transition-all ${
                !votingOpen || !connected || timer <= 0
                  ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg hover:shadow-xl'
              }`}
              whileHover={votingOpen && connected && timer > 0 ? { scale: 1.05 } : {}}
              whileTap={votingOpen && connected && timer > 0 ? { scale: 0.95 } : {}}
            >
              {pollOptions.A}
            </motion.button>
            
            <motion.button
              disabled={!votingOpen || !connected || timer <= 0}
              onClick={() => handleVote('B')}
              className={`px-8 py-4 rounded-lg font-medium transition-all ${
                !votingOpen || !connected || timer <= 0
                  ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-xl'
              }`}
              whileHover={votingOpen && connected && timer > 0 ? { scale: 1.05 } : {}}
              whileTap={votingOpen && connected && timer > 0 ? { scale: 0.95 } : {}}
            >
              {pollOptions.B}
            </motion.button>
          </div>
        )}
        
        <div className="flex items-center justify-center mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className={`font-mono font-bold text-xl ${getTimerColor()}`}>
            {votingOpen && timer > 0 ? `${timer}s remaining` : 'Voting ended'}
          </p>
        </div>
        
        {/* Status message */}
        {!votingOpen || timer <= 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Voting has ended
          </p>
        ) : null}
      </div>
      
      {/* Results */}
      <VoteResult 
        votes={votes} 
        pollOptions={pollOptions} 
        hasVoted={hasVoted} 
        votingEnded={!votingOpen || timer <= 0} 
      />
    </motion.div>
  );
}