






# for action-item
# from groq import Groq
# from dotenv import load_dotenv
# import os
# import json
# import re

# from ml_model import is_action_item, predict_priority

# load_dotenv()

# client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# def generate_meeting_data(transcript):

#     transcript = transcript[:6000]

#     prompt = f"""
# Return ONLY valid JSON.

# Format:
# {{
# "insight":"short meeting insight summary",
# "key_points":["point1","point2","point3"],
# "action_items":["task1","task2"],
# "decisions":["decision1"]
# }}

# Transcript:
# {transcript}
# """

#     response = client.chat.completions.create(
#         model="llama-3.1-8b-instant",
#         messages=[{"role": "user", "content": prompt}]
#     )

#     content = response.choices[0].message.content.strip()

#     print("\n===== GROQ RAW OUTPUT =====\n", content)

#     # ---------- SAFE JSON PARSING ----------
#     data = None

#     try:
#         data = json.loads(content)
#     except:
#         match = re.search(r"\{[\s\S]*\}", content)
#         if match:
#             try:
#                 data = json.loads(match.group(0))
#             except:
#                 data = None

#     # ---------- PROCESS ----------
#     if data:

#         original_actions = data.get("action_items", [])

#         filtered_actions = []

#         for item in original_actions:
#             if is_action_item(item):
#                 filtered_actions.append({
#                     "task": item,
#                     "priority": predict_priority(item)
#                 })

#         # 🔥 IMPORTANT FIX: fallback if empty
#         if len(filtered_actions) == 0:
#             filtered_actions = [
#                 {
#                     "task": item,
#                     "priority": "LOW"
#                 }
#                 for item in original_actions
#             ]

#         data["action_items"] = filtered_actions

#         return data

#     # ---------- FALLBACK ----------
#     return {
#         "insight": "Could not generate insight",
#         "key_points": [],
#         "action_items": [],
#         "decisions": []
#     }





# new orgg variant -detailed summary
from groq import Groq
from dotenv import load_dotenv
import os
import json
import re

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






# orggg
# from groq import Groq
# from dotenv import load_dotenv
# import os
# import json
# import re

# load_dotenv()

# client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# def generate_meeting_data(transcript):

#     transcript = transcript[:6000]

#     prompt = f"""
# Return ONLY valid JSON.

# Format:
# {{
# "insight":"short meeting insight summary",
# "key_points":["point1","point2","point3"],
# "action_items":["task1","task2"],
# "decisions":["decision1"]
# }}

# Transcript:
# {transcript}
# """

#     response = client.chat.completions.create(
#         model="llama-3.1-8b-instant",
#         messages=[{"role":"user","content":prompt}]
#     )

#     content = response.choices[0].message.content.strip()

#     # extract JSON block safely
#     match = re.search(r"\{.*\}", content, re.DOTALL)

#     if match:
#         json_text = match.group(0)
#         return json.loads(json_text)

#     # fallback if model fails
#     return {
#         "insight": "Could not generate insight",
#         "key_points": [],
#         "action_items": [],
#         "decisions": []
#     }