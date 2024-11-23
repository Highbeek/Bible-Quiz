import React, { useReducer, useEffect } from "react";
import DateCounter from "./DateCounter";
import Header from "./Header";
import Loader from "./Loader";
import Error from "./Error";
import Main from "./Main";
import StartScreen from "./StartScreen";
import Question from "./Question";
import NextButton from "./NextButton";
import Progress from "./Progress";
import { FinishScreen } from "./FinishScreen";
import Footer from "./Footer";
import Timer from "./Timer";

// Define question limits per category
const CATEGORY_LIMITS = {
  easy: 10,
  medium: 15,
  hard: 20,
  random: 50,
};

// Dynamically set time per category with an average calculation
const CATEGORY_TIMES = {
  easy: { baseTime: 20, avgTime: null },
  medium: { baseTime: 30, avgTime: null },
  hard: { baseTime: 40, avgTime: null },
};

const initialState = {
  questions: [],
  status: "loading",
  index: 0,
  answer: null,
  points: 0,
  highScore: 0,
  secondsRemaining: null,
  currentCategory: null,
  timePerQuestion: null,
};

// Function to calculate time per question dynamically
const calculateTimePerQuestion = (questions) => {
  const complexityWeights = {
    easy: 1,
    medium: 1.5,
    hard: 2,
  };

  if (questions && questions.length > 0) {
    const complexity = questions[0].difficulty || "medium";
    const baseTime = CATEGORY_TIMES[complexity].baseTime;

    const adjustedTime = baseTime * complexityWeights[complexity];

    CATEGORY_TIMES[complexity].avgTime = adjustedTime;

    return Math.round(adjustedTime);
  }

  return 30;
};

const reducer = (state, action) => {
  switch (action.type) {
    case "dataReceived":
      const timePerQuestion = calculateTimePerQuestion(action.payload);
      return {
        ...state,
        questions: action.payload,
        status: "ready",
        timePerQuestion: timePerQuestion,
      };
    case "dataFailed":
      return {
        ...state,
        status: "error",
      };
    case "selectCategory":
      return {
        ...state,
        status: "active",
        secondsRemaining: state.questions.length * state.timePerQuestion,
      };
    case "selectRandom":
      return {
        ...state,
        status: "active",
        secondsRemaining: state.questions.length * state.timePerQuestion,
      };
    case "start":
      return {
        ...state,
        status: "active",
        secondsRemaining: state.questions.length * state.timePerQuestion,
      };
    case "newAnswer":
      const question = state.questions.at(state.index);
      return {
        ...state,
        answer: action.payload,
        points:
          action.payload === question.correctOption
            ? state.points + question.points
            : state.points,
      };
    case "nextQuestion":
      return {
        ...state,
        index: state.index + 1,
        answer: null,
      };
    case "finish":
      return {
        ...state,
        status: "finished",
        highScore:
          state.points > state.highScore ? state.points : state.highScore,
      };
    case "restart":
      return {
        ...initialState,
        questions: state.questions,
        status: "ready",
      };
    case "tick":
      return {
        ...state,
        secondsRemaining: state.secondsRemaining - 1,
        status: state.secondsRemaining === 0 ? "finished" : state.status,
      };
    default:
      throw new Error("Action is Unknown");
  }
};

const App = () => {
  const [
    {
      questions,
      status,
      index,
      answer,
      points,
      highScore,
      secondsRemaining,
      timePerQuestion,
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:9000/easy").then((res) => res.json()),
      fetch("http://localhost:9000/medium").then((res) => res.json()),
      fetch("http://localhost:9000/hard").then((res) => res.json()),
    ])
      .then(([easyQuestions, mediumQuestions, hardQuestions]) => {
        const allQuestions = [
          ...easyQuestions,
          ...mediumQuestions,
          ...hardQuestions,
        ];
        const randomQuestions = allQuestions
          .sort(() => Math.random() - 0.5)
          .slice(0, 20);

        dispatch({ type: "dataReceived", payload: randomQuestions });
      })
      .catch((err) => dispatch({ type: "dataFailed" }));
  }, []);

  const selectCategory = (category, limit = Infinity) => {
    fetch(`http://localhost:9000/${category}`)
      .then((res) => res.json())
      .then((data) => {
        const shuffledQuestions = data
          .sort(() => Math.random() - 0.5)
          .slice(0, limit);

        dispatch({
          type: "dataReceived",
          payload: shuffledQuestions,
        });
        dispatch({ type: "selectCategory" });
      })
      .catch(() => dispatch({ type: "dataFailed" }));
  };

  const selectRandom = (limit = Infinity) => {
    Promise.all([
      fetch("http://localhost:9000/easy").then((res) => res.json()),
      fetch("http://localhost:9000/medium").then((res) => res.json()),
      fetch("http://localhost:9000/hard").then((res) => res.json()),
    ])
      .then(([easyQuestions, mediumQuestions, hardQuestions]) => {
        const allQuestions = [
          ...easyQuestions.map((q) => ({ ...q, difficulty: "easy" })),
          ...mediumQuestions.map((q) => ({ ...q, difficulty: "medium" })),
          ...hardQuestions.map((q) => ({ ...q, difficulty: "hard" })),
        ];

        const randomQuestions = allQuestions
          .sort(() => Math.random() - 0.5)
          .slice(0, limit);

        dispatch({
          type: "dataReceived",
          payload: randomQuestions,
        });
        dispatch({ type: "selectRandom" });
      })
      .catch(() => dispatch({ type: "dataFailed" }));
  };

  const numQuestions = questions.length;
  const maxPossiblePoints = questions.reduce(
    (prev, cur) => prev + cur.points,
    0
  );

  return (
    <div className="app">
      <Header />
      <Main>
        {status === "loading" && <Loader />}
        {status === "error" && <Error />}
        {status === "ready" && (
          <StartScreen
            dispatch={dispatch}
            selectCategory={selectCategory}
            selectRandom={selectRandom}
          />
        )}
        {status === "active" && (
          <>
            <Progress
              index={index}
              numQuestions={numQuestions}
              points={points}
              maxPossiblePoints={maxPossiblePoints}
              answer={answer}
            />
            <Question
              question={questions[index]}
              dispatch={dispatch}
              answer={answer}
              points={points}
            />
            <Footer>
              <Timer dispatch={dispatch} secondsRemaining={secondsRemaining} />
              <NextButton
                dispatch={dispatch}
                answer={answer}
                numQuestions={numQuestions}
                index={index}
              />
            </Footer>
          </>
        )}
        {status === "finished" && (
          <FinishScreen
            points={points}
            maxPossiblePoints={maxPossiblePoints}
            highScore={highScore}
            dispatch={dispatch}
          />
        )}
      </Main>
    </div>
  );
};

export default App;
