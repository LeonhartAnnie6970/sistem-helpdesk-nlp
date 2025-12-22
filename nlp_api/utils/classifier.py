from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import joblib
import os

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


def classify_text(text, model, vectorizer):
    """Classify text using trained model"""
    if not model or not vectorizer:
        return None
    
    X = vectorizer.transform([text])
    prediction = model.predict(X)[0]
    confidence = model.predict_proba(X).max()
    
    return {
        'category': prediction,
        'confidence': float(confidence)
    }
