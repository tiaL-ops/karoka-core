import React, { useState } from 'react';
import graphQuiz from '../../data/quizzes/graphQuiz';
import linkedListQuiz from '../../data/quizzes/LinkedListQuiz';
import treeQuiz from '../../data/quizzes/TreeQuiz';  // Import tree quiz data

function QuizPage({ topic }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  // Load the appropriate quiz data based on the topic
  const quizData = {
    'dfs-bfs': graphQuiz['dfs-bfs'],
    'linked-list': linkedListQuiz['linked-list'],
    'binary-tree': treeQuiz['binary-tree']
  };

  // Fetch questions based on the topic
  const questions = quizData[topic];

  // Check if questions is undefined and handle it
  if (!questions || questions.length === 0) {
    return <div>No quiz data available for this topic.</div>;
  }

  // Handle answer click
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
