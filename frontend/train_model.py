import pandas as pd
import pickle
import re

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# ------------------ LOAD DATA ------------------
df = pd.read_csv("data/dreaddit-train.csv")

print("Columns:", df.columns)

# ------------------ RENAME ------------------
df = df.rename(columns={"post": "text", "subreddit": "label"})

# ------------------ REMOVE DUPLICATES ------------------
df = df.loc[:, ~df.columns.duplicated()]

# ------------------ DROP NULL ------------------
df = df.dropna(subset=["text", "label"])

# ------------------ CLEAN TEXT ------------------
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"http\S+|www\S+", "", text)
    text = re.sub(r"[^a-zA-Z ]", "", text)
    return text.strip()

df["text"] = df["text"].apply(clean_text)

# ------------------ LABEL FIX ------------------
# 🔥 REAL FIX
# ------------------ LABEL FIX ------------------
df["label"] = df["label"].astype("category").cat.codes

print("\nLabel Distribution:")
print(df["label"].value_counts())

# ------------------ DEBUG ------------------
print("\nLabel Distribution:")
print(df["label"].unique())

# ------------------ FEATURES ------------------
X = df["text"]
y = df["label"]

vectorizer = TfidfVectorizer(
    max_features=5000,
    stop_words="english",
    ngram_range=(1, 2)   # 🔥 better accuracy
)

X_vec = vectorizer.fit_transform(X)

# ------------------ SPLIT ------------------
X_train, X_test, y_train, y_test = train_test_split(
    X_vec, y, test_size=0.2, random_state=42
)

# ------------------ MODEL ------------------
model = LogisticRegression(
    max_iter=1000,
    class_weight="balanced"
)

model.fit(X_train, y_train)

# ------------------ EVALUATION ------------------
y_pred = model.predict(X_test)

print("\nAccuracy:", accuracy_score(y_test, y_pred))

# ------------------ DEBUG TEST ------------------
print("\nTest Predictions:")
print("Happy →", model.predict(vectorizer.transform(["i am very happy"]))[0])
print("Sad →", model.predict(vectorizer.transform(["i feel depressed"]))[0])
print("Worried →", model.predict(vectorizer.transform(["i am worried"]))[0])
print("Relaxed →", model.predict(vectorizer.transform(["i feel calm and relaxed"]))[0])
print("Anxious →", model.predict(vectorizer.transform(["i feel anxious and stressed"]))[0])

# ------------------ SAVE ------------------
pickle.dump(model, open("model.pkl", "wb"))
pickle.dump(vectorizer, open("vectorizer.pkl", "wb"))

print("\n✅ Model trained & saved successfully!")