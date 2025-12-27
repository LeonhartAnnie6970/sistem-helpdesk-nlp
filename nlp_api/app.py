# from flask import Flask, request, jsonify
# from langdetect import detect, LangDetectException
# from utils.preprocess import clean_text
# from utils.classifier import load_model, classify_text
# from utils.translator import translate_text
# import os

# app = Flask(__name__)

# # Load model on startup
# model, vectorizer = load_model()

# if not model or not vectorizer:
#     print("Warning: Model not found. Please run train_model.py first")


# @app.route('/health', methods=['GET'])
# def health():
#     """Health check endpoint"""
#     return jsonify({'status': 'ok', 'model_loaded': model is not None})


# @app.route('/classify', methods=['POST'])
# def classify():
#     """Classify ticket text and detect language"""
#     try:
#         data = request.json
#         text = data.get('text', '').strip()
        
#         if not text:
#             return jsonify({'error': 'Text is required'}), 400
        
#         if not model or not vectorizer:
#             return jsonify({'error': 'Model not loaded'}), 500
        
#         # Detect language
#         try:
#             detected_lang = detect(text)
#         except LangDetectException:
#             detected_lang = 'en'
        
#         # Translate if Indonesian
#         translated_text = text
#         if detected_lang == 'id':
#             translated_text = translate_text(text, source_lang='id', target_lang='en')
        
#         # Clean text
#         cleaned_text = clean_text(translated_text)
        
#         # Classify
#         result = classify_text(cleaned_text, model, vectorizer)
        
#         if result:
#             return jsonify({
#                 'original_text': text,
#                 'translated_text': translated_text,
#                 'detected_language': detected_lang,
#                 'category': result['category'],
#                 'confidence': result['confidence']
#             })
#         else:
#             return jsonify({'error': 'Classification failed'}), 500
            
#     except Exception as e:
#         print(f"Error: {e}")
#         return jsonify({'error': str(e)}), 500


# @app.route('/classify-batch', methods=['POST'])
# def classify_batch():
#     """Classify multiple texts at once"""
#     try:
#         data = request.json
#         texts = data.get('texts', [])
        
#         if not texts or not isinstance(texts, list):
#             return jsonify({'error': 'texts array is required'}), 400
        
#         if not model or not vectorizer:
#             return jsonify({'error': 'Model not loaded'}), 500
        
#         results = []
#         for text in texts:
#             try:
#                 detected_lang = detect(text)
#             except LangDetectException:
#                 detected_lang = 'en'
            
#             translated_text = text
#             if detected_lang == 'id':
#                 translated_text = translate_text(text, source_lang='id', target_lang='en')
            
#             cleaned_text = clean_text(translated_text)
#             result = classify_text(cleaned_text, model, vectorizer)
            
#             if result:
#                 results.append({
#                     'original_text': text,
#                     'category': result['category'],
#                     'confidence': result['confidence']
#                 })
        
#         return jsonify({'results': results})
        
#     except Exception as e:
#         print(f"Error: {e}")
#         return jsonify({'error': str(e)}), 500


# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=8000, debug=False)

"""
Flask NLP API Service
Keyword-based Classification
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.classifier import KeywordClassifier
import logging
from datetime import datetime

app = Flask(__name__)
CORS(app)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

try:
    classifier = KeywordClassifier()
    logger.info("Classifier initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize classifier: {str(e)}")
    raise

request_count = 0
start_time = datetime.now()


@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'service': 'NLP Ticket Classifier',
        'version': '2.0',
        'status': 'running',
        'method': 'keyword-based',
        'categories': classifier.categories.keys()
    })


@app.route('/health', methods=['GET'])
def health_check():
    uptime = (datetime.now() - start_time).total_seconds()
    return jsonify({
        'status': 'ok',
        'model_loaded': True,
        'uptime_seconds': round(uptime, 2),
        'requests_processed': request_count
    })


@app.route('/classify', methods=['POST'])
def classify():
    """Main classification endpoint"""
    global request_count
    request_count += 1
    
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        logger.info(f"Classifying: '{text[:100]}...'")
        
        result = classifier.classify(text)
        
        logger.info(f"Result: {result['category']} (confidence: {result['confidence']})")
        
        return jsonify({
            'category': result['category'],
            'confidence': result['confidence'],
            'matched_keywords': result['matched_keywords'][:10]
        }), 200
    
    except Exception as e:
        logger.error(f"Classification error: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Classification failed',
            'detail': str(e)
        }), 500


@app.route('/classify-enhanced', methods=['POST'])
def classify_enhanced():
    """Enhanced classification with details"""
    global request_count
    request_count += 1
    
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        result = classifier.classify(text)
        suggestions = classifier.get_suggestions(text, limit=3)
        
        return jsonify({
            'category': result['category'],
            'confidence': result['confidence'],
            'matched_keywords': result['matched_keywords'],
            'suggestions': suggestions,
            'all_scores': result['all_scores'],
            'method': result['method']
        }), 200
    
    except Exception as e:
        logger.error(f"Enhanced classification error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/classify-batch', methods=['POST'])
def classify_batch():
    """Batch classification - backward compatible"""
    try:
        data = request.get_json()
        texts = data.get('texts', [])
        
        if not texts or not isinstance(texts, list):
            return jsonify({'error': 'texts array is required'}), 400
        
        if len(texts) > 50:
            return jsonify({'error': 'Maximum 50 texts allowed'}), 400
        
        results = []
        for text in texts:
            if text and text.strip():
                result = classifier.classify(text)
                results.append({
                    'original_text': text,
                    'category': result['category'],
                    'confidence': result['confidence']
                })
        
        return jsonify({'results': results})
    
    except Exception as e:
        logger.error(f"Batch classification error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/categories', methods=['GET'])
def get_categories():
    """Get all categories"""
    try:
        categories = list(classifier.categories.keys())
        details = {}
        
        for category, config in classifier.categories.items():
            keywords = config['keywords']
            details[category] = {
                'keyword_count': len(keywords),
                'sample_keywords': keywords[:5],
                'weight': config.get('weight', 1.0)
            }
        
        return jsonify({
            'categories': categories,
            'total_categories': len(categories),
            'details': details
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    logger.info("=" * 60)
    logger.info("Starting NLP Classifier Service (Keyword-Based)")
    logger.info("=" * 60)
    logger.info(f"Categories: {list(classifier.categories.keys())}")
    logger.info("Listening on http://0.0.0.0:8000")
    logger.info("=" * 60)
    
    app.run(host='0.0.0.0', port=8000, debug=False, threaded=True)