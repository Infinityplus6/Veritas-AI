<div align="center">

# 🛡️ Veritas AI

### Detect AI-Generated Images with Deep Learning

*A minimalist CNN-powered deepfake detection platform.*

---
check it out <a href=https://veritas-ai-801058.replit.app/>here</a>

</div>

---

## Overview

Veritas AI is a web application that uses a **Convolutional Neural Network (CNN)** to determine whether an uploaded image is **authentic** or **AI-generated (deepfake)**.

The project combines a trained computer vision model with an intuitive user interface, allowing anyone to quickly test images without needing machine learning knowledge.

Designed with a clean, abstract aesthetic, Veritas AI focuses on delivering accurate predictions through a streamlined experience.

---

## Features

- 🧠 CNN-powered deepfake detection
- 📤 Upload your own images
- 🖼️ Built-in sample images for instant testing
- 📊 Confidence scores with visual probability bars
- ⚡ Fast inference
- 🎨 Minimal, modern UI
- ☁️ Deployment-ready for Replit

---

## How It Works

1. Upload an image (or select one of the provided examples).
2. The image is preprocessed to match the model's expected input.
3. The trained CNN performs inference.
4. The application displays:
   - Prediction label
   - Confidence score
   - Class probabilities

---

## Tech Stack

### Machine Learning

- Python
- TensorFlow / Keras CNN
- NumPy
- Pillow

### Frontend

- Streamlit / Gradio *(depending on implementation)*

### Backend

- Python

---

## Project Structure

```text
Veritas-AI/
│
├── app.py                 # Web application
├── model_setup.py         # Loads model and preprocessing assets
├── requirements.txt
├── models/
│   └── ...
├── sample_images/
├── assets/
└── README.md
```

---

## Installation

Clone the repository.

```bash
git clone https://github.com/yourusername/veritas-ai.git
cd veritas-ai
```

Install dependencies.

```bash
pip install -r requirements.txt
```

Run the application.

```bash
python app.py
```

or

```bash
streamlit run app.py
```

(depending on the frontend framework used)

---

## Deployment

The project is configured to run on **Replit**.

Deployment configuration:

- Uses the `PORT` environment variable
- Binds to `0.0.0.0`
- Loads the trained CNN automatically
- Displays a loading state while the model initializes
- Ready for production deployment

---

## Sample Images

If the project includes a `sample_images` directory, Veritas AI automatically displays these examples inside the interface so users can immediately test the model without uploading their own files.

---

## Model

The application automatically discovers and loads every required asset from the project bundle through `model_setup.py`, including:

- trained CNN model
- preprocessing utilities
- label mappings
- helper scripts
- additional inference resources

This makes the application adaptable to future model updates without changing the UI.

---

## Future Improvements

- Batch image analysis
- Heatmaps showing manipulated regions
- Explainable AI (Grad-CAM visualizations)
- Confidence calibration
- Drag-and-drop uploads
- Mobile responsive interface
- API endpoint for integrations
- Support for video deepfake detection

---

## License

Released under the MIT License.

---

<div align="center">

**Veritas AI**

*Trust what you see.*

</div>
