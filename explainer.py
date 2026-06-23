import os
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def generate_forensic_explanation(verdict: str, confidence: float, region_activations: list):
    top_regions = region_activations[:3]
    region_text = "\n".join([
        f"- {r['region']}: activation strength {r['activation']:.2f}"
        for r in top_regions
    ])

    prompt = f"""You are a forensic AI analyst writing a brief explanation for a deepfake detection report.

Detection result: {verdict}
Confidence: {confidence}%

The model's attention (Grad-CAM saliency) was strongest in these facial regions, in order:
{region_text}

Write exactly one paragraph (3-4 sentences) in plain, professional language explaining why this image was flagged as {verdict.lower()}, referencing the specific facial regions where the model focused. Write as if for a human investigator reviewing a case, not a technical audience. Do not use hedging language like "may" or "could possibly" — state findings directly but accurately. Do not mention "Grad-CAM" or "saliency" by name — describe it as "the model's attention" or "regions of focus"."""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.content[0].text