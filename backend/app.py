import os
import time
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
import json

# DBpython -m pip install flask-cors
from config.db import get_db_connection

# AI modules
from audio_utils import convert_audio, split_audio
from transcription import parallel_transcribe
from ai_processor import generate_meeting_data
from dotenv import load_dotenv
import os
import bcrypt

import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={
    r"/*": {
        "origins": [
            "http://localhost:3000",
            "https://ai-meeting-minutes-6gyshe55s-sejaldaroliyas-projects.vercel.app"
        ]
    }
})


os.makedirs("temp", exist_ok=True)


def send_email(to_emails, subject, html):
    import sib_api_v3_sdk
    from sib_api_v3_sdk.rest import ApiException
    import os

    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = os.getenv("BREVO_API_KEY")
    print("BREVO_API_KEY:", os.getenv("BREVO_API_KEY"))
    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
        sib_api_v3_sdk.ApiClient(configuration)
    )

    to_list = [{"email": email} for email in to_emails]

    text_content = "Meeting Summary\n\n" + subject

    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=to_list,
        subject=subject,
        html_content=html,
        text_content=text_content,
        sender={
            "email": "sejal.daroliya04@gmail.com",   # ✅ KEY CHANGE
            "name": "AI Meeting App"
        },
        reply_to={
            "email": "sejal.daroliya04@gmail.com",
            "name": "Sejal"
        }
    )

    try:
        response = api_instance.send_transac_email(send_smtp_email)
        print("BREVO RESPONSE:", response)
        return True
    except ApiException as e:
        print("BREVO ERROR:", e)
        return False

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

        #user_id = request.form.get("user_id")  # coming from frontend
        user_id = request.form.get("user_id")

        if not user_id:
            return jsonify({"error": "user_id missing"}), 400

        user_id = int(user_id)  # ✅ IMPORTANT FIX

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
            print("HASH:", stored_hash)
            print("TYPE:", type(stored_hash))
            return {
                "success": True,
                "user": {
                    "user_id": user_id,
                    "name": name,
                    "email": email
                }
            }
        

    return {"success": False, "message": "Invalid credentials"}
#get recepients
@app.route("/get-recipients/<int:meeting_id>", methods=["GET"])
def get_recipients(meeting_id):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT u.user_id, u.name, u.email
        FROM meeting_participants mp
        JOIN users u ON mp.user_id = u.user_id
        WHERE mp.meeting_id = %s
    """, (meeting_id,))
    participants = cur.fetchall()

    participant_ids = [p[0] for p in participants]

    if participant_ids:
        cur.execute("""
            SELECT user_id, name, email
            FROM users
            WHERE user_id NOT IN %s
        """, (tuple(participant_ids),))
    else:
        cur.execute("SELECT user_id, name, email FROM users")

    non_participants = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify({
        "participants": [
            {"user_id": p[0], "name": p[1], "email": p[2]}
            for p in participants
        ],
        "non_participants": [
            {"user_id": u[0], "name": u[1], "email": u[2]}
            for u in non_participants
        ]
    })
#send email
@app.route("/send-email", methods=["POST"])
def send_email_route():
    data = request.json

    meeting_id = data.get("meeting_id")
    selected_emails = list(set(data.get("selected_emails", [])))

    if not selected_emails:
        return jsonify({"error": "No recipients selected"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT title, meeting_date FROM meetings WHERE meeting_id=%s",
        (meeting_id,)
    )
    meeting = cur.fetchone()

    cur.execute("""
        SELECT summary_text, key_points, action_items
        FROM summaries
        WHERE meeting_id=%s
    """, (meeting_id,))
    summary = cur.fetchone()

    cur.close()
    conn.close()

    if not meeting or not summary:
        return jsonify({"error": "Meeting data not found"}), 404

    title, date = meeting
    summary_text, key_points, action_items = summary

    key_points = json.loads(key_points) if key_points else []
    action_items = json.loads(action_items) if action_items else []

    html = f"""
    <div style="font-family: Arial; padding: 20px;">
        <h2>{title}</h2>
        <p><b>Date:</b> {date}</p>

        <h3>Summary</h3>
        <p>{summary_text}</p>

        <h3>Key Points</h3>
        <ul>
            {''.join(f"<li>{kp}</li>" for kp in key_points)}
        </ul>

        <h3>Action Items</h3>
        <ul>
            {''.join(f"<li>{ai}</li>" for ai in action_items)}
        </ul>
    </div>
    """

    success = send_email(selected_emails, f"Meeting Summary: {title}", html)

    if success:
        return jsonify({"message": "Email sent successfully"})
    else:
        return jsonify({"error": "Failed to send email"}), 500
#test route
@app.route("/test-send-email")
def test_send_email():
    return send_email_route_test()
# ADD HELPER FUNCTION HERE
def send_email_route_test():
    meeting_id = 1
    selected_emails = ["yourpersonal@gmail.com"]

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT title, meeting_date FROM meetings WHERE meeting_id=%s", (meeting_id,))
    meeting = cur.fetchone()

    cur.execute("""
        SELECT summary_text, key_points, action_items
        FROM summaries
        WHERE meeting_id=%s
    """, (meeting_id,))
    summary = cur.fetchone()

    cur.close()
    conn.close()

    if not meeting or not summary:
        return {"error": "Meeting data not found"}

    title, date = meeting
    summary_text, key_points, action_items = summary

    key_points = json.loads(key_points)
    action_items = json.loads(action_items)

    html = f"""
    <h2>{title}</h2>
    <p><b>Date:</b> {date}</p>
    <h3>Summary</h3>
    <p>{summary_text}</p>
    """

    send_email(selected_emails, f"Meeting Summary: {title}", html)

    return {"message": "Test email sent successfully"}


#user stats at dashboard
@app.route("/user-stats/<int:user_id>", methods=["GET"])
def get_user_stats(user_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Total meetings
        cur.execute("SELECT COUNT(*) FROM meetings WHERE user_id = %s", (user_id,))
        total_meetings = cur.fetchone()[0]

        # Total summaries
        cur.execute("""
            SELECT COUNT(*)
            FROM summaries s
            JOIN meetings m ON s.meeting_id = m.meeting_id
            WHERE m.user_id = %s
        """, (user_id,))
        total_minutes = cur.fetchone()[0]

        # Total action items
        cur.execute("""
            SELECT action_items
            FROM summaries s
            JOIN meetings m ON s.meeting_id = m.meeting_id
            WHERE m.user_id = %s
        """, (user_id,))

        rows = cur.fetchall()

        total_actions = 0

        for row in rows:
            if row[0]:
                # ✅ FIX HERE
                if isinstance(row[0], list):
                    items = row[0]
                else:
                    items = json.loads(row[0])

                total_actions += len(items)

        cur.close()
        conn.close()

        return jsonify({
            "meetings": total_meetings or 0,
            "minutes": total_minutes or 0,
            "actions": total_actions or 0,
            "files": total_meetings or 0
        })

    except Exception as e:
        print("STATS ERROR:", e)  # 👈 VERY IMPORTANT
        return jsonify({
            "meetings": 0,
            "minutes": 0,
            "actions": 0,
            "files": 0,
            "error": str(e)
        }), 200   # 👈 return 200 so frontend still works
    

#recent meeting stats at dashboard
@app.route("/user-meetings/<int:user_id>", methods=["GET"])
def get_user_meetings(user_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT m.meeting_id, m.title, m.meeting_date
            FROM meetings m
            WHERE m.user_id = %s
            ORDER BY m.meeting_date DESC
            LIMIT 5
        """, (user_id,))

        meetings = cur.fetchall()

        cur.close()
        conn.close()

        return jsonify([
            {
                "meeting_id": m[0],
                "title": m[1],
                "date": str(m[2])
            }
            for m in meetings
        ])

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
# ---------------- RUN ---------------- #

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True, use_reloader=False)