import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    DATABASE_URL = os.getenv("DATABASE_URL")

    conn = psycopg2.connect(DATABASE_URL, sslmode='require')
    return conn