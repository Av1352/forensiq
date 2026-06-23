import torch
import numpy as np
import cv2
import timm
from torchvision import transforms
from PIL import Image

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

_model = None

def get_model():
    global _model
    if _model is None:
        model = timm.create_model("efficientnet_b0", pretrained=False, num_classes=2)
        model.load_state_dict(torch.load("models/efficientnet_b0_real_vs_fake.pth", map_location=device, weights_only=True))
        model = model.to(device)
        model.eval()
        _model = model
    return _model


class GradCAM:
    def __init__(self, model):
        self.model = model
        self.gradients = None
        self.activations = None
        target_layer = self.model.blocks[-1]
        target_layer.register_forward_hook(self.save_activation)
        target_layer.register_backward_hook(self.save_gradient)

    def save_activation(self, module, input, output):
        self.activations = output.detach()

    def save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0].detach()

    def generate_cam(self, input_image, target_class=None):
        output = self.model(input_image)
        probs = torch.nn.functional.softmax(output, dim=1)[0]

        if target_class is None:
            target_class = output.argmax(dim=1).item()

        self.model.zero_grad()
        class_loss = output[0, target_class]
        class_loss.backward()

        gradients = self.gradients[0].cpu().numpy()
        activations = self.activations[0].cpu().numpy()

        weights = np.mean(gradients, axis=(1, 2))
        cam = np.zeros(activations.shape[1:], dtype=np.float32)
        for i, w in enumerate(weights):
            cam += w * activations[i]

        cam = np.maximum(cam, 0)
        cam = cv2.resize(cam, (224, 224))
        cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)

        return cam, target_class, float(probs[target_class].item())


def analyze_image(pil_image: Image.Image):
    """
    Runs inference + Grad-CAM on a PIL image.
    Returns: verdict, confidence, overlay_image (PIL), region_activations (list of dicts)
    """
    model = get_model()
    img = pil_image.convert('RGB')
    img_tensor = transform(img).unsqueeze(0).to(device)

    gradcam = GradCAM(model)
    cam, pred_class, confidence = gradcam.generate_cam(img_tensor)

    img_resized = cv2.resize(np.array(img), (224, 224))
    heatmap = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET)
    heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
    overlay = heatmap * 0.4 + img_resized * 0.6
    overlay = np.uint8(overlay)

    overlay_image = Image.fromarray(overlay)
    verdict = "FAKE" if pred_class == 1 else "REAL"

    region_activations = extract_region_activations(cam)

    return {
        "verdict": verdict,
        "confidence": round(confidence * 100, 1),
        "overlay_image": overlay_image,
        "original_resized": Image.fromarray(img_resized),
        "region_activations": region_activations
    }


REGION_LABELS = {
    (0, 0): "left temple / hairline",
    (0, 1): "forehead",
    (0, 2): "right temple / hairline",
    (1, 0): "left eye / cheek",
    (1, 1): "nose bridge / eyes",
    (1, 2): "right eye / cheek",
    (2, 0): "left jaw / cheek",
    (2, 1): "mouth / chin",
    (2, 2): "right jaw / cheek",
}

def extract_region_activations(cam, grid=3):
    h, w = cam.shape
    step_h, step_w = h // grid, w // grid
    scores = []
    for i in range(grid):
        for j in range(grid):
            cell = cam[i*step_h:(i+1)*step_h, j*step_w:(j+1)*step_w]
            scores.append({
                "region": REGION_LABELS[(i, j)],
                "activation": float(np.mean(cell))
            })
    return sorted(scores, key=lambda x: x["activation"], reverse=True)