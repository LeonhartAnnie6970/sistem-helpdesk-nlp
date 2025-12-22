from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import joblib
import os
import numpy as np

MODEL_PATH = 'model.pkl'
VECTORIZER_PATH = 'vectorizer.pkl'


def load_model():
    """Load pre-trained model and vectorizer"""
    if os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
        model = joblib.load(MODEL_PATH)
        vectorizer = joblib.load(VECTORIZER_PATH)
        return model, vectorizer
    return None, None


def train_model(texts, labels):
    """Train NLP model with TF-IDF + Naive Bayes"""
    vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1, 2))
    X = vectorizer.fit_transform(texts)
    
    model = MultinomialNB()
    model.fit(X, labels)
    
    # Save model and vectorizer
    joblib.dump(model, MODEL_PATH)
    joblib.dump(vectorizer, VECTORIZER_PATH)
    
    return model, vectorizer


def extract_keywords(text, vectorizer, model, top_n=5):
    """Extract top keywords from text based on TF-IDF scores"""
    try:
        X = vectorizer.transform([text])
        feature_names = vectorizer.get_feature_names_out()
        
        # Get TF-IDF scores
        tfidf_scores = X.toarray()[0]
        
        # Get top N keywords
        top_indices = tfidf_scores.argsort()[-top_n:][::-1]
        keywords = [feature_names[i] for i in top_indices if tfidf_scores[i] > 0]
        
        return keywords
    except Exception as e:
        print(f"Keyword extraction error: {e}")
        return []


def classify_text_with_confidence(text, model, vectorizer):
    """Classify text using trained model with confidence and keywords"""
    if not model or not vectorizer:
        return None
    
    X = vectorizer.transform([text])
    
    # Get prediction
    prediction = model.predict(X)[0]
    
    # Get all class probabilities
    probabilities = model.predict_proba(X)[0]
    confidence = float(probabilities.max())
    
    # Get all predictions with confidence scores
    all_predictions = []
    for i, class_name in enumerate(model.classes_):
        all_predictions.append({
            'division': class_name,
            'confidence': float(probabilities[i])
        })
    
    # Sort by confidence
    all_predictions = sorted(all_predictions, key=lambda x: x['confidence'], reverse=True)
    
    # Extract keywords
    keywords = extract_keywords(text, vectorizer, model, top_n=5)
    
    return {
        'division': prediction,
        'confidence': confidence,
        'all_predictions': all_predictions,
        'keywords': keywords,
        'confidence_level': get_confidence_level(confidence)
    }


def get_confidence_level(confidence):
    """Categorize confidence into levels"""
    if confidence >= 0.8:
        return 'high'
    elif confidence >= 0.5:
        return 'medium'
    else:
        return 'low'
