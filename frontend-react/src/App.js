
import React, { useState } from "react";
import "./App.css";
import Signup from "./Signup";

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Home from "./Home";
import About from "./About";
import Contact from "./Contact";

function App() {

  const [user, setUser] = useState(null);
  const [page, setPage] = useState("login");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:9696/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.error) {
        setLoginError(data.error);
      } else {
        setUser(username);
        setLoginError("");
      }

    } catch (err) {
      console.error(err);
      setLoginError("❌ Backend not running");
    }
  };

  /* ================= LOGIN / SIGNUP ================= */
  if (!user) {
    return (
      <div className="login-wrapper">
        <div className="login-card">

          {page === "signup" ? (
            <Signup goLogin={() => setPage("login")} />
          ) : (
            <>
              <h2>🔐 Login</h2>

              <input
                placeholder="Username"
                onChange={(e) => setUsername(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />

              <button onClick={handleLogin}>Login</button>

              <p className="error">{loginError}</p>

              <p
                className="signup-link"
                onClick={() => setPage("signup")}
              >
                New user? Signup
              </p>
            </>
          )}

        </div>
      </div>
    );
  }

  /* ================= MAIN APP ================= */
  return (
    <Router>

      <nav className="navbar">
        <h2>🧠 Mental Health AI</h2>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <button onClick={() => setUser(null)}>Logout</button>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>

    </Router>
  );
}

export default App;
