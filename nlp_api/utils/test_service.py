"""
Test script untuk NLP service
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_classify():
    """Test basic classification"""
    print("\n" + "="*60)
    print("TEST: Basic Classification")
    print("="*60)
    
    test_cases = [
        "Pembayaran gaji saya belum masuk",
        "Internet kantor sangat lemot",
        "Cuti sakit minggu depan",
        "AC ruang meeting rusak",
        "Printer tidak bisa cetak",
        "Kartu akses hilang"
    ]
    
    for text in test_cases:
        response = requests.post(
            f"{BASE_URL}/classify",
            json={"text": text}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✓ Text: {text}")
            print(f"  Category: {result['category']}")
            print(f"  Confidence: {result['confidence']}")
            print(f"  Keywords: {', '.join(result['matched_keywords'][:3])}")
        else:
            print(f"\n✗ Text: {text}")
            print(f"  Error: {response.text}")


def test_health():
    """Test health endpoint"""
    print("\n" + "="*60)
    print("TEST: Health Check")
    print("="*60)
    
    response = requests.get(f"{BASE_URL}/health")
    if response.status_code == 200:
        result = response.json()
        print(f"✓ Status: {result['status']}")
        print(f"✓ Model Loaded: {result['model_loaded']}")
        print(f"✓ Uptime: {result['uptime_seconds']}s")
    else:
        print(f"✗ Health check failed: {response.text}")


def test_categories():
    """Test categories endpoint"""
    print("\n" + "="*60)
    print("TEST: Categories")
    print("="*60)
    
    response = requests.get(f"{BASE_URL}/categories")
    if response.status_code == 200:
        result = response.json()
        print(f"✓ Total Categories: {result['total_categories']}")
        print(f"✓ Categories: {', '.join(result['categories'])}")
    else:
        print(f"✗ Categories failed: {response.text}")


if __name__ == '__main__':
    print("\n🧪 Starting NLP Service Tests...")
    
    try:
        test_health()
        test_categories()
        test_classify()
        print("\n✅ All tests completed!\n")
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to NLP service at", BASE_URL)
        print("   Make sure the service is running: python app.py\n")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}\n")