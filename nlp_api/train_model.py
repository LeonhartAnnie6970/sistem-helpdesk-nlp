"""
Script to train the NLP model with sample data
Run this once to create model.pkl and vectorizer.pkl
"""

import pandas as pd
from utils.classifier import train_model
from utils.preprocess import clean_text

# Sample training data
training_data = [
    # Network issues
    ("internet kantor lambat", "Network"),
    ("wifi tidak stabil", "Network"),
    ("koneksi internet putus", "Network"),
    ("jaringan down", "Network"),
    ("server tidak bisa diakses", "Network"),
    ("internet speed slow", "Network"),
    ("wifi connection problem", "Network"),
    ("network error", "Network"),
    
    # Account issues
    ("tidak bisa login", "Account"),
    ("password salah", "Account"),
    ("akun terkunci", "Account"),
    ("lupa password", "Account"),
    ("cannot login", "Account"),
    ("account locked", "Account"),
    ("forgot password", "Account"),
    
    # Hardware issues
    ("printer rusak", "Hardware"),
    ("monitor tidak menyala", "Hardware"),
    ("keyboard error", "Hardware"),
    ("mouse tidak berfungsi", "Hardware"),
    ("printer broken", "Hardware"),
    ("monitor not working", "Hardware"),
    ("hardware problem", "Hardware"),
    
    # Software issues
    ("aplikasi crash", "Software"),
    ("program error", "Software"),
    ("software bug", "Software"),
    ("aplikasi tidak bisa dibuka", "Software"),
    ("app error", "Software"),
    ("software not working", "Software"),
    
    # Access issues
    ("tidak punya akses folder", "Access"),
    ("permission denied", "Access"),
    ("akses ditolak", "Access"),
    ("folder terkunci", "Access"),
    ("cannot access file", "Access"),
]

# Prepare data
texts = [item[0] for item in training_data]
labels = [item[1] for item in training_data]

# Clean texts
cleaned_texts = [clean_text(text) for text in texts]

# Train model
print("Training NLP model...")
model, vectorizer = train_model(cleaned_texts, labels)
print("Model trained and saved successfully!")
print(f"Total training samples: {len(texts)}")
print(f"Categories: {set(labels)}")
