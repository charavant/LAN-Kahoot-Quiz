import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateQuizProps {
  onClose: () => void;
  onQuizCreated: (quiz: any) => void;
}

const CreateQuiz: React.FC<CreateQuizProps> = ({ onClose, onQuizCreated }) => {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<{ text: string; options: { text: string; isCorrect: boolean }[] }[]>([]);

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
    const newQuiz = { title, questions };
    // Here you would typically send this data to your backend
    // For now, we'll just pass it to the parent component
    onQuizCreated(newQuiz);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Create New Quiz</h3>
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
              Create Quiz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuiz;