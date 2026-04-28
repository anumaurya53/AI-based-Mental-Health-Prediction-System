
import React from "react";
import "./App.css";
import mental from "./assets/mental.jpg";

function About() {
  return (
    <div className="about-container">
      <div className="about-card">

        <h1 className="title">🧠 About This Project</h1>

        <img src={mental} alt="Mental Health" className="about-image" />

        <p>
          Mental health is an important part of overall well-being. Early detection
          of stress and anxiety can help improve lifestyle and prevent serious issues.
        </p>

        <p>
          This project is a <b>Mental Health Prediction System</b> built using{" "}
          <b>React (frontend)</b> and <b>Flask (backend)</b>. It uses a trained{" "}
          <b>Machine Learning model</b> to analyze user input and predict mental
          health conditions.
        </p>

        <p>
          The system also integrates an <b>AI Chatbot (LLaMA 3)</b> to provide
          real-time emotional support and helpful suggestions.
        </p>

        <h2 className="subtitle">✨ Key Features</h2>

        <div className="features">

          <div className="feature-card">
            <h3>🧠 Mental Analysis</h3>
            <p>Predict stress, anxiety & mental health conditions.</p>
          </div>

          <div className="feature-card">
            <h3>🤖 AI Chatbot</h3>
            <p>Real-time emotional support using LLaMA 3.</p>
          </div>

          <div className="feature-card">
            <h3>📊 ML Model</h3>
            <p>Trained model for accurate predictions.</p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default About;
