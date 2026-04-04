from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time
import uuid

from audio_utils import convert_audio, split_audio
from transcription import parallel_transcribe
from ai_processor import generate_meeting_data

app = Flask(__name__)
CORS(app)

os.makedirs("temp", exist_ok=True)

@app.route("/process-audio", methods=["POST"])
def process_audio():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]

        # ✅ UNIQUE FILE NAME (important for scalability)
        file_id = str(uuid.uuid4())
        filepath = f"temp/{file_id}.mp3"
        file.save(filepath)

        start_time = time.time()

        # ✅ Step 1: convert only if needed
        audio_path = convert_audio(filepath)

        # ✅ Step 2: split audio (optimized)
        chunks = split_audio(audio_path)

        # ✅ Step 3: parallel transcription
        transcript = parallel_transcribe(chunks)

        # ✅ Step 4: AI summary
        data = generate_meeting_data(transcript)

        processing_time = round(time.time() - start_time, 2)

        # ✅ CLEANUP FILES (important long-term)
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


@app.route("/")
def home():
    return "MeetPilot Backend Running 🚀"


if __name__ == "__main__":
    app.run(debug=True)










# ORGINIAL
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import os
# import time

# from audio_utils import convert_audio, split_audio
# from transcription import parallel_transcribe
# from ai_processor import generate_meeting_data

# app = Flask(__name__)
# CORS(app)  # allow frontend (React) to connect

# # create temp folder if not exists
# os.makedirs("temp", exist_ok=True)

# @app.route("/process-audio", methods=["POST"])
# def process_audio():
#     try:
#         # check file
#         if "file" not in request.files:
#             return jsonify({"error": "No file uploaded"}), 400

#         file = request.files["file"]

#         # save file
#         filepath = "temp/input_audio.mp3"
#         file.save(filepath)

#         start_time = time.time()

#         # 🔹 Step 1: convert audio
#         audio = convert_audio(filepath)

#         # 🔹 Step 2: split audio
#         chunks = split_audio(audio)

#         # 🔹 Step 3: transcribe
#         transcript = parallel_transcribe(chunks)

#         # 🔹 Step 4: generate summary
#         data = generate_meeting_data(transcript)

#         processing_time = round(time.time() - start_time, 2)

#         return jsonify({
#             "success": True,
#             "processing_time": processing_time,
#             "transcript": transcript,
#             "insight": data.get("insight", ""),
#             "key_points": data.get("key_points", []),
#             "action_items": data.get("action_items", []),
#             "decisions": data.get("decisions", [])
#         })

#     except Exception as e:
#         return jsonify({
#             "success": False,
#             "error": str(e)
#         }), 500


# @app.route("/")
# def home():
#     return "MeetPilot Backend Running 🚀"


# if __name__ == "__main__":
#     app.run(debug=True)