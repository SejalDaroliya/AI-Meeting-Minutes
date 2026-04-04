from pydub import AudioSegment
import os
import uuid

def convert_audio(filepath):
    # ✅ Skip conversion if already WAV
    if filepath.endswith(".wav"):
        return filepath

    audio = AudioSegment.from_file(filepath)

    output_path = f"temp/{uuid.uuid4()}.wav"
    audio.export(output_path, format="wav")

    return output_path


def split_audio(audio_path):
    audio = AudioSegment.from_file(audio_path)

    chunk_length_ms = 25000  # ✅ 25 seconds (optimal)

    chunks = []
    total_length = len(audio)

    for i in range(0, total_length, chunk_length_ms):
        chunk = audio[i:i + chunk_length_ms]

        chunk_name = f"temp/chunk_{uuid.uuid4()}.wav"
        chunk.export(chunk_name, format="wav")

        chunks.append(chunk_name)

    # ✅ LIMIT CHUNKS FOR SPEED (safe for demo + scalable later)
    return chunks[:6]





# orgg
# from pydub import AudioSegment
# import os

# def convert_audio(audio_path):

#     os.makedirs("temp", exist_ok=True)

#     audio = AudioSegment.from_file(audio_path)
#     audio = audio.set_frame_rate(16000).set_channels(1)

#     output = "temp/processed.wav"
#     audio.export(output, format="wav")

#     return output


# def split_audio(audio_path, chunk_sec=120):

#     audio = AudioSegment.from_file(audio_path)

#     chunk_length = chunk_sec * 1000
#     chunks = []

#     for i in range(0, len(audio), chunk_length):

#         chunk = audio[i:i+chunk_length]
#         filename = f"temp/chunk_{i}.wav"

#         chunk.export(filename, format="wav")
#         chunks.append(filename)

#     return chunks