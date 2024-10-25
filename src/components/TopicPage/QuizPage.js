import React, { useState } from 'react';
import graphQuiz from '../../data/quizzes/graphQuiz';
import linkedListQuiz from '../../data/quizzes/LinkedListQuiz';
import treeQuiz from '../../data/quizzes/TreeQuiz';
import './QuizzPage.css';

function QuizPage({ topic }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // For controlling popup visibility
  const [correctAnswer, setCorrectAnswer] = useState(''); // Store the correct answer

  const quizData = {
    'dfs-bfs': graphQuiz['dfs-bfs'],
    'linked-list': linkedListQuiz['linked-list'],
    'binary-tree': treeQuiz['binary-tree'],
  };

  const questions = quizData[topic];

  if (!questions || questions.length === 0) {
    return <div className="no-data">No quiz data available for this topic.</div>;
  }

  // Handle answer selection
  const handleAnswerClick = (selectedOption) => {
    const isCorrect = selectedOption === questions[currentQuestionIndex].answer;

    if (isCorrect) {
      setScore(score + 1);
      goToNextQuestion();
    } else {
      // Show popup with the correct answer
      setCorrectAnswer(questions[currentQuestionIndex].answer);
      setShowPopup(true);
    }
  };

  const goToNextQuestion = () => {
    const nextQuestion = currentQuestionIndex + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestionIndex(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    goToNextQuestion();
  };

  return (
    <div className="quiz-container">
      {showScore ? (
        <div className="score-container">
          <h2>Your Score: {score}/{questions.length}</h2>
          <button onClick={() => {
            setCurrentQuestionIndex(0);
            setScore(0);
            setShowScore(false);
          }}>
            Retry
          </button>
        </div>
      ) : (
        <div className="question-container">
          <h3>{questions[currentQuestionIndex].question}</h3>
          <div className="options-container">
            {questions[currentQuestionIndex].options.map((option, index) => (
              <button
                key={index}
                className="quiz-option-btn"
                onClick={() => handleAnswerClick(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popup for showing the correct answer */}
      {showPopup && (
        <div className="popup-container">
          <div className="popup-content">
            <h4>Wrong Answer!</h4>
            <p>The correct answer is: <strong>{correctAnswer}</strong></p>
            <button onClick={closePopup}>Next Question</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizPage;
