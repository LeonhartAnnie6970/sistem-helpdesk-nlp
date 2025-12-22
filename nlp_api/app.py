from flask import Flask, request, jsonify
from langdetect import detect, LangDetectException
from utils.preprocess import clean_text
from utils.classifier import load_model, classify_text
from utils.translator import translate_text
import os

app = Flask(__name__)

# Load model on startup
model, vectorizer = load_model()

if not model or not vectorizer:
    print("Warning: Model not found. Please run train_model.py first")


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'model_loaded': model is not None})


@app.route('/classify', methods=['POST'])
def classify():
    """Classify ticket text and detect language"""
    try:
        data = request.json
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        if not model or not vectorizer:
            return jsonify({'error': 'Model not loaded'}), 500
        
        # Detect language
        try:
            detected_lang = detect(text)
        except LangDetectException:
            detected_lang = 'en'
        
        # Translate if Indonesian
        translated_text = text
        if detected_lang == 'id':
            translated_text = translate_text(text, source_lang='id', target_lang='en')
        
        # Clean text
        cleaned_text = clean_text(translated_text)
        
        # Classify
        result = classify_text(cleaned_text, model, vectorizer)
        
        if result:
            return jsonify({
                'original_text': text,
                'translated_text': translated_text,
                'detected_language': detected_lang,
                'category': result['category'],
                'confidence': result['confidence']
            })
        else:
            return jsonify({'error': 'Classification failed'}), 500
            
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/classify-batch', methods=['POST'])
def classify_batch():
    """Classify multiple texts at once"""
    try:
        data = request.json
        texts = data.get('texts', [])
        
        if not texts or not isinstance(texts, list):
            return jsonify({'error': 'texts array is required'}), 400
        
        if not model or not vectorizer:
            return jsonify({'error': 'Model not loaded'}), 500
        
        results = []
        for text in texts:
            try:
                detected_lang = detect(text)
            except LangDetectException:
                detected_lang = 'en'
            
            translated_text = text
            if detected_lang == 'id':
                translated_text = translate_text(text, source_lang='id', target_lang='en')
            
            cleaned_text = clean_text(translated_text)
            result = classify_text(cleaned_text, model, vectorizer)
            
            if result:
                results.append({
                    'original_text': text,
                    'category': result['category'],
                    'confidence': result['confidence']
                })
        
        return jsonify({'results': results})
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)
