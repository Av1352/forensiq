import os
import io
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from gradcam_engine import analyze_image
from explainer import generate_forensic_explanation

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://forensiq.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    content = await file.read()
    image = Image.open(io.BytesIO(content))

    result = analyze_image(image)
    explanation = generate_forensic_explanation(
        result["verdict"], result["confidence"], result["region_activations"]
    )

    return {
        "verdict": result["verdict"],
        "confidence": result["confidence"],
        "overlay_image": result["overlay_base64"],
        "original_image": result["original_base64"],
        "region_activations": result["region_activations"],
        "explanation": explanation,
        "filename": file.filename
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
