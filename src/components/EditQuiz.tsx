import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { io } from 'socket.io-client';

interface EditQuizProps {
  quiz: {
    id: number;
    title: string;
  };
  onClose: () => void;
  onQuizUpdated: (quiz: any) => void;
}

const EditQuiz: React.FC<EditQuizProps> = ({ quiz, onClose, onQuizUpdated }) => {
  const [title, setTitle] = useState(quiz.title);
  const [questions, setQuestions] = useState<{ id?: number; text: string; options: { id?: number; text: string; isCorrect: boolean }[] }[]>([]);

  useEffect(() => {
    const socket = io('http://localhost:3001');
    socket.emit('getQuizDetails', quiz.id);
    socket.on('quizDetails', (details) => {
      setQuestions(details.questions);
    });
    return () => {
      socket.disconnect();
    };
  }, [quiz.id]);

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: [{ text: '', isCorrect: false }] }]);
  };

  const updateQuestion = (index: number, text: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].text = text;
    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push({ text: '', isCorrect: false });
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, text: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex].text = text;
    setQuestions(updatedQuestions);
  };

  const toggleCorrectOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.map((option, index) => ({
      ...option,
      isCorrect: index === optionIndex,
    }));
    setQuestions(updatedQuestions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedQuiz = { id: quiz.id, title, questions };
    const socket = io('http://localhost:3001');
    socket.emit('updateQuiz', updatedQuiz);
    socket.on('quizUpdated', (updatedQuiz) => {
      onQuizUpdated(updatedQuiz);
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Edit Quiz</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
              Quiz Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          {questions.map((question, qIndex) => (
            <div key={qIndex} className="mb-4 p-4 border rounded">
              <input
                type="text"
                value={question.text}
                onChange={(e) => updateQuestion(qIndex, e.target.value)}
                placeholder="Question text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                required
              />
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    placeholder="Option text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                    required
                  />
                  <input
                    type="radio"
                    checked={option.isCorrect}
                    onChange={() => toggleCorrectOption(qIndex, oIndex)}
                    className="mr-2"
                  />
                  <label>Correct</label>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addOption(qIndex)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
              >
                Add Option
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addQuestion}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
          >
            Add Question
          </button>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Update Quiz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuiz;