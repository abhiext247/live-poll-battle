

import React, { useState, useEffect } from 'react';
import JoinRoom from './components/JoinRoom';
import PollRoom from './components/PollRoom';
import { Toaster, toast } from 'react-hot-toast';

export default function App() {
  const [joined, setJoined] = useState(false);
  const [userData, setUserData] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);

  // Check if user was already in a room before refresh
  useEffect(() => {
    const savedUserData = localStorage.getItem('pollUserData');
    if (savedUserData) {
      try {
        const parsedData = JSON.parse(savedUserData);
        setUserData(parsedData);
        setJoined(true);
      } catch (err) {
        localStorage.removeItem('pollUserData');
      }
    }
  }, []);

  const handleJoin = (data) => {
    if (!data.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!data.room.trim()) {
      toast.error('Please enter a room code');
      return;
    }
    localStorage.setItem('pollUserData', JSON.stringify(data));
    setUserData(data);
    setJoined(true);
    toast.success(`Joined room: ${data.room}`);
  };

  const handleLeaveRoom = () => {
    localStorage.removeItem('pollUserData');
    localStorage.removeItem('voted');
    localStorage.removeItem(`vote_${userData?.room}`);
    setJoined(false);
    setUserData(null);
    toast.success('Left the room');
  };

  const handleRoomDeleted = () => {
    localStorage.removeItem('pollUserData');
    localStorage.removeItem('voted');
    localStorage.removeItem(`vote_${userData?.room}`);
    setJoined(false);
    setUserData(null);
    toast.error('This room has been deleted by the owner');
  };

  const updateAvailableRooms = (rooms) => {
    setAvailableRooms(rooms);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 p-4 flex flex-col items-center justify-center">
      <Toaster position="top-right" />
      
      <h1 className="text-3xl font-bold text-center mb-8 text-indigo-800 dark:text-indigo-300">
        Live Poll Battle
      </h1>
      
      {!joined ? (
        <JoinRoom onJoin={handleJoin} availableRooms={availableRooms} updateAvailableRooms={updateAvailableRooms} />
      ) : (
        <PollRoom userData={userData} onLeaveRoom={handleLeaveRoom} onRoomDeleted={handleRoomDeleted} />
      )}
    </div>
  );
}