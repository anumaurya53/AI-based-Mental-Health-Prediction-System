import re
import warnings
import pickle
import sqlite3
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests   # ✅ NEW (IMPORTANT)
warnings.filterwarnings("ignore")

# ---------------- LOAD MODEL ----------------
try:
    model = pickle.load(open("model.pkl", "rb"))
    vect = pickle.load(open("vectorizer.pkl", "rb"))
    print("✅ Model loaded")
except Exception as e:
    print("❌ Model load error:", e)

# ---------------- DB INIT ----------------
def init_db():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        prediction REAL,
        sleep REAL,
        time TEXT
    )
    """)

    conn.commit()
    conn.close()

# ---------------- CLEAN TEXT ----------------
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"http\S+|www\S+", "", text)
    text = re.sub(r"[^a-zA-Z ]", "", text)
    return text.strip()

# ---------------- APP ----------------
app = Flask(__name__)
CORS(app)

init_db()

# ---------------- HOME ----------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "API running 🚀"})

# ---------------- SIGNUP ----------------
@app.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"error": "Username & password required"}), 400

        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM users WHERE username=?", (username,))
        if cursor.fetchone():
            conn.close()
            return jsonify({"error": "User already exists"}), 400

        cursor.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            (username, password)
        )
        conn.commit()
        conn.close()

        return jsonify({"message": "Signup successful"})

    except Exception as e:
        print("Signup error:", e)
        return jsonify({"error": "Signup failed"}), 500

# ---------------- LOGIN ----------------
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()

        cursor.execute(
            "SELECT * FROM users WHERE username=? AND password=?",
            (username, password)
        )
        user = cursor.fetchone()
        conn.close()

        if user:
            return jsonify({"message": "Login success"})
        else:
            return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        print("Login error:", e)
        return jsonify({"error": "Login failed"}), 500

# ---------------- PREDICT ----------------
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        name = data.get("name", "User")
        age = int(data.get("age", 20))
        sleep = float(data.get("sleep", 6))
        text = clean_text(data.get("text", ""))

        X = vect.transform([text])
        pred = int(model.predict(X)[0])

        score = pred
        if sleep < 5:
            score += 1
        if age < 18 or age > 50:
            score += 0.5

        if score <= 0:
            level = "Low 😊"
            solution = "Stay positive and maintain routine."
        elif score <= 1:
            level = "Medium ⚠️"
            solution = "Try meditation and improve sleep."
        else:
            level = "High 🚨"
            solution = "Take rest, talk to someone, seek help."

        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()

        cursor.execute("""
        INSERT INTO history (name, prediction, sleep, time)
        VALUES (?, ?, ?, ?)
        """, (
            name,
            float(score),
            sleep,
            datetime.now().strftime("%H:%M")
        ))

        conn.commit()
        conn.close()

        return jsonify({
            "name": name,
            "stress_level": level,
            "prediction": float(score),
            "sleep": sleep,
            "solution": solution
        })

    except Exception as e:
        print("Prediction error:", e)
        return jsonify({"error": "Prediction failed"}), 500

# ---------------- HISTORY ----------------
@app.route("/history", methods=["GET"])
def history():
    try:
        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()

        cursor.execute("SELECT name, prediction, sleep, time FROM history")
        rows = cursor.fetchall()
        conn.close()

        data = []
        for row in rows:
            data.append({
                "name": row[0],
                "prediction": row[1],
                "sleep": row[2],
                "time": row[3]
            })

        return jsonify(data)

    except Exception as e:
        print("History error:", e)
        return jsonify([])

# ---------------- AI CHATBOT (FINAL FIX) ----------------
@app.route('/chat', methods=['POST'])
def chat():
    try:
        user_input = request.json.get("message")

        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": "Bearer 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",  # 👈 apni key
                "Content-Type": "application/json"
            },
            json={
               "model": "meta-llama/llama-3-8b-instruct",
                "messages": [
                    {"role": "user", "content": user_input}
                ]
            }
        )

        data = response.json()
        print("DEBUG:", data)  # 🔥 important

        # ✅ SAFE handling
        if "choices" in data:
            reply = data["choices"][0]["message"]["content"]
        else:
            reply = data.get("error", {}).get("message", "No response")

        return jsonify({"reply": reply})

    except Exception as e:
        return jsonify({"error": str(e)})

# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=9696)