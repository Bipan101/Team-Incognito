from fastapi import FastAPI, File, HTTPException, UploadFile
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
from typing import Tuple
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Download the model files
final2_path = "model.h5"

ALPHABET_MODEL = tf.keras.models.load_model(final2_path)
ALPHABET_CLASS_NAMES = ['Ka', 'Kha']

# Remove the downloaded model files
# os.remove(final2_path)


def read_file_as_image(data: bytes, size: Tuple[int, int]) -> np.ndarray:
    image = Image.open(BytesIO(data))
    image = image.convert("RGB")
    image = image.resize(size)
    image = np.array(image)
    return image


@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
):
    # Read the image
    image_data = await file.read()

    # Predict the alphabet using your custom model
    image2 = read_file_as_image(image_data, size=(512, 512))
    img_batch = np.expand_dims(image2, 0)
    prediction = ALPHABET_MODEL.predict(img_batch)
    predicted_class = ALPHABET_CLASS_NAMES[np.argmax(prediction[0])]
    confidence = int(np.max(prediction[0])*100)
    print(predicted_class, "with a confidence of ", int(confidence*100))
    return {
        "predicted_class": predicted_class,
        "confidence": confidence
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
    