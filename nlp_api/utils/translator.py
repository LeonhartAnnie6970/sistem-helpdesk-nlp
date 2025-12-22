from google.cloud import translate_v2
import os

# Initialize Google Translate client
# Note: Set GOOGLE_APPLICATION_CREDENTIALS environment variable
try:
    translate_client = translate_v2.Client()
except Exception as e:
    print(f"Warning: Google Translate not configured: {e}")
    translate_client = None


def translate_text(text, source_lang='id', target_lang='en'):
    """Translate text using Google Translate API"""
    if not translate_client:
        # Fallback: return original text if client not configured
        return text
    
    try:
        result = translate_client.translate_text(
            text,
            source_language=source_lang,
            target_language=target_lang
        )
        return result['translatedText']
    except Exception as e:
        print(f"Translation error: {e}")
        return text
