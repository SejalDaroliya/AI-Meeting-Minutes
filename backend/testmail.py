# test_mail.py
import smtplib
import os
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

def send_test_mail():
    msg = MIMEText("SMTP working from Flask 🚀")
    msg["Subject"] = "Flask SMTP Test"
    msg["From"] = EMAIL_USER
    msg["To"] = "mehrashraddha1293@gmail.com"

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASS)
            server.send_message(msg)

        print("✅ Email sent successfully")

    except Exception as e:
        print("❌ Error:", e)

send_test_mail()