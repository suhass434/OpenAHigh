import os
import re
import fitz
import pandas as pd
from typing import Dict, List, Tuple, Any
import google.generativeai as genai
from dotenv import load_dotenv
from scn_accumulation import process_scn_changes

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

def get_intermediate_upgrades(old_upgrade: str, new_upgrade: str, features_dir: str) -> list[str]:
    """Get all upgrade versions between two versions"""
    try:
        base_upgrade = old_upgrade.split("_SCN")[0]
        old_version_number = int(re.search(r"\.(\d+)", old_upgrade).group(1))
        new_version_number = int(re.search(r"\.(\d+)", new_upgrade).group(1))

        intermediate_upgrades = []
        for i in range(old_version_number, new_version_number + 1):
            upgrade_name = f"{base_upgrade.split('.')[0]}.{i}_SCN"
            upgrade_path = os.path.join(features_dir, f"{upgrade_name}.pdf")
            if os.path.exists(upgrade_path):
                intermediate_upgrades.append(upgrade_name)
                
        return intermediate_upgrades
    except Exception as e:
        print(f"Error getting intermediate upgrades: {e}")
        return []

def get_intermediate_releases(old_release: str, new_release: str, fixed_known_issues_dir: str) -> list[str]:
    """Get all release versions between two TCU versions"""
    try:
        base_release = old_release.split("_TCU")[0]
        old_tcu_number = int(re.search(r"TCU(\d+)", old_release).group(1))
        new_tcu_number = int(re.search(r"TCU(\d+)", new_release).group(1))

        intermediate_releases = []
        for i in range(old_tcu_number, new_tcu_number + 1):
            release_name = f"{base_release}_TCU{i}_SCN"
            release_path = os.path.join(fixed_known_issues_dir, f"{release_name}.pdf")
            if os.path.exists(release_path):
                intermediate_releases.append(release_name)

        return intermediate_releases
    except Exception as e:
        print(f"Error getting intermediate releases: {e}")
        return []

def extract_new_features_fuzzy(pdf_path: str) -> str:
    """Extract the "New Features and Enhancements" section using fuzzy search"""
    doc = fitz.open(pdf_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text("text") + "\n"

    section_titles = [
        "New Features and Enhancements",
        "New Features & Enhancements",
    ]

    # Find section using regex
    for title in section_titles:
        pattern = rf"{re.escape(title)}\n(.*?)(?=\n(?:[A-Z0-9][A-Z0-9 .-]{{3,}}\n|\d+\.\d+(?:\.\d+)?))"
        match = re.search(pattern, full_text, re.DOTALL)
        if match:
            return match.group(1).strip()

    return ""

def generate_feature_summary(text: str) -> str:
    """Generate markdown summary using Gemini"""
    prompt = f"""
    Analyze this software change notice and extract all new features and enhancements that either start with "6.X" or as a starting number for the feature.
    - Format the output as a markdown list with clear headings.
    - Discard any new chapters like "Chapter 7 - Resolved PARs in Experion" or "Chapter 8 - Known Issues".
    - Output should have "features and enhancements" only.
    - Do not include any other information like '''markdown''' or '''python'''.
    - Send empty string if no new features are found.
    
    Text to analyze:
    {text}
    """
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(
        prompt,
        generation_config={
            "temperature": 0.3,
            "max_output_tokens": 2000
        }
    )
    return response.text

def extract_fixed_known_issues(pdf_path: str) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Extract fixed and known issues from a PDF"""
    tables = pd.read_html(pdf_path)
    fixed_issues = pd.DataFrame()
    known_issues = pd.DataFrame()

    for table in tables:
        if list(table.columns) == ['PAR', 'Impact', 'Subsystem', 'Description']:
            fixed_issues = pd.concat([fixed_issues, table], ignore_index=True)
        elif list(table.columns) == ['PAR', 'Impact', 'Function', 'Description']:
            known_issues = pd.concat([known_issues, table], ignore_index=True)

    return fixed_issues, known_issues

def process_scn_data(old_version: str, new_version: str, include_features: bool = True, include_issues: bool = True) -> Dict[str, Any]:
    """
    Process SCN data between two versions and return results
    """
    try:
        result = process_scn_changes(old_version, new_version, include_features, include_issues)
        return {
            "features": result.features,
            "fixed_issues": result.fixed_issues,
            "known_issues": result.known_issues,
            "output_files": result.output_files
        }
    except Exception as e:
        raise Exception(f"Error processing SCN data: {str(e)}") 