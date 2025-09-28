#!/usr/bin/env python3
"""
Simple Translation Generator Script for PulseRank
Generates translation files using basic translation logic (no external dependencies)
"""

import json
import os
from typing import Dict, Any

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

# Basic translation mappings for common terms
BASIC_TRANSLATIONS = {
    "fr": {
        "Dashboard": "Tableau de bord",
        "Home": "Accueil",
        "Backlinks": "Backlinks",
        "Campaigns": "Campagnes",
        "Rankings": "Classements",
        "Labs": "Laboratoires",
        "API": "API",
        "Search": "Recherche",
        "Usage": "Utilisation",
        "Language": "Langue",
        "Keywords": "Mots-clés",
        "Sites": "Sites",
        "Domains": "Domaines",
        "Pages": "Pages",
        "Traffic": "Trafic",
        "Competition": "Concurrence",
        "Analysis": "Analyse",
        "Reports": "Rapports",
        "Settings": "Paramètres",
        "Profile": "Profil",
        "Logout": "Déconnexion",
        "Login": "Connexion",
        "Register": "S'inscrire",
        "Save": "Enregistrer",
        "Cancel": "Annuler",
        "Delete": "Supprimer",
        "Edit": "Modifier",
        "Create": "Créer",
        "Update": "Mettre à jour",
        "Submit": "Soumettre",
        "Loading": "Chargement",
        "Error": "Erreur",
        "Success": "Succès",
        "Warning": "Avertissement",
        "Info": "Information"
    },
    "de": {
        "Dashboard": "Dashboard",
        "Home": "Startseite",
        "Backlinks": "Backlinks",
        "Campaigns": "Kampagnen",
        "Rankings": "Rankings",
        "Labs": "Labs",
        "API": "API",
        "Search": "Suchen",
        "Usage": "Nutzung",
        "Language": "Sprache",
        "Keywords": "Schlüsselwörter",
        "Sites": "Websites",
        "Domains": "Domains",
        "Pages": "Seiten",
        "Traffic": "Verkehr",
        "Competition": "Wettbewerb",
        "Analysis": "Analyse",
        "Reports": "Berichte",
        "Settings": "Einstellungen",
        "Profile": "Profil",
        "Logout": "Abmelden",
        "Login": "Anmelden",
        "Register": "Registrieren",
        "Save": "Speichern",
        "Cancel": "Abbrechen",
        "Delete": "Löschen",
        "Edit": "Bearbeiten",
        "Create": "Erstellen",
        "Update": "Aktualisieren",
        "Submit": "Absenden",
        "Loading": "Laden",
        "Error": "Fehler",
        "Success": "Erfolg",
        "Warning": "Warnung",
        "Info": "Information"
    },
    "es": {
        "Dashboard": "Panel de control",
        "Home": "Inicio",
        "Backlinks": "Enlaces entrantes",
        "Campaigns": "Campañas",
        "Rankings": "Rankings",
        "Labs": "Laboratorios",
        "API": "API",
        "Search": "Buscar",
        "Usage": "Uso",
        "Language": "Idioma",
        "Keywords": "Palabras clave",
        "Sites": "Sitios",
        "Domains": "Dominios",
        "Pages": "Páginas",
        "Traffic": "Tráfico",
        "Competition": "Competencia",
        "Analysis": "Análisis",
        "Reports": "Informes",
        "Settings": "Configuración",
        "Profile": "Perfil",
        "Logout": "Cerrar sesión",
        "Login": "Iniciar sesión",
        "Register": "Registrarse",
        "Save": "Guardar",
        "Cancel": "Cancelar",
        "Delete": "Eliminar",
        "Edit": "Editar",
        "Create": "Crear",
        "Update": "Actualizar",
        "Submit": "Enviar",
        "Loading": "Cargando",
        "Error": "Error",
        "Success": "Éxito",
        "Warning": "Advertencia",
        "Info": "Información"
    }
    # Add more languages as needed...
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

def simple_translate(text: str, target_lang: str) -> str:
    """
    Simple translation using basic mappings
    """
    if not text or not isinstance(text, str):
        return text
    
    # Check if we have translations for this language
    if target_lang in BASIC_TRANSLATIONS:
        translations = BASIC_TRANSLATIONS[target_lang]
        if text in translations:
            return translations[text]
    
    # For now, return the original text
    # You can expand this with more sophisticated logic
    return text

def translate_recursive(obj: Any, target_lang: str) -> Any:
    """
    Recursively translate all string values in a nested dictionary/list structure
    """
    if isinstance(obj, dict):
        return {key: translate_recursive(value, target_lang) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [translate_recursive(item, target_lang) for item in obj]
    elif isinstance(obj, str):
        return simple_translate(obj, target_lang)
    else:
        return obj

def generate_translation_file(lang_code: str, lang_name: str, english_data: Dict[str, Any]) -> bool:
    """
    Generate a translation file for a specific language
    """
    print(f"Generating {lang_code}.json ({lang_name})...")
    
    try:
        # Translate the data
        translated_data = translate_recursive(english_data, lang_code)
        
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
    print("🚀 PulseRank Simple Translation Generator")
    print("=" * 50)
    
    # Load English JSON
    english_data = load_english_json()
    if not english_data:
        print("❌ Failed to load English JSON file")
        return
    
    print(f"📄 Loaded English JSON with {len(english_data)} top-level keys")
    print("⚠️  Note: This uses basic translation mappings. For better results, use the full version with API translation.")
    
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
        
        success = generate_translation_file(lang_code, lang_name, english_data)
        if success:
            success_count += 1
    
    print("\n" + "=" * 50)
    print(f"🎉 Translation generation complete!")
    print(f"✅ Successfully generated: {success_count}/{total_count} files")
    
    if success_count < total_count:
        print("❌ Some files failed to generate. Check the errors above.")

if __name__ == "__main__":
    main()
