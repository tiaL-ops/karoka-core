import React, { useState } from 'react';
import graphQuiz from '../../data/quizzes/graphQuiz';  // Import quiz data

function QuizPage({ topic }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const questions = graphQuiz[topic];  // Get the quiz questions for the current topic

  const handleAnswerClick = (isCorrect) => {
    if (isCorrect) setScore(score + 1);
    const nextQuestion = currentQuestionIndex + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestionIndex(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  return (
    <div className="quiz-container">
      {showScore ? (
        <div>
          <h2>Your Score: {score}/{questions.length}</h2>
        </div>
      ) : (
        <div>
          <h3>{questions[currentQuestionIndex].question}</h3>
          <div>
            {questions[currentQuestionIndex].options.map((option, index) => (
              <button key={index} onClick={() => handleAnswerClick(option === questions[currentQuestionIndex].answer)}>
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizPage;
