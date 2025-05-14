


import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function VoteResult({ votes = { A: 0, B: 0 }, pollOptions = { A: 'Option A', B: 'Option B' }, hasVoted, votingEnded }) {
  const total = (votes.A ?? 0) + (votes.B ?? 0);
  const canvasRef = useRef(null);

  const percentA = total ? ((votes.A / total) * 100).toFixed(1) : 0;
  const percentB = total ? ((votes.B / total) * 100).toFixed(1) : 0;

  const winner = votes.A > votes.B ? 'A' : votes.B > votes.A ? 'B' : null;

  const barWidthA = total ? Math.max(5, (votes.A / total) * 100) : 5;
  const barWidthB = total ? Math.max(5, (votes.B / total) * 100) : 5;

  useEffect(() => {
    if (!canvasRef.current || (!hasVoted && !votingEnded)) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 150 * dpr;
    canvas.height = 150 * dpr;
    canvas.style.width = '150px';
    canvas.style.height = '150px';
    ctx.scale(dpr, dpr);

    const width = 150;
    const height = 150;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 10;

    ctx.clearRect(0, 0, width, height);

    if (total > 0) {
      const angleA = (votes.A / total) * Math.PI * 2;

      // Slice A
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, 0, angleA);
      ctx.closePath();
      ctx.fillStyle = '#6366f1';
      ctx.fill();

      // Slice B
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angleA, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = '#a855f7';
      ctx.fill();

      // Donut hole
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
      ctx.closePath();
      const isDark = document.documentElement.classList.contains('dark');
      ctx.fillStyle = isDark ? '#1f2937' : '#ffffff';
      ctx.fill();

      // Center text
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isDark ? '#ffffff' : '#000000';
      ctx.fillText(`${total} votes`, centerX, centerY);
    }
  }, [votes, total, hasVoted, votingEnded]);

  // Don't show results if user hasn't voted and voting is still open
  if (!hasVoted && !votingEnded) {
    return (
      <motion.div 
        className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-xl font-semibold mb-4">Live Results</h3>
        <div className="p-8 flex flex-col items-center justify-center">
          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          <p className="text-gray-600 dark:text-gray-400">Vote to see results</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Results are hidden until you vote to prevent bias</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="text-xl font-semibold mb-4 text-center">Live Results</h3>

      <div className="flex justify-center mb-6">
        <canvas ref={canvasRef}></canvas>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium flex items-center">
              <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
              {pollOptions?.A}
            </span>
            <span>{`${votes.A} votes (${percentA}%)`}</span>
          </div>
          <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full bg-indigo-500 rounded-full ${winner === 'A' ? 'relative overflow-hidden' : ''}`}
              style={{ width: `${barWidthA}%` }}
              initial={{ width: '0%' }}
              animate={{ width: `${barWidthA}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {winner === 'A' && votingEnded && (
                <motion.div 
                  className="absolute inset-0 bg-white opacity-30"
                  animate={{ x: ['100%', '-100%'] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
              )}
            </motion.div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium flex items-center">
              <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
              {pollOptions?.B}
            </span>
            <span>{`${votes.B} votes (${percentB}%)`}</span>
          </div>
          <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full bg-purple-500 rounded-full ${winner === 'B' ? 'relative overflow-hidden' : ''}`}
              style={{ width: `${barWidthB}%` }}
              initial={{ width: '0%' }}
              animate={{ width: `${barWidthB}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {winner === 'B' && votingEnded && (
                <motion.div 
                  className="absolute inset-0 bg-white opacity-30"
                  animate={{ x: ['100%', '-100%'] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {votingEnded && winner && (
        <motion.div 
          className="mt-6 p-3 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <p className="font-bold">Winner: {pollOptions?.[winner]}!</p>
          <p className="text-sm">
            {votes?.[winner]} votes ({winner === 'A' ? percentA : percentB}%)
          </p>
        </motion.div>
      )}

      {votingEnded && !winner && total > 0 && (
        <motion.div 
          className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-lg text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <p className="font-bold">It's a tie!</p>
          <p className="text-sm">{votes.A} votes each</p>
        </motion.div>
      )}
    </motion.div>
  );
}