import pickle

# load trained model
with open("pipeline.pkl", "rb") as f:
    model = pickle.load(f)


def is_action_item(sentence):
    try:
        result = model.predict([sentence])[0]
        return result == 1
    except:
        return False



# import pickle

# # ✅ Load model ONCE when file runs
# with open("pipeline.pkl", "rb") as f:
#     model = pickle.load(f)


# def predict_action_items(transcript):
#     result = model.predict([transcript])[0]

#     # safety handling
#     if isinstance(result, int):
#         return ["Follow up on discussion", "Complete assigned tasks"]

#     if isinstance(result, str):
#         return result.split(",")

#     return result