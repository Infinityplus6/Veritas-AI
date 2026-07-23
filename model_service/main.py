"""Veritas AI model service — FastAPI wrapper around the deepfake-detector CNN.

Loads the Keras model via model_setup.paths and exposes:
  GET  /model-api/status   -> {ready, message}
  POST /model-api/predict  -> {label, probAiGenerated, probReal, confidence}
"""
import base64
import io
import os
import threading

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from PIL import Image
from pydantic import BaseModel

import model_setup
import helpers

app = FastAPI()

_state = {"model": None, "error": None}
_lock = threading.Lock()


def _load_model():
    try:
        import json
        import tensorflow as tf

        with open(model_setup.paths["class_names.json"]) as f:
            class_names = json.load(f)
        model = tf.keras.models.load_model(model_setup.paths["deepfake_detector.keras"])
        # Warm up so first user request is fast
        import numpy as np
        model.predict(np.zeros((1, helpers.IMG_SIZE, helpers.IMG_SIZE, 3), dtype="float32"), verbose=0)
        with _lock:
            _state["model"] = model
            _state["class_names"] = tuple(class_names)
    except Exception as e:  # noqa: BLE001
        with _lock:
            _state["error"] = str(e)


threading.Thread(target=_load_model, daemon=True).start()


class PredictIn(BaseModel):
    imageBase64: str


@app.get("/")
def root():
    return {"status": "ok", "service": "veritas-model"}


@app.get("/model-api/status")
def status():
    with _lock:
        if _state["model"] is not None:
            return {"ready": True, "message": "Model loaded"}
        if _state["error"]:
            return {"ready": False, "message": f"Model failed to load: {_state['error']}"}
    return {"ready": False, "message": "Model is loading"}


@app.post("/model-api/predict")
def predict(body: PredictIn):
    with _lock:
        model = _state["model"]
        class_names = _state.get("class_names", ("Real", "AI-Generated"))
    if model is None:
        return JSONResponse(status_code=503, content={"error": "Model is still loading"})

    data = body.imageBase64
    if "," in data[:64] and data.strip().lower().startswith("data:"):
        data = data.split(",", 1)[1]
    try:
        image = Image.open(io.BytesIO(base64.b64decode(data)))
        image.load()
    except Exception:  # noqa: BLE001
        return JSONResponse(status_code=400, content={"error": "Could not decode image"})

    label, scores = helpers.predict(model, image, class_names)
    prob_ai = float(scores[class_names[1]])
    prob_real = float(scores[class_names[0]])
    return {
        "label": label,
        "probAiGenerated": prob_ai,
        "probReal": prob_real,
        "confidence": max(prob_ai, prob_real),
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", "8090"))
    uvicorn.run(app, host="0.0.0.0", port=port)
