import React, { useState } from "react";

const StartScreen = ({ dispatch, selectCategory, selectRandom }) => {
  const [questionCount, setQuestionCount] = useState(20);

  const handleCategorySelect = (category) => {
    selectCategory(category, questionCount);
  };

  const handleRandomSelect = () => {
    selectRandom(questionCount);
  };

  return (
    <div className="start">
      <h2>Welcome to the Bible Quiz!</h2>
      <h3>Choose Your Bible Knowledge Challenge</h3>

      <div className="question-count-selector">
        <label>Number of Questions: </label>
        <select
          value={questionCount}
          onChange={(e) => setQuestionCount(Number(e.target.value))}
        >
          <option value={20}>20 Questions</option>
          <option value={50}>50 Questions</option>
          <option value={Infinity}>All Questions</option>
        </select>
      </div>

      <div className="options">
        <button
          className="btn btn-option"
          onClick={() => handleCategorySelect("easy")}
        >
          Easy
        </button>
        <button
          className="btn btn-option"
          onClick={() => handleCategorySelect("medium")}
        >
          Medium
        </button>
        <button
          className="btn btn-option"
          onClick={() => handleCategorySelect("hard")}
        >
          Hard
        </button>
        <button className="btn btn-option" onClick={handleRandomSelect}>
          Random Bible Questions
        </button>
      </div>
    </div>
  );
};

export default StartScreen;
