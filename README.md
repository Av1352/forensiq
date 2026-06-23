# ForensIQ — Deepfake Forensic Analysis Report

Explainable deepfake detection. Upload an image, get a verdict, a confidence score, a Grad-CAM attention map, and a plain-English forensic summary — packaged as a report an investigator can act on, not a raw model output.

## How It Works

1. EfficientNet-B0 binary classifier (real vs. fake), 95% validation accuracy
2. Grad-CAM generates a heatmap of which facial regions drove the classification
3. The heatmap is divided into 9 facial regions, each scored by attention strength
4. Claude reads the top 3 attended regions and writes a forensic summary in plain language
5. Output renders as a structured report: case ID, verdict, confidence, attention map, summary, region breakdown

## Stack

- PyTorch + timm (EfficientNet-B0)
- Grad-CAM for visual explainability
- Claude claude-sonnet-4-20250514 for natural language forensic summary
- Streamlit for the report UI

## Run Locally

```bash
pip install -r requirements.txt
cp .env.example .env  # add ANTHROPIC_API_KEY
streamlit run app.py
```

Place your trained model at `models/efficientnet_b0_real_vs_fake.pth`.

## Design Note

This focuses specifically on explainability — confidence scores, visual attention indicators, and plain-language reasoning that an investigator can act on. It does not attempt streaming/telephony detection or published EER benchmarking, both of which require infrastructure and validation beyond a single-model demo.

---

Built by Anju Vilashni Nandhakumar — vxanju.com