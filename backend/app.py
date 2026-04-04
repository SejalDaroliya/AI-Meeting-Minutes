import os
import time
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
import json

# DB
from config.db import get_db_connection

# AI modules
from audio_utils import convert_audio, split_audio
from transcription import parallel_transcribe
from ai_processor import generate_meeting_data
from dotenv import load_dotenv
import os
import bcrypt

load_dotenv()

app = Flask(__name__)
CORS(app)

os.makedirs("temp", exist_ok=True)

# ---------------- BASIC ROUTES ---------------- #

@app.route("/")
def home():
    return {"message": "AI Meeting Minutes API running 🚀"}

@app.route("/test-db")
def test_db():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT NOW();")
    result = cur.fetchone()
    cur.close()
    conn.close()
    return {"database_time": result}


# ---------------- MAIN AI ROUTE ---------------- #

@app.route("/process-audio", methods=["POST"])
def process_audio():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]
        filename = os.path.splitext(file.filename)[0]

        file_id = str(uuid.uuid4())
        filepath = f"temp/{file_id}.mp3"
        file.save(filepath)

        start_time = time.time()

        # AI Pipeline
        audio_path = convert_audio(filepath)
        chunks = split_audio(audio_path)
        transcript = parallel_transcribe(chunks)
        data = generate_meeting_data(transcript)

        processing_time = round(time.time() - start_time, 2)

        conn = get_db_connection()
        cur = conn.cursor()

        user_id = request.form.get("user_id")  # coming from frontend

        # 1️⃣ Insert into meetings
        cur.execute("""
            INSERT INTO meetings (user_id, title, meeting_date, transcript)
            VALUES (%s, %s, NOW(), %s)
            RETURNING meeting_id
        """, (
            user_id,
            filename,
            transcript
        ))

        meeting_id = cur.fetchone()[0]

        # 2️⃣ Insert into summaries
        cur.execute("""
            INSERT INTO summaries (meeting_id, summary_text, key_points, action_items)
            VALUES (%s, %s, %s, %s)
        """, (
            meeting_id,
            data.get("insight"),
            json.dumps(data.get("key_points")),
            json.dumps(data.get("action_items"))
        ))

        conn.commit()
        cur.close()
        conn.close()
        try:
            os.remove(filepath)
            for chunk in chunks:
                os.remove(chunk)
        except:
            pass

        return jsonify({
            "success": True,
            "processing_time": processing_time,
            "transcript": transcript,
            "insight": data.get("insight", ""),
            "key_points": data.get("key_points", []),
            "action_items": data.get("action_items", []),
            "decisions": data.get("decisions", [])
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/signup", methods=["POST"])
def signup():
    data = request.json

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    # 🔐 HASH PASSWORD
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO users (name, email, password_hash)
        VALUES (%s, %s, %s)
    """, (name, email, hashed_password.decode('utf-8')))

    conn.commit()
    cur.close()
    conn.close()

    return {"message": "User created successfully"}

@app.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data.get("email")
    password = data.get("password")

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT user_id, name, password_hash FROM users WHERE email=%s", (email,))
    user = cur.fetchone()

    cur.close()
    conn.close()

    if user:
        user_id, name, stored_hash = user

        # 🔐 CHECK PASSWORD
        if bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8')):
            return {
                "success": True,
                "user": {
                    "user_id": user_id,
                    "name": name,
                    "email": email
                }
            }

    return {"success": False, "message": "Invalid credentials"}
    # raise Exception("LOGIN HIT")

# ---------------- RUN ---------------- #

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, port=port)