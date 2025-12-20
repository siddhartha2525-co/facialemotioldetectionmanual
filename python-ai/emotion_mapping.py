# emotion_mapping.py
# Unified emotion label mapping for multiple datasets

"""
Emotion Label Mapping
Maps different dataset labels to unified 7-class emotion labels:
- happy
- sad
- angry
- fear
- surprise
- disgust
- neutral
"""

# Comprehensive mapping from various dataset formats to unified labels
EMOTION_MAPPING = {
    # Happy variations
    'hap': 'happy',
    'happiness': 'happy',
    'happy': 'happy',
    'joy': 'happy',
    'joyful': 'happy',
    
    # Sad variations
    'sad': 'sad',
    'sadness': 'sad',
    'sadnesss': 'sad',  # Typo in some datasets
    
    # Angry variations
    'angry': 'angry',
    'anger': 'angry',
    'angriness': 'angry',
    
    # Fear variations
    'fear': 'fear',
    'fearful': 'fear',
    'afraid': 'fear',
    
    # Surprise variations
    'surprise': 'surprise',
    'surprised': 'surprise',
    'surprising': 'surprise',
    
    # Disgust variations
    'disgust': 'disgust',
    'dis': 'disgust',  # Abbreviation
    'disgusted': 'disgust',
    'contempt': 'disgust',  # Contempt mapped to disgust
    
    # Neutral variations
    'neutral': 'neutral',
    'ne': 'neutral',  # Abbreviation
    'none': 'neutral',
    'no_emotion': 'neutral',
    
    # Additional mappings
    'hate': 'angry',
    'furious': 'angry',
    'depressed': 'sad',
    'scared': 'fear',
    'terrified': 'fear',
    'shocked': 'surprise',
    'amazed': 'surprise',
    'revolted': 'disgust',
    'nauseated': 'disgust',
}

# Reverse mapping for display
EMOTION_DISPLAY_NAMES = {
    'happy': 'Happy',
    'sad': 'Sad',
    'angry': 'Angry',
    'fear': 'Fear',
    'surprise': 'Surprise',
    'disgust': 'Disgust',
    'neutral': 'Neutral'
}

# 7-class emotion list
EMOTION_CLASSES = ['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral']

# Emotion to index mapping
EMOTION_TO_INDEX = {emotion: idx for idx, emotion in enumerate(EMOTION_CLASSES)}
INDEX_TO_EMOTION = {idx: emotion for emotion, idx in EMOTION_TO_INDEX.items()}

def normalize_emotion(label):
    """
    Normalize emotion label to unified format.
    
    Args:
        label: Emotion label from dataset (string)
    
    Returns:
        Normalized emotion label (string)
    """
    if not label:
        return 'neutral'
    
    # Convert to lowercase and strip whitespace
    label = str(label).lower().strip()
    
    # Direct mapping
    if label in EMOTION_MAPPING:
        return EMOTION_MAPPING[label]
    
    # Try partial match
    for key, value in EMOTION_MAPPING.items():
        if key in label or label in key:
            return value
    
    # Default to neutral if not found
    return 'neutral'

def get_emotion_index(emotion):
    """
    Get index for emotion class.
    
    Args:
        emotion: Normalized emotion label
    
    Returns:
        Class index (int)
    """
    return EMOTION_TO_INDEX.get(emotion, EMOTION_TO_INDEX['neutral'])

def get_emotion_from_index(index):
    """
    Get emotion label from index.
    
    Args:
        index: Class index
    
    Returns:
        Emotion label (string)
    """
    return INDEX_TO_EMOTION.get(index, 'neutral')

def get_display_name(emotion):
    """
    Get display name for emotion.
    
    Args:
        emotion: Normalized emotion label
    
    Returns:
        Display name (string)
    """
    return EMOTION_DISPLAY_NAMES.get(emotion, 'Neutral')

# Dataset-specific mappings
DATASET_MAPPINGS = {
    'raf-db': {
        'Surprise': 'surprise',
        'Fear': 'fear',
        'Disgust': 'disgust',
        'Happiness': 'happy',
        'Sadness': 'sad',
        'Anger': 'angry',
        'Neutral': 'neutral'
    },
    'affectnet': {
        '0': 'neutral',
        '1': 'happy',
        '2': 'sad',
        '3': 'surprise',
        '4': 'fear',
        '5': 'disgust',
        '6': 'angry'
    },
    'fer2013': {
        '0': 'angry',
        '1': 'disgust',
        '2': 'fear',
        '3': 'happy',
        '4': 'sad',
        '5': 'surprise',
        '6': 'neutral'
    },
    'ck+': {
        '0': 'neutral',
        '1': 'angry',
        '2': 'contempt',  # Will map to disgust
        '3': 'disgust',
        '4': 'fear',
        '5': 'happy',
        '6': 'sadness',  # Will map to sad
        '7': 'surprise'
    }
}

def map_dataset_label(dataset_name, label):
    """
    Map dataset-specific label to unified format.
    
    Args:
        dataset_name: Name of dataset ('raf-db', 'affectnet', 'fer2013', 'ck+')
        label: Original label from dataset
    
    Returns:
        Normalized emotion label
    """
    if dataset_name in DATASET_MAPPINGS:
        mapped = DATASET_MAPPINGS[dataset_name].get(str(label), label)
        return normalize_emotion(mapped)
    return normalize_emotion(label)

if __name__ == '__main__':
    # Test the mapping
    test_labels = [
        'HAP', 'HAPPINESS', 'happy',
        'SAD', 'sadness', 'sad',
        'ANGRY', 'anger', 'angry',
        'DIS', 'disgust', 'contempt',
        'fear', 'FEAR', 'fearful',
        'surprise', 'SURPRISE',
        'neutral', 'NE', 'none'
    ]
    
    print("Emotion Label Mapping Test:")
    print("-" * 50)
    for label in test_labels:
        normalized = normalize_emotion(label)
        print(f"{label:15} -> {normalized:10} ({get_display_name(normalized)})")
    
    print("\n" + "-" * 50)
    print(f"Total emotion classes: {len(EMOTION_CLASSES)}")
    print(f"Emotion classes: {', '.join(EMOTION_CLASSES)}")

