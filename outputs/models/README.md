# Model Weights Directory

## Required Files

Place your trained model weights here with the following naming convention:

### For ResNet-Revised (Current Active Model):
```
resnet_revised_fold4.pth
```

### For Other Models (Optional):
```
efficientnet_b0_fold4.pth
resnet50_fold4.pth
densenet121_fold4.pth
```

## File Format

Each `.pth` file should contain a PyTorch checkpoint with at minimum:
```python
{
    'model_state_dict': <model weights>,
    # Optional metadata:
    'epoch': <training epoch>,
    'accuracy': <best accuracy>,
    'loss': <best loss>
}
```

## How to Add Your Trained Model

1. After training, save your model:
```python
torch.save({
    'model_state_dict': model.state_dict(),
    'epoch': best_epoch,
    'accuracy': best_accuracy
}, 'outputs/models/resnet_revised_fold4.pth')
```

2. Place the `.pth` file in this directory

3. Restart the backend server

## Current Configuration

- **Active Model:** resnet_revised
- **Expected Path:** outputs/models/resnet_revised_fold4.pth
- **Architecture:** ResNet-50 based
- **Input Size:** 224x224
- **Output:** Binary classification (Fake/Real)

## Model Selection Logic

The application uses adaptive model selection:
- **Small images (<300x300):** EfficientNet-B0
- **High complexity:** ResNet-Revised ⭐
- **Low complexity:** EfficientNet-B0
- **Large images:** DenseNet-121
- **Default:** ResNet-Revised ⭐

## Notes

- Model weights are NOT included in git repository (too large)
- Download or train your own models
- Ensure model architecture matches the expected format
