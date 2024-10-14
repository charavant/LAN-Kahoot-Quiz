import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { PlusCircle, Play, Edit, Trash } from 'lucide-react';
import CreateQuiz from './CreateQuiz';
import EditQuiz from './EditQuiz';

interface Player {
  id: string;
  pseudonym: string;
}

interface Quiz {
  id: number;
  title: string;
}

const CoordinatorDashboard: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [qrCode, setQrCode] = useState<string>('');
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [showEditQuiz, setShowEditQuiz] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('updatePlayers', (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
    });

    newSocket.on('qrCode', (qrCodeData: string) => {
      setQrCode(qrCodeData);
    });

    newSocket.on('quizzes', (updatedQuizzes: Quiz[]) => {
      setQuizzes(updatedQuizzes);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const startQuiz = () => {
    if (socket && currentQuiz) {
      socket.emit('startQuiz', currentQuiz.id);
      window.open(`/game/${currentQuiz.id}`, '_blank');
    }
  };

  const selectQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
  };

  const deleteQuiz = (quizId: number) => {
    if (socket) {
      socket.emit('deleteQuiz', quizId);
    }
  };

  const editQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setShowEditQuiz(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Coordinator Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Quizzes</h2>
          <button
            onClick={() => setShowCreateQuiz(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center mb-4"
          >
            <PlusCircle className="mr-2" />
            Create Quiz
          </button>
          <ul>
            {quizzes.map((quiz) => (
              <li
                key={quiz.id}
                className={`p-2 mb-2 rounded cursor-pointer flex justify-between items-center ${
                  currentQuiz && currentQuiz.id === quiz.id
                    ? 'bg-blue-200'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span onClick={() => selectQuiz(quiz)}>{quiz.title}</span>
                <div>
                  <button
                    onClick={() => editQuiz(quiz)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => deleteQuiz(quiz.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Current Quiz</h2>
          {currentQuiz && (
            <div>
              <h3 className="text-lg font-medium mb-2">{currentQuiz.title}</h3>
              <button
                onClick={startQuiz}
                className="bg-green-500 text-white px-4 py-2 rounded flex items-center"
              >
                <Play className="mr-2" />
                Start Quiz
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Players</h2>
        <ul>
          {players.map((player) => (
            <li key={player.id} className="bg-gray-100 p-2 mb-2 rounded">
              {player.pseudonym}
            </li>
          ))}
        </ul>
      </div>
      {qrCode && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">QR Code</h2>
          <img src={qrCode} alt="QR Code" className="w-64 h-64" />
        </div>
      )}
      {showCreateQuiz && (
        <CreateQuiz
          onClose={() => setShowCreateQuiz(false)}
          onQuizCreated={(newQuiz) => {
            setQuizzes([...quizzes, newQuiz]);
            setShowCreateQuiz(false);
          }}
        />
      )}
      {showEditQuiz && editingQuiz && (
        <EditQuiz
          quiz={editingQuiz}
          onClose={() => setShowEditQuiz(false)}
          onQuizUpdated={(updatedQuiz) => {
            setQuizzes(quizzes.map(q => q.id === updatedQuiz.id ? updatedQuiz : q));
            setShowEditQuiz(false);
          }}
        />
      )}
    </div>
  );
};

export default CoordinatorDashboard;