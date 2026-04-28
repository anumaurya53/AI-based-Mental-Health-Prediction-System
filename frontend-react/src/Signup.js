
import React, { useState } from "react";

function Signup({ goLogin }) {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSignup = async () => {
    try {
      const res = await fetch("http://127.0.0.1:9696/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.error) {
        setMsg("❌ " + data.error);
      } else {
        setMsg("✅ Signup successful 🎉");

        // 🔥 Auto redirect after 2 sec
        setTimeout(() => {
          goLogin();
        }, 2000);
      }

    } catch (err) {
      setMsg("❌ Backend error");
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "linear-gradient(to right, #667eea, #764ba2)"
    }}>
      <div style={{
        background: "rgba(255,255,255,0.95)",
        padding: "30px",
        borderRadius: "15px",
        width: "320px",
        textAlign: "center",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
      }}>
        <h2>📝 Signup</h2>

        {/* 🔥 ALERT MESSAGE */}
        {msg && (
          <div style={{
            marginBottom: "10px",
            padding: "8px",
            borderRadius: "8px",
            background: msg.includes("❌") ? "#ffe5e5" : "#e6ffed",
            color: msg.includes("❌") ? "#d8000c" : "#006400",
            fontSize: "14px"
          }}>
            {msg}
          </div>
        )}

        <input
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: "100%", padding: "10px", margin: "8px 0", borderRadius: "8px", border: "1px solid #ccc" }}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "10px", margin: "8px 0", borderRadius: "8px", border: "1px solid #ccc" }}
        />

        <button
          onClick={handleSignup}
          style={{
            width: "100%",
            padding: "10px",
            background: "linear-gradient(45deg, #ff6b9d, #ff4f9a)",
            border: "none",
            borderRadius: "8px",
            color: "white",
            cursor: "pointer",
            marginTop: "10px"
          }}
        >
          Signup
        </button>

        <p
          style={{ marginTop: "10px", cursor: "pointer", color: "#555" }}
          onClick={goLogin}
        >
          Already have account? Login
        </p>

      </div>
    </div>
  );
}

export default Signup;
