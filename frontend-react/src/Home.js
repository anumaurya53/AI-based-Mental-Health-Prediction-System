
import React, { useState } from "react";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale);

function Home() {

  const [form, setForm] = useState({
    name: "",
    age: "",
    sleep: "",
    work: "",
    text: ""
  });

  const [result, setResult] = useState("");
  const [chartData, setChartData] = useState(null);

  const [chat, setChat] = useState("");
  const [reply, setReply] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔮 PREDICT
  const predict = async () => {
    try {
      const res = await fetch("http://localhost:9696/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: form.name || "User",
          age: Number(form.age) || 20,
          sleep: Number(form.sleep) || 6,
          work: Number(form.work) || 8,
          text: form.text || ""
        })
      });

      const data = await res.json();

      setResult(
`👤 ${data.name}
📊 Stress Level: ${data.stress_level}
😴 Sleep: ${data.sleep} hrs

💡 ${data.solution}`
      );

      setChartData({
        labels: ["Sleep", "Stress"],
        datasets: [
          {
            label: "Health Analysis",
            data: [Number(data.sleep), Number(data.prediction)],
            backgroundColor: ["#4ade80", "#f87171"]
          }
        ]
      });

    } catch (err) {
      setResult("❌ Backend error");
    }
  };

  // 🤖 AI CHAT
  const askAI = async () => {
    try {
      const res = await fetch("http://localhost:9696/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: chat
        })
      });

      const data = await res.json();

      if (data.reply) {
        setReply(data.reply);
      } else if (data.error) {
        setReply("❌ " + data.error);
      } else {
        setReply("❌ No response from AI");
      }

    } catch (err) {
      setReply("❌ Server error");
    }
  };

  return (
    <div className="home-wrapper">

      {/* 🔮 PREDICTION CARD */}
      <div className="home-card">
        <h2>✨ Check Your Mental Health</h2>

        <input name="name" placeholder="Enter your name" onChange={handleChange} />
        <input name="age" placeholder="Enter your age" onChange={handleChange} />
        <input name="sleep" placeholder="Sleep hours (e.g. 6)" onChange={handleChange} />
        <input name="work" placeholder="Working hours (e.g. 8)" onChange={handleChange} />
        <input name="text" placeholder="How are you feeling?" onChange={handleChange} />

        <button onClick={predict}>Predict</button>

        {result && <pre className="result">{result}</pre>}

        {chartData && (
          <div style={{ marginTop: "20px" }}>
            <Bar key={JSON.stringify(chartData)} data={chartData} />
          </div>
        )}
      </div>

      {/* 🤖 CHATBOT CARD */}
      <div className="home-card">
        <h2>🤖 AI Assistant</h2>

        <input
          placeholder="Ask anything..."
          onChange={(e) => setChat(e.target.value)}
        />

        <button onClick={askAI}>Ask</button>

        {reply && <div className="chat-box">{reply}</div>}
      </div>

    </div>
  );
}

export default Home;