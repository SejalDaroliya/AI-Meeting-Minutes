
# new orgg variant -detailed summary
from groq import Groq
from dotenv import load_dotenv
import os
import json
import re
from model_loader import is_action_item
load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_meeting_data(transcript):

    # ✅ Limit transcript size (keeps speed + avoids token overflow)
    transcript = transcript[:6000]

    prompt = f"""
You are an AI meeting assistant.

Your task is to generate a PROFESSIONAL and DETAILED meeting summary.

IMPORTANT RULES:
- Summary MUST be at least 4–6 lines (not 1-2 lines)
- Include:
  • Purpose of the meeting
  • Key discussion points
  • Important ideas or suggestions
  • Final direction or outcome
- Write in clear, structured paragraph form
- Do NOT make it short or generic

Return ONLY valid JSON in this format:

{{
"insight":"Detailed meeting summary (4-6 lines paragraph)",
"key_points":["point1","point2","point3"],
"action_items":["task1","task2"],
"decisions":["decision1"]
}}

Transcript:
{transcript}
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4  # balanced: detailed but controlled
    )

    content = response.choices[0].message.content.strip()

    # ✅ Extract JSON safely
    match = re.search(r"\{.*\}", content, re.DOTALL)

    if match:
        try:
            json_text = match.group(0)
            return json.loads(json_text)
        except:
            pass

    # ✅ Fallback (safe for UI)
    return {
        "insight": "The meeting covered multiple discussion points and concluded with key decisions and actionable steps. Further clarification may be required.",
        "key_points": [],
        "action_items": [],
        "decisions": []
    }

def split_sentences(text):
    sentences = re.split(r'[.!?…]+', text)
    return [s.strip() for s in sentences if s.strip()]


# ✅ Step 1: Use YOUR MODEL
def filter_with_model(transcript):
    sentences = split_sentences(transcript)

    action_items = []
    for s in sentences:
        if is_action_item(s):
            action_items.append(s)

    return action_items


# ✅ Step 2: Use Groq ONLY for cleaning
def clean_with_groq(transcript, items):
    prompt = f"""
    Clean and refine the action items.

    Transcript:
    {transcript}

    Action Items:
    {items}

    Rules:
    - Convert into clear, professional action items
    - Remove duplicates
    - Keep concise
    - Output ONLY in this format:

      Action Items:
      - item 1
      - item 2

    - Do NOT add explanations
    - Use "-" only
    """

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content


# ✅ MAIN FUNCTION
def get_action_items_from_model(transcript):
    raw_items = filter_with_model(transcript)

    # print("\n🔹 Items from Model:")
    # print(raw_items)

    if not raw_items:
        raw_items = ["Review discussion and identify key tasks"]

    # Groq cleaning
    final_output = clean_with_groq(transcript, raw_items)

    # 🔥 LIMIT BASED ON LENGTH
    word_count = len(transcript.split())

    if word_count < 80:
        limit = 3
    elif word_count < 200:
        limit = 5
    else:
        limit = 7

    # extract items from text
    lines = final_output.split("\n")
    items = [line for line in lines if line.startswith("-")]

    limited_items = items[:limit]

    # rebuild output
    output = "Action Items:\n" + "\n".join(limited_items)

    return output

def format_action_items(raw_text):
    if isinstance(raw_text, list):
        return raw_text  # already correct

    if not raw_text:
        return []

    # remove heading
    raw_text = raw_text.replace("Action Items:", "")

    # split using "-"
    items = re.split(r"-\s*", raw_text)

    # clean items
    cleaned = [item.strip() for item in items if item.strip()]

    return cleaned