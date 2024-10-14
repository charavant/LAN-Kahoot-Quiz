import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

interface Question {
  id: number;
  text: string;
  image?: string;
  options: { id: number; text: string }[];
}

interface Player {
  id: string;
  pseudonym: string;
  score: number;
}

const GameInterface: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [answeredCount, setAnsweredCount] = useState<number>(0);
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [gameEnded, setGameEnded] = useState<boolean>(false);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.emit('joinGame', { quizId });

    newSocket.on('newQuestion', (question: Question) => {
      setCurrentQuestion(question);
      setTimeLeft(10);
      setAnsweredCount(0);
      setShowLeaderboard(false);
    });

    newSocket.on('updateAnsweredCount', (count: number) => {
      setAnsweredCount(count);
    });

    newSocket.on('updateTotalPlayers', (count: number) => {
      setTotalPlayers(count);
    });

    newSocket.on('showLeaderboard', (players: Player[]) => {
      setTopPlayers(players);
      setShowLeaderboard(true);
    });

    newSocket.on('gameEnded', () => {
      setGameEnded(true);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [quizId]);

  useEffect(() => {
    if (timeLeft > 0 && currentQuestion) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentQuestion) {
      socket?.emit('timeUp', { quizId });
    }
  }, [timeLeft, currentQuestion, quizId, socket]);

  const nextQuestion = () => {
    if (socket) {
      socket.emit('nextQuestion', { quizId });
    }
  };

  if (gameEnded) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Game Ended</h1>
        <h2 className="text-2xl font-semibold mb-4">Final Leaderboard</h2>
        <ol className="list-decimal list-inside">
          {topPlayers.map((player, index) => (
            <li key={player.id} className="text-lg mb-2">
              {player.pseudonym} - {player.score} points
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (showLeaderboard) {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-semibold mb-4">Top 5 Players</h2>
        <ol className="list-decimal list-inside">
          {topPlayers.slice(0, 5).map((player, index) => (
            <li key={player.id} className="text-lg mb-2">
              {player.pseudonym} - {player.score} points
            </li>
          ))}
        </ol>
        <button
          onClick={nextQuestion}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Next Question
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {currentQuestion && (
        <>
          <h2 className="text-2xl font-semibold mb-4">{currentQuestion.text}</h2>
          {currentQuestion.image && (
            <img src={currentQuestion.image} alt="Question" className="mb-4 max-w-full h-auto" />
          )}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                className="bg-white border-2 border-blue-500 text-blue-500 font-bold py-2 px-4 rounded hover:bg-blue-100"
              >
                {option.text}
              </button>
            ))}
          </div>
          <div className="mb-4 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${(timeLeft / 10) * 100}%` }}
            ></div>
          </div>
          <p className="text-lg">
            {answeredCount} out of {totalPlayers} players have answered
          </p>
        </>
      )}
    </div>
  );
};

export default GameInterface;