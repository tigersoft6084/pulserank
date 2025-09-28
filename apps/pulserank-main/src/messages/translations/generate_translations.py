#!/usr/bin/env python3
"""
Translation Generator Script for PulseRank
Generates translation files for all supported languages based on English JSON
"""

import json
import os
from typing import Dict, Any
import requests
import time

# Language mappings - language code to language name
LANGUAGES = {
    "fr": "French",
    "de": "German", 
    "es": "Spanish",
    "it": "Italian",
    "pt": "Portuguese",
    "nl": "Dutch",
    "sv": "Swedish",
    "da": "Danish",
    "fi": "Finnish",
    "no": "Norwegian",
    "pl": "Polish",
    "cs": "Czech",
    "sk": "Slovak",
    "lt": "Lithuanian",
    "ru": "Russian",
    "tr": "Turkish",
    "ja": "Japanese",
    "ko": "Korean",
    "zh": "Chinese",
    "el": "Greek",
    "ka": "Georgian",
    "iw": "Hebrew",
    "ms": "Malay",
    "id": "Indonesian",
    "ro": "Romanian"
}

def load_english_json() -> Dict[str, Any]:
    """Load the English JSON file"""
    try:
        with open('en.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Error: en.json file not found!")
        return {}
    except json.JSONDecodeError as e:
        print(f"Error parsing en.json: {e}")
        return {}

def translate_text(text: str, target_lang: str) -> str:
    """
    Simple translation logic using Google Translate API (free tier)
    You can replace this with any translation service
    """
    if not text or not isinstance(text, str):
        return text
    
    # Skip translation for very short strings or if it looks like a key
    if len(text) < 3 or text.isupper() or '_' in text:
        return text
    
    try:
        # Using Google Translate API (free tier)
        # You need to install: pip install googletrans==4.0.0rc1
        from googletrans import Translator
        
        translator = Translator()
        result = translator.translate(text, dest=target_lang)
        return result.text
    except ImportError:
        print("Warning: googletrans not installed. Install with: pip install googletrans==4.0.0rc1")
        return text
    except Exception as e:
        print(f"Translation error for '{text}': {e}")
        return text

def translate_with_libretranslate(text: str, target_lang: str) -> str:
    """
    Alternative translation using LibreTranslate (free, no API key needed)
    """
    if not text or not isinstance(text, str):
        return text
    
    # Skip translation for very short strings or if it looks like a key
    if len(text) < 3 or text.isupper() or '_' in text:
        return text
    
    try:
        # Using LibreTranslate API
        url = "https://libretranslate.de/translate"
        data = {
            "q": text,
            "source": "en",
            "target": target_lang,
            "format": "text"
        }
        
        response = requests.post(url, data=data, timeout=10)
        if response.status_code == 200:
            result = response.json()
            return result.get("translatedText", text)
        else:
            print(f"LibreTranslate API error: {response.status_code}")
            return text
    except Exception as e:
        print(f"Translation error for '{text}': {e}")
        return text

def translate_recursive(obj: Any, target_lang: str, use_libretranslate: bool = True) -> Any:
    """
    Recursively translate all string values in a nested dictionary/list structure
    """
    if isinstance(obj, dict):
        return {key: translate_recursive(value, target_lang, use_libretranslate) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [translate_recursive(item, target_lang, use_libretranslate) for item in obj]
    elif isinstance(obj, str):
        if use_libretranslate:
            return translate_with_libretranslate(obj, target_lang)
        else:
            return translate_text(obj, target_lang)
    else:
        return obj

def generate_translation_file(lang_code: str, lang_name: str, english_data: Dict[str, Any], use_libretranslate: bool = True) -> bool:
    """
    Generate a translation file for a specific language
    """
    print(f"Generating {lang_code}.json ({lang_name})...")
    
    try:
        # Translate the data
        translated_data = translate_recursive(english_data, lang_code, use_libretranslate)
        
        # Write to file
        filename = f"{lang_code}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(translated_data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Generated {filename}")
        return True
        
    except Exception as e:
        print(f"❌ Error generating {lang_code}.json: {e}")
        return False

def main():
    """Main function to generate all translation files"""
    print("🚀 PulseRank Translation Generator")
    print("=" * 50)
    
    # Load English JSON
    english_data = load_english_json()
    if not english_data:
        print("❌ Failed to load English JSON file")
        return
    
    print(f"📄 Loaded English JSON with {len(english_data)} top-level keys")
    
    # Ask user which translation service to use
    print("\nChoose translation service:")
    print("1. LibreTranslate (free, no API key needed)")
    print("2. Google Translate (requires googletrans library)")
    
    choice = input("Enter choice (1 or 2): ").strip()
    use_libretranslate = choice == "1"
    
    if not use_libretranslate:
        try:
            import googletrans
            print("✅ Google Translate library found")
        except ImportError:
            print("❌ googletrans library not found. Install with: pip install googletrans==4.0.0rc1")
            return
    
    print(f"\n🔄 Using {'LibreTranslate' if use_libretranslate else 'Google Translate'}")
    print("⏳ This may take a while due to API rate limits...")
    
    # Generate all translation files
    success_count = 0
    total_count = len(LANGUAGES)
    
    for lang_code, lang_name in LANGUAGES.items():
        # Skip if file already exists (unless user wants to overwrite)
        if os.path.exists(f"{lang_code}.json"):
            overwrite = input(f"{lang_code}.json already exists. Overwrite? (y/n): ").strip().lower()
            if overwrite != 'y':
                print(f"⏭️  Skipped {lang_code}.json")
                continue
        
        success = generate_translation_file(lang_code, lang_name, english_data, use_libretranslate)
        if success:
            success_count += 1
        
        # Add delay to respect API rate limits
        if use_libretranslate:
            time.sleep(1)  # LibreTranslate rate limit
        else:
            time.sleep(0.5)  # Google Translate rate limit
    
    print("\n" + "=" * 50)
    print(f"🎉 Translation generation complete!")
    print(f"✅ Successfully generated: {success_count}/{total_count} files")
    
    if success_count < total_count:
        print("❌ Some files failed to generate. Check the errors above.")

if __name__ == "__main__":
    main()
