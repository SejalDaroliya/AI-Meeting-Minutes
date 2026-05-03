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
from ai_processor import get_action_items_from_model
from ai_processor import format_action_items
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import json

import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from datetime import datetime
import pytz
from collections import defaultdict
from datetime import datetime, timedelta

ist = pytz.timezone('Asia/Kolkata')
utc = pytz.utc



load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={
    r"/*": {
        "origins": [
            "http://localhost:3000",
             "https://ai-meeting-minutes-delta.vercel.app"
        ]
    }
})


os.makedirs("temp", exist_ok=True)

scheduler = BackgroundScheduler()
scheduler.start()

def check_reminders():
    print("🔁 Checking reminders...")

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT reminder_id, title, message
        FROM meeting_reminders
        WHERE sent = FALSE 
        AND reminder_time <= NOW() AT TIME ZONE 'Asia/Kolkata'
    """)

    reminders = cur.fetchall()
    print("📌 Found reminders:", reminders)

    for reminder_id, title, message in reminders:

        cur.execute("""
            SELECT u.email
            FROM reminder_recipients rr
            JOIN users u ON u.user_id = rr.user_id
            WHERE rr.reminder_id = %s
        """, (reminder_id,))

        emails = [row[0] for row in cur.fetchall()]

        if emails:
            html = f"""
            <h2>{title}</h2>
            <p>{message}</p>
            """

            success = send_email(emails, "Reminder Notification", html)

            if success:
                cur.execute("""
                    UPDATE meeting_reminders
                    SET sent = TRUE
                    WHERE reminder_id = %s
                """, (reminder_id,))

    conn.commit()
    cur.close()
    conn.close()


# run every 1 minute
scheduler.add_job(check_reminders, "interval", minutes=15)

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
        title = request.form.get("title")

        if not title:
            title = os.path.splitext(file.filename)[0]

        file_id = str(uuid.uuid4())
        filepath = f"temp/{file_id}.mp3"
        file.save(filepath)

        start_time = time.time()

        # AI pipeline
        audio_path = convert_audio(filepath)
        chunks = split_audio(audio_path)
        transcript = parallel_transcribe(chunks)
        data = generate_meeting_data(transcript)
        processing_time = round(time.time() - start_time, 2)

        conn = get_db_connection()
        cur = conn.cursor()

        creator_id = request.form.get("user_id")
        participants = request.form.get("participants")
        participants = json.loads(participants) if participants else []
        #user_id = request.form.get("user_id")  # coming from frontend
        user_id = request.form.get("user_id")

        if not user_id:
            return jsonify({"error": "user_id missing"}), 400

        user_id = int(user_id)  # ✅ IMPORTANT FIX

        # 1️⃣ INSERT MEETING FIRST
        ist = pytz.timezone('Asia/Kolkata')
        now_ist = datetime.now(ist)

        cur.execute("""
            INSERT INTO meetings (user_id, title, meeting_date, transcript, processing_time)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING meeting_id
        """, (
            creator_id,
            title,
            now_ist,
            transcript,
            processing_time
        ))

        meeting_id = cur.fetchone()[0]

        # 2️⃣ INSERT PARTICIPANTS (NOW SAFE)
        for uid in participants:
            cur.execute("""
                INSERT INTO meeting_participants (meeting_id, user_id)
                VALUES (%s, %s)
            """, (meeting_id, uid))

        # 3️⃣ INSERT SUMMARY
        cur.execute("""
            INSERT INTO summaries (meeting_id, summary_text, key_points, action_items, decisions)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            meeting_id,
            data.get("insight"),
            json.dumps(data.get("key_points")),
            json.dumps(data.get("action_items")),
            json.dumps(data.get("decisions")) 
        ))

        conn.commit()

        # AI action items
        raw_actions = get_action_items_from_model(transcript)
        model_actions = format_action_items(raw_actions)

        if not model_actions:
            model_actions = data.get("action_items", [])

        cur.execute("""
            UPDATE summaries
            SET action_items = %s
            WHERE meeting_id = %s
        """, (
            json.dumps(model_actions),
            meeting_id
        ))
        # ALSO SAVE TO TRACKABLE ACTION ITEMS TABLE
        for item in model_actions:
            if isinstance(item, dict):
                task_text = item.get("task", "")
            else:
                task_text = str(item)

            if task_text.strip():
                cur.execute("""
                    INSERT INTO action_items (meeting_id, task, status)
                    VALUES (%s, %s, %s)
                    """, (meeting_id, task_text, "Pending"))

        conn.commit()

        cur.close()
        conn.close()

        os.remove(filepath)
        for chunk in chunks:
            os.remove(chunk)

        return jsonify({
            "success": True,
            "meeting_id": meeting_id,
            "processing_time": processing_time,
            "transcript": transcript,
            "insight": data.get("insight", ""),
            "key_points": data.get("key_points", []),
            "action_items": model_actions,
            "decisions": data.get("decisions", [])
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


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
#get meeting report
@app.route("/get-meeting/<int:meeting_id>", methods=["GET"])
def get_meeting(meeting_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT m.title, s.summary_text, s.key_points, s.action_items, s.decisions
            FROM meetings m
            JOIN summaries s ON m.meeting_id = s.meeting_id
            WHERE m.meeting_id = %s
        """, (meeting_id,))

        data = cur.fetchone()

        cur.close()
        conn.close()

        if not data:
            return {"error": "Meeting not found"}, 404
        
        return {
            "title": data[0],
            "summary": data[1],
            "key_points": data[2],
            "action_items": data[3],
            "decisions": json.loads(data[4]) if data[4] else []
        }

     
    except Exception as e:
        return {"error": str(e)}, 500
    
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
    report = data.get("report")

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

    # ✅ USE EDITED DATA IF AVAILABLE
    if report:
     summary_text = report.get("summary", summary_text)
     key_points = report.get("key_points", key_points)
     action_items = report.get("action_items", action_items)
     title = report.get("title", title)

    key_points = key_points or []
    action_items = action_items or []
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

@app.route("/create-reminder", methods=["POST"])
def create_reminder():
    try:
        data = request.json
        print("REQUEST DATA:", data)
        print("SELECTED USERS:", data.get("selected_users"))
        title = data.get("title")
        message = data.get("message")
        reminder_time = data.get("reminder_time")
        selected_users = data.get("selected_users", [])

        conn = get_db_connection()
        cur = conn.cursor()

        # 1. create reminder
        cur.execute("""
            INSERT INTO meeting_reminders (title, message, reminder_time)
            VALUES (%s, %s, %s)
            RETURNING reminder_id
        """, (title, message, reminder_time))

        reminder_id = cur.fetchone()[0]

        # 2. insert recipients
        for user_id in selected_users:
            cur.execute("""
                INSERT INTO reminder_recipients (reminder_id, user_id)
                VALUES (%s, %s)
            """, (reminder_id, user_id))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Reminder created successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/run-reminders")
def run_reminders():
    check_reminders()
    return {"message": "Reminders checked"}

@app.route("/users", methods=["GET"])
def get_users():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT user_id, name, email
        FROM users
        ORDER BY name
    """)

    users = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify({
        "users": [
            {
                "user_id": u[0],
                "name": u[1],
                "email": u[2]
            }
            for u in users
        ]
    })

@app.route("/recent-meetings/<int:user_id>", methods=["GET"])
def get_recent_meetings(user_id):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT meeting_id, title, meeting_date
        FROM meetings
        WHERE user_id = %s
        ORDER BY meeting_date DESC
        LIMIT 5
    """, (user_id,))

    meetings = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify({
        "meetings": [
            {
                "meeting_id": m[0],
                "title": m[1],
                "date": m[2].isoformat() if m[2] else None
            }
            for m in meetings
        ]
    })
    
@app.route("/meeting-summary/<int:meeting_id>", methods=["GET"])
def get_meeting_summary(meeting_id):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT m.title, m.meeting_date, m.transcript,
               s.summary_text, s.key_points, s.action_items, s.decisions, m.processing_time
        FROM meetings m
        JOIN summaries s ON m.meeting_id = s.meeting_id
        WHERE m.meeting_id = %s
    """, (meeting_id,))

    result = cur.fetchone()

    cur.close()
    conn.close()

    if not result:
        return jsonify({"error": "Meeting not found"}), 404

    title, date, transcript, summary, key_points, action_items, decisions,processing_time = result

    return jsonify({
        "title": title,
        "date": date,
        "transcript": transcript,
        "processing_time": processing_time,
        "insight": summary,
        "key_points": key_points,
        "action_items": action_items,
        "decisions": json.loads(decisions) if decisions else [] 
    })

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
            SELECT COUNT(s.summary_id)
            FROM summaries s
            JOIN meetings m ON s.meeting_id = m.meeting_id
            WHERE m.user_id = %s
        """, (user_id,))
        total_summaries = cur.fetchone()[0]

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
                if isinstance(row[0], list):
                    items = row[0]
                else:
                    items = json.loads(row[0])
                total_actions += len(items)

        # Avg processing time
        cur.execute("""
            SELECT ROUND(AVG(NULLIF(processing_time, 0))::numeric, 1)
            FROM meetings
            WHERE user_id = %s AND processing_time IS NOT NULL
        """, (user_id,))
        result = cur.fetchone()[0]
        avg_time = float(result) if result else 0

        cur.close()
        conn.close()

        return jsonify({
            "meetings": total_meetings or 0,
            "summaries": total_summaries or 0,
            "actions": total_actions or 0,
            "avg_time": avg_time or 0
        })

    except Exception as e:
        print("STATS ERROR:", e)
        return jsonify({
            "meetings": 0,
            "summaries": 0,
            "actions": 0,
            "avg_time": 0,
            "error": str(e)
        }), 200
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
    
# profile page 
@app.route("/profile/<int:user_id>", methods=["GET"])
def get_profile(user_id):
    conn = get_db_connection()
    cur = conn.cursor()

    # 1) User
    cur.execute("SELECT name, email FROM users WHERE user_id = %s", (user_id,))
    user = cur.fetchone()

    if not user:
        return jsonify({"error": "User not found"}), 404

    # 2) Summaries + stats
    cur.execute("""
        SELECT 
            s.key_points,
            s.action_items
        FROM summaries s
        JOIN meetings m ON s.meeting_id = m.meeting_id
        WHERE m.user_id = %s
    """, (user_id,))
    rows = cur.fetchall()

    total_key_points = 0
    total_action_items = 0

    for key_points, action_items in rows:

        # key points
        if key_points:
            if isinstance(key_points, str):
                try:
                    key_points = json.loads(key_points)
                except:
                    key_points = []

            total_key_points += len(key_points)

        # action items
        if action_items:
            if isinstance(action_items, str):
                try:
                    action_items = json.loads(action_items)
                except:
                    action_items = []

            total_action_items += len(action_items)

    # 3) Avg processing time (same as stats API)
    cur.execute("""
        SELECT ROUND(AVG(NULLIF(processing_time, 0))::numeric, 1)
        FROM meetings
        WHERE user_id = %s AND processing_time IS NOT NULL
    """, (user_id,))

    result = cur.fetchone()[0]
    avg_time = float(result) if result else 0

    # 4) 🔥 ACTIVITY GRAPH (last 7 days)
    cur.execute("""
        SELECT created_at
        FROM meetings
        WHERE user_id = %s
    """, (user_id,))

    meetings = cur.fetchall()

    activity_map = defaultdict(int)

    for (created_at,) in meetings:
        if created_at:
            day = created_at.date().isoformat()
            activity_map[day] += 1

    today = datetime.now().date()

    activity = []
    for i in range(29, -1, -1):
        day = today - timedelta(days=i)
        day_str = day.isoformat()

        activity.append({
            "date": day_str,
            "count": activity_map.get(day_str, 0)
        })
    # 4) DONE vs PENDING from real table
    cur.execute("""
        SELECT status
        FROM action_items ai
        JOIN meetings m ON ai.meeting_id = m.meeting_id
        WHERE m.user_id = %s
        """, (user_id,))

    rows = cur.fetchall()

    done = 0
    pending = 0

    for (status,) in rows:
        if status:
            status = status.lower()

            if status == "done":
                done += 1
            elif status == "pending":
                pending += 1
        conn.close()

    return jsonify({
        "name": user[0],
        "email": user[1],
        "meetings": len(rows),
        "key_points": total_key_points,
        "action_items": total_action_items,
        "avg_time": avg_time,
        "activity": activity,
        "done" : done,
        "pending" : pending   # 🔥 NEW FIELD
    })
#edit profile
@app.route("/update-profile/<int:user_id>", methods=["PUT"])
def update_profile(user_id):
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE users
        SET name = %s, email = %s
        WHERE user_id = %s
    """, (name, email, user_id))

    conn.commit()
    conn.close()

    return jsonify({"message": "Profile updated successfully"})    

@app.route("/reminders/<int:user_id>", methods=["GET"])
def get_reminders(user_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT 
                mr.reminder_id,
                mr.title,
                mr.message,
                mr.reminder_time,
                mr.sent
            FROM meeting_reminders mr
            JOIN reminder_recipients rr 
                ON mr.reminder_id = rr.reminder_id
            WHERE rr.user_id = %s
            ORDER BY mr.reminder_time DESC
        """, (user_id,))

        reminders = cur.fetchall()

        cur.close()
        conn.close()

        return jsonify({
            "reminders": [
                {
                    "reminder_id": r[0],
                    "title": r[1],
                    "message": r[2],
                    "reminder_time": r[3].isoformat() if r[3] else None,
                    "sent": r[4]
                }
                for r in reminders
            ]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/action-items/<int:user_id>", methods=["GET"])
def get_action_items(user_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # 1. Get meetings
        cur.execute("""
            SELECT meeting_id, title, meeting_date
            FROM meetings
            WHERE user_id = %s
            ORDER BY meeting_date DESC
        """, (user_id,))

        meetings = cur.fetchall()

        result = []

        for meeting_id, title, meeting_date in meetings:

            # 2. Get action items per meeting
            cur.execute("""
                SELECT task, status
                FROM action_items
                WHERE meeting_id = %s
            """, (meeting_id,))

            actions = cur.fetchall()

            tasks = [
                {"task": t[0], "status": t[1]}
                for t in actions
            ]

            result.append({
                "meeting_id": meeting_id,
                "meeting_title": title,
                "meeting_date": meeting_date.isoformat() if meeting_date else None,
                "tasks": tasks
            })

        cur.close()
        conn.close()

        return jsonify({"meetings": result})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/meeting-actions/<int:meeting_id>", methods=["GET"])
def get_meeting_actions(meeting_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT action_id, task, status, owner, created_at, updated_at
            FROM action_items
            WHERE meeting_id = %s
            ORDER BY action_id
        """, (meeting_id,))

        rows = cur.fetchall()

        cur.close()
        conn.close()

        return jsonify({
            "actions": [
                {
                    "action_id": r[0],
                    "task": r[1],
                    "status": r[2],
                    "owner": r[3],
                    "created_at": r[4].isoformat() if r[4] else None,
                    "updated_at": r[5].isoformat() if r[5] else None
                }
                for r in rows
            ]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/update-action-status/<int:action_id>", methods=["PUT"])
def update_action_status(action_id):
    try:
        data = request.json
        status = data.get("status")

        if status:
            status = status.strip()   # 🔥 removes hidden spaces

        allowed = ["Pending", "Done"]

        if status not in allowed:
            return jsonify({
                "error": "Invalid status",
                "received": status
            }), 400

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            UPDATE action_items
            SET status = %s,
                updated_at = NOW()
            WHERE action_id = %s
        """, (status, action_id))

        conn.commit()

        cur.close()
        conn.close()

        return jsonify({"message": "Status updated successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
# ---------------- RUN ---------------- #

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True, use_reloader=False)