import json
from googletrans import Translator
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

translator = Translator()

# Map unsupported / legacy codes to valid ones
LANG_CODE_MAP = {
    "iw": "he",      # Hebrew (old code iw)
    "zh": "zh-cn",   # Default to Simplified Chinese
}

def translate_obj(obj, lang, path="root"):
    """Recursively translate strings inside dicts/lists and log the key path."""
    dest_lang = LANG_CODE_MAP.get(lang, lang)

    if isinstance(obj, dict):
        return {k: translate_obj(v, lang, f"{path}.{k}") for k, v in obj.items()}
    elif isinstance(obj, list):
        return [translate_obj(v, lang, f"{path}[{i}]") for i, v in enumerate(obj)]
    elif isinstance(obj, str):
        try:
            print(f"Translating {path} → {lang} ({dest_lang})")
            return translator.translate(obj, src="en", dest=dest_lang).text
        except Exception as e:
            print(f"❌ Failed {path}: {e}")
            return obj
    else:
        return obj

def translate_to_lang(data, input_file, lang, out_dir):
    """Translate the JSON into a specific language and save to subfolder."""
    print(f"\n=== Starting translation to {lang} ===")
    translated = translate_obj(data, lang)

    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    out_file = out_dir / f"{lang}.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(translated, f, ensure_ascii=False, indent=2)

    print(f"✅ Saved {out_file}")
    return lang

def translate_json(input_file, target_langs, out_dir="translations"):
    """Main entry point: translate to multiple languages in parallel."""
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    with ThreadPoolExecutor() as executor:
        futures = [
            executor.submit(translate_to_lang, data, input_file, lang, out_dir)
            for lang in target_langs
        ]
        for future in as_completed(futures):
            print(f"Finished: {future.result()}")

if __name__ == "__main__":
    input_file = "en.json"  # path to your base English JSON

    # Your full language list
    target_langs = [
        "cs", "da", "de", "es", "fi", "fr", "id", "it", "iw", "ja", "ka", "ko",
        "lt", "ms", "nl", "no", "pl", "pt", "ro", "ru", "sk", "sv", "tr", "zh"
    ]

    translate_json(input_file, target_langs, out_dir="translations")
