import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, QrCode } from 'lucide-react';
import QrReader from 'react-qr-reader';

const PlayerInterface: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [pseudonym, setPseudonym] = useState<string>('');
  const [joined, setJoined] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<any | null>(null);
  const [score, setScore] = useState<number>(0);
  const [showQrScanner, setShowQrScanner] = useState<boolean>(false);
  const [gameUrl, setGameUrl] = useState<string>('');

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('newQuestion', (question: any) => {
      setCurrentQuestion(question);
    });

    newSocket.on('updateScore', (newScore: number) => {
      setScore(newScore);
    });

    newSocket.on('gameEnded', () => {
      setCurrentQuestion(null);
      alert('The game has ended. Thank you for playing!');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (socket && pseudonym) {
      socket.emit('joinGame', { pseudonym, gameUrl });
      setJoined(true);
    }
  };

  const submitAnswer = (optionId: string) => {
    if (socket && currentQuestion) {
      socket.emit('submitAnswer', { questionId: currentQuestion.id, optionId, playerId: socket.id });
    }
  };

  const handleScan = (data: string | null) => {
    if (data) {
      setGameUrl(data);
      setShowQrScanner(false);
    }
  };

  const handleError = (err: any) => {
    console.error(err);
  };

  if (!joined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-400 to-blue-500">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Join Game</h2>
          {showQrScanner ? (
            <div className="mb-4">
              <QrReader
                delay={300}
                onError={handleError}
                onScan={handleScan}
                style={{ width: '100%' }}
              />
              <button
                onClick={() => setShowQrScanner(false)}
                className="mt-2 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-300"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowQrScanner(true)}
              className="mb-4 bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition duration-300 flex items-center justify-center"
            >
              <QrCode className="mr-2" />
              Scan QR Code
            </button>
          )}
          <form onSubmit={joinGame}>
            <input
              type="text"
              value={pseudonym}
              onChange={(e) => setPseudonym(e.target.value)}
              placeholder="Enter your pseudonym"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 flex items-center justify-center"
              disabled={!gameUrl}
            >
              <Send className="mr-2" />
              Join
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome, {pseudonym}!</h1>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Current Score: {score}</h2>
      </div>
      {currentQuestion && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">{currentQuestion.text}</h3>
          <div className="space-y-2">
            {currentQuestion.options.map((option: any) => (
              <button
                key={option.id}
                onClick={() => submitAnswer(option.id)}
                className="w-full text-left p-3 border border-gray-300 rounded-md hover:bg-blue-100 transition duration-300"
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerInterface;