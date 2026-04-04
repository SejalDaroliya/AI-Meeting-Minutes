from groq import Groq
import os
from concurrent.futures import ThreadPoolExecutor

def get_client():
    return Groq(api_key=os.getenv("GROQ_API_KEY"))

client = get_client()


def transcribe_chunk(chunk_path):
    with open(chunk_path, "rb") as f:
        response = client.audio.transcriptions.create(
            file=f,
            model="whisper-large-v3"
        )

    return response.text


def parallel_transcribe(chunks):
    transcripts = []

    # ✅ SAFE THREAD LIMIT (avoid API overload)
    max_workers = min(4, len(chunks))

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        results = list(executor.map(transcribe_chunk, chunks))

    # combine results
    return " ".join(results)








# orgg
# from groq import Groq
# from dotenv import load_dotenv
# import os
# from concurrent.futures import ThreadPoolExecutor

# load_dotenv()

# client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# def transcribe_chunk(chunk):

#     with open(chunk, "rb") as f:

#         result = client.audio.transcriptions.create(
#             file=f,
#             model="whisper-large-v3"
#         )

#     return result.text


# def parallel_transcribe(chunks):

#     texts = []

#     with ThreadPoolExecutor(max_workers=2) as executor:

#         results = executor.map(transcribe_chunk, chunks)

#         for text in results:
#             texts.append(text)

#     return " ".join(texts)