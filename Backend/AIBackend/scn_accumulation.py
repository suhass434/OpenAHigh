import fitz  # PyMuPDF
import re
from fuzzywuzzy import fuzz
from dotenv import load_dotenv
import google.generativeai as genai
import os
import tabula
import pandas as pd
from fpdf import FPDF
from typing import Dict, List, Tuple, Optional

# FIXED PATHS AND DIRECTORIES
script_dir = os.path.dirname(os.path.abspath(__file__))
features_dir = os.path.join(script_dir, "data", "For_NewFeatures")
issues_dir = os.path.join(script_dir, "data", "For_IssuesFixed_KnownIssues")
output_dir = os.path.join(script_dir, "outputs")

# Create output directory if it doesn't exist
os.makedirs(output_dir, exist_ok=True)

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

class SCNResult:
    def __init__(self):
        self.features: Dict[str, str] = {}
        self.fixed_issues: pd.DataFrame = pd.DataFrame()
        self.known_issues: pd.DataFrame = pd.DataFrame()
        self.output_files: Dict[str, str] = {}

def generate_feature_summary(text: str) -> str:
    """Generate markdown summary using Gemini"""
    prompt = f"""
    Analyze this software change notice and extract all new features and enhancements that either start with "6.X" or as a starting number for the feature.
    - Format the output as a markdown list with clear headings.
    - Discard any new chapters like "Chapter 7 - Resolved PARs in Experion" or "Chapter 8 - Known Issues".
    - Output should have "features and enhancements" only.
    - Do not include any other information like '''markdown''' or '''python'''.
    - Send empty string if no new features are found.
    - Use the below provided example input and output format as a reference.
    

    Text to analyze:
    {text}

    Output must be a List and should include "Clear feature names" and "Clear descriptions".
    - Do not include any other information.
    
    Example Input:
    68
    6.1 Experion Batch
    68
    6.1.1 Multi-Version Recipe
    73
    6.2 Experion Local Control Network (ELCN) Unified Engineering
    Tools
    73
    6.3 C200 to Unit Operations Controller (UOC) Upgrade
    74
    6.4 UIO16 Module
    74
    6.5 Experion Reporting Enhancements
    74
    6.6 User Assistance
    75
    6.7 Experion Support and Maintenance Enhancements
    75
    6.8 UOC Integration of HART over Ethernet/IP network
    75
    - 4 -

    6.9 Control Builder Picker Enhance PLC Points
    76
    6.10 Qualify Replacement Smart Card Reader
    76
    6.11 Experion TPS faceplate enhancement
    76
    6.12 Switch Tree View with one Click
    76
    6.13 UIS-R2106 - Find/Replace in Sequential Control Module (SCM) 76
    6.14 UIS-R2304 - Copy/Paste feature for Sequential Control Module
    (SCM) steps
    77
    6.15 UIS-R2308 - Alarm summary Improvements
    77
    6.16 UIS-R2401 - Alarm Shelving
    77
    6.17 UIS-R2405 - Controller Normal Mode Report
    77
    6.18 UIS-R2406 - Add hourly average to group displays
    77
    6.19 UIS-R2203 - TPS Faceplate Consistency Group
    78
    6.20 UOC DLR Topology - Connecting 2 DLR rings
    78
    6.21 FOUNDATION FIELDBUS, FIM8 Model - CC-PFB802
    78
    6.22 Adding Short Circuit Alarm (SCA) Thermocouple (TC)
    /Resistance Temperature Detector (RTD) module configuration utility
    in Experion
    78
    6.23 Universal Low Level Input Adapter
    78
    6.24 Update ADC to support 96 Point Universal Process Cabinet
    (UPC)
    79
    Chapter 7 - Resolved PARs in Experion
    80
    7.1 Resolved PARs in Experion 511.3
    80
    7.1.1 Installation and Migration
    80
    7.1.2 Common components
    81
    7.1.3 Controllers and Tools
    81
    7.1.4 Servers and Stations
    86
    7.2 Resolved PARs in Experion R511.2
    90
    7.2.1 Installation and Migration
    91
    7.2.2 Common components
    91
    7.2.3 Controllers and Tools
    91
    7.2.4 Servers and Stations
    93
    7.2.5 Documentation
    
    
    EXAMPLE OUTPUT FOR EXAMPLE INPUT:
    - **6.1 Experion Batch Multi-Version Recipe:**  Allows for multiple versions of recipes within Experion Batch.

- **6.2 Experion Local Control Network (ELCN) Unified Engineering Tools:**  Provides unified engineering tools for the Experion Local Control Network.

- **6.3 C200 to Unit Operations Controller (UOC) Upgrade:**  Facilitates upgrading from C200 to Unit Operations Controller.

- **6.4 UIO16 Module:** Introduces a new UIO16 module.

- **6.5 Experion Reporting Enhancements:** Improves the reporting capabilities within Experion.

- **6.6 User Assistance:**  Enhancements to the user assistance features.

- **6.7 Experion Support and Maintenance Enhancements:** Improves Experion support and maintenance processes.

- **6.8 UOC Integration of HART over Ethernet/IP network:** Enables HART over Ethernet/IP network integration with the UOC.

- **6.9 Control Builder Picker Enhance PLC Points:** Enhances PLC point selection in Control Builder.

- **6.10 Qualify Replacement Smart Card Reader:**  Adds the ability to qualify a replacement smart card reader.

- **6.11 Experion TPS faceplate enhancement:** Improves the Experion TPS faceplate.

- **6.12 Switch Tree View with one Click:** Allows switching tree views with a single click.

- **6.13 UIS-R2106 - Find/Replace in Sequential Control Module (SCM):** Adds find/replace functionality to the SCM.

- **6.14 UIS-R2304 - Copy/Paste feature for Sequential Control Module (SCM) steps:** Enables copying and pasting steps within the SCM.

- **6.15 UIS-R2308 - Alarm summary Improvements:** Improves alarm summary features.

- **6.16 UIS-R2401 - Alarm Shelving:** Introduces alarm shelving functionality.

- **6.17 UIS-R2405 - Controller Normal Mode Report:** Adds a controller normal mode report.

- **6.18 UIS-R2406 - Add hourly average to group displays:** Adds hourly average display to group displays.

- **6.19 UIS-R2203 - TPS Faceplate Consistency Group:** Improves consistency within TPS faceplate groups.

- **6.20 UOC DLR Topology - Connecting 2 DLR rings:** Allows connecting two DLR rings in UOC topology.

- **6.21 FOUNDATION FIELDBUS, FIM8 Model - CC-PFB802:**  Supports FOUNDATION FIELDBUS, FIM8 Model CC-PFB802.

- **6.22 Adding Short Circuit Alarm (SCA) Thermocouple (TC) /Resistance Temperature Detector (RTD) module configuration utility in Experion:** Adds a configuration utility for SCA thermocouples and RTD modules in Experion.

- **6.23 Universal Low Level Input Adapter:** Introduces a universal low-level input adapter.

- **6.24 Update ADC to support 96 Point Universal Process Cabinet (UPC):** Updates the ADC to support a 96-point UPC.
    """
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    response = model.generate_content(
        prompt,
        generation_config={
            "temperature": 0.3,
            "max_output_tokens": 2000
        }
    )
    
    print(f"Response: {response.text}")
    
    return response.text



def get_intermediate_upgrades(old_upgrade: str, new_upgrade: str) -> List[str]:
    """Get all upgrade versions between two versions"""
    try:
        base_upgrade = old_upgrade.split("_SCN")[0]
        print(f"Base upgrade: {base_upgrade}")
        
        old_version_number = int(re.search(r"\.(\d+)", old_upgrade).group(1))
        new_version_number = int(re.search(r"\.(\d+)", new_upgrade).group(1))
        print(f"Old decimal: {old_version_number}")
        print(f"New decimal: {new_version_number}")

        intermediate_upgrades = []
        for i in range(old_version_number, new_version_number + 1):
            upgrade_name = f"{base_upgrade.split('.')[0]}.{i}_SCN"
            upgrade_path = os.path.join(features_dir, f"{upgrade_name}.pdf")
            if os.path.exists(upgrade_path):
                intermediate_upgrades.append(upgrade_name)
                
        print(f"Found intermediate upgrade: {intermediate_upgrades}")
        return intermediate_upgrades
    except Exception as e:
        print(f"Error getting intermediate upgrades: {e}")
        return []
    

def fuzzy_match_section(text: str, possible_titles: List[str], threshold: int = 80) -> Optional[str]:
    """Finds the best-matching section title in the text using fuzzy matching."""
    for line in text.split("\n"):
        for title in possible_titles:
            if fuzz.ratio(line.strip().lower(), title.lower()) >= threshold:
                print(f"Matched title: {line.strip()}")
                return line.strip()  # Return the best-matched title
    return None

def extract_new_features_fuzzy(pdf_path: str) -> str:
    """Extracts the "New Features and Enhancements" section using fuzzy search from a PDF."""
    doc = fitz.open(pdf_path)  # Open PDF
    full_text = ""

    # Extract text from all pages
    for page in doc:
        full_text += page.get_text() + "\n"  # Fixed: Using correct method get_text() instead of get_intermediate_upgrades

    # Define possible variations of section titles
    section_titles = [
        "New Features and Enhancements", 
        "New Features & Enhancements",
    ]

    # Find the actual section title using fuzzy matching
    matched_title = fuzzy_match_section(full_text, section_titles)

    if not matched_title:
        return "Section title not found."

    # Ensure matched_title is properly escaped
    escaped_title = re.escape(matched_title)

    # Pattern 1: Extract text after matched_title till next section or subsection
    pattern = rf"{escaped_title}\n(.*?)(?=\n(?:[A-Z0-9][A-Z0-9 .-]{{3,}}\n|\d+\.\d+(?:\.\d+)?))"

    # Pattern 2: Matches subsection numbers like "6.2.1", "6.2.3" within matched_title section
    pattern2 = rf"{escaped_title}.*?\b\d+\.\d+\.\d+\b"

    # Apply regex
    match = re.search(pattern, full_text, re.DOTALL)
    subsections = re.findall(pattern2, full_text, re.DOTALL)  # Get all matching subsections

    if match:
        content = match.group(1).strip()
        if subsections:
            content += "\n" + "\n".join(subsections)  # Append all subsections if found
        print(f"Matched section:\n{content}")
        return content  # Extract matched content
    else:
        return "Section found but content extraction failed."


def extract_new_features(old_upgrade: str, new_upgrade: str) -> Dict[str, str]:
    """Extract new features between two versions"""
    # Define the path to the PDF files
    old_pdf_path = os.path.join(features_dir, f"{old_upgrade}.pdf")
    new_pdf_path = os.path.join(features_dir, f"{new_upgrade}.pdf")

    # Extract pdfs that have intermediate releases
    intermediate_releases_pdfs = get_intermediate_upgrades(old_upgrade, new_upgrade)
    
    # Extract features from each intermediate release PDF
    all_features = {}
    for release in intermediate_releases_pdfs:
        pdf_path = os.path.join(features_dir, f"{release}.pdf")
        features_text = extract_new_features_fuzzy(pdf_path)
        if(features_text == "Section found but content extraction failed." or features_text == "Section title not found." or features_text == ""):
            all_features[release] = "**NO FEATURES WERE FOUND**"
            continue
        all_features[release] = generate_feature_summary(features_text)
        
    return all_features

    
    
    
    
    


# # Example usage
# pdf_path = r"C:\Users\shama\Desktop\HoneyWell Hackathon\Task 3\Task3 Dataset\Input\For_NewFeatures\R511.3_SCN.pdf"  # Replace with your actual PDF path
# new_features = extract_new_features_fuzzy(pdf_path)
# print(new_features)

import os
import re

import tabula
import pandas as pd
from fpdf import FPDF










fixed_known_issues_dir = issues_dir  # Use the same directory defined above





# Extract the base release and TCU numbers from the release strings
def get_intermediate_releases(old_release: str, new_release: str) -> List[str]:
    """Get intermediate releases between two TCU versions"""
    base_release = old_release.split("_TCU")[0]
    old_tcu_number = int(re.search(r"TCU(\d+)", old_release).group(1))
    new_tcu_number = int(re.search(r"TCU(\d+)", new_release).group(1))

    # Generate the list of intermediate releases that exist
    intermediate_releases = []
    for i in range(old_tcu_number, new_tcu_number + 1):
        release_name = f"{base_release}_TCU{i}_SCN"
        release_path = os.path.join(issues_dir, f"{release_name}.pdf")
        if os.path.exists(release_path):
            intermediate_releases.append(release_name)

    return intermediate_releases



def extract_fixed_known_issues(release: str, fixed_issues_table: pd.DataFrame, known_issues_table: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Extract fixed and known issues from a release"""
    pdf_path = os.path.join(issues_dir, f"{release}.pdf")
    print(f"Processing {pdf_path} for fixed and known issues")
    
    if not os.path.exists(pdf_path):
        print(f"Warning: PDF file not found at {pdf_path}")
        return fixed_issues_table, known_issues_table
    
    try:
        # Read all tables from the PDF
        print(f"Reading tables from {pdf_path}")
        tables = tabula.read_pdf(pdf_path, pages='all', lattice=True, multiple_tables=True, guess=False)
        print(f"Found {len(tables)} tables")

        for i, table in enumerate(tables):
            if table is None or table.empty:
                print(f"Table {i+1} is empty or None, skipping...")
                continue
                
            print(f"\nTable {i+1} columns:", list(table.columns))
            print(f"Table {i+1} shape: {table.shape}")
            
            # Clean up column names by removing newlines and extra spaces
            table.columns = [str(col).strip().replace('\r', ' ').replace('\n', ' ') for col in table.columns]
            print(f"Cleaned columns: {list(table.columns)}")
            
            # Check for fixed issues table
            if all(col in table.columns for col in ['PAR', 'Impact', 'Subsystem', 'Description']):
                print(f"Found fixed issues table with {len(table)} rows")
                # Add a column to identify the release
                table['Release'] = release
                fixed_issues_table = pd.concat([fixed_issues_table, table], ignore_index=True)
            
            # Check for known issues table
            if all(col in table.columns for col in ['PAR', 'Impact', 'Function', 'Description']):
                print(f"Found known issues table with {len(table)} rows")
                # Add a column to identify the release
                table['Release'] = release
                known_issues_table = pd.concat([known_issues_table, table], ignore_index=True)

        print(f"After processing {release}:")
        print(f"Fixed issues total rows: {len(fixed_issues_table)}")
        print(f"Known issues total rows: {len(known_issues_table)}")
        return fixed_issues_table, known_issues_table
        
    except Exception as e:
        print(f"Error processing {release}: {str(e)}")
        return fixed_issues_table, known_issues_table



def save_table_to_pdf(dataframe: pd.DataFrame, output_path: str, title: str) -> None:
    """Save a DataFrame to PDF"""
    pdf = FPDF(orientation="L")  # Set landscape mode for wider tables
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Use Default Font (Arial)
    pdf.set_font("Arial", "B", 12)

    # Add Title
    pdf.cell(0, 10, title, ln=True, align="C")
    pdf.ln(10)

    # Adjust Column Width (Considering Margins)
    page_width = pdf.w - 20  # Total width minus left & right margins
    col_width = page_width / len(dataframe.columns)  # Dynamically fit columns
    row_height = 8  # Adjust row height to fit more rows

    # Add Table Headers
    pdf.set_font("Arial", "B", 10)
    for col_name in dataframe.columns:
        pdf.cell(col_width, row_height, col_name, border=1, align="C")
    pdf.ln(row_height)

    # Add Table Rows
    pdf.set_font("Arial", "", 9)
    for _, row in dataframe.iterrows():
        for col in row:
            text = str(col).replace(""", '"').replace(""", '"').replace("'", "'")
            pdf.cell(col_width, row_height, text.encode("latin-1", "replace").decode("latin-1"), border=1, align="L")
        pdf.ln(row_height)

    # Save the PDF
    try:
        pdf.output(output_path)
        print(f"✅ Table saved to PDF at {output_path}")
    except Exception as e:
        print(f"❌ Error saving PDF: {e}")




def process_scn_changes(old_version: str, new_version: str, include_features: bool = True, include_issues: bool = True) -> SCNResult:
    """
    Process SCN changes between two versions.
    
    Args:
        old_version: Starting version (e.g., "R511.2_SCN" or "R520.1_TCU1_SCN")
        new_version: Ending version
        include_features: Whether to process new features
        include_issues: Whether to process fixed/known issues
    
    Returns:
        SCNResult object containing features, issues, and output file paths
    """
    result = SCNResult()
    print(f"\nProcessing SCN changes from {old_version} to {new_version}")
    print(f"Features directory: {features_dir}")
    print(f"Issues directory: {issues_dir}")
    
    try:
        # Process features if requested
        if include_features:
            old_features_path = os.path.join(features_dir, f"{old_version}.pdf")
            new_features_path = os.path.join(features_dir, f"{new_version}.pdf")
            print(f"\nChecking feature files:")
            print(f"Old version: {old_features_path} (exists: {os.path.exists(old_features_path)})")
            print(f"New version: {new_features_path} (exists: {os.path.exists(new_features_path)})")
            
            if os.path.exists(old_features_path) and os.path.exists(new_features_path):
                result.features = extract_new_features(old_version, new_version)
                
                # Save features to markdown
                features_file = os.path.join(output_dir, f"New_Features_{old_version}_to_{new_version}.md")
                with open(features_file, "w", encoding="utf-8") as f:
                    for release, features in result.features.items():
                        f.write(f"## {release}\n\n")
                        f.write(features + "\n\n")
                result.output_files["features"] = features_file
                print(f"Features saved to: {features_file}")
        
        # Process issues if requested
        if include_issues:
            print("\nProcessing issues...")
            # Initialize empty DataFrames
            fixed_issues_table = pd.DataFrame()
            known_issues_table = pd.DataFrame()
            
            # Convert SCN version to TCU version for issues
            # Example: R511.2_SCN -> R520.1_TCU1_SCN
            tcu_old_version = "R520.1_TCU1_SCN"
            tcu_new_version = "R520.1_TCU4_SCN"
            
            # Process each intermediate release
            intermediate_releases = get_intermediate_releases(tcu_old_version, tcu_new_version)
            print(f"Found intermediate releases: {intermediate_releases}")
                
            for release in intermediate_releases:
                print(f"\nProcessing issues for release: {release}")
                fixed_issues_table, known_issues_table = extract_fixed_known_issues(
                    release, fixed_issues_table, known_issues_table
                )
            
            result.fixed_issues = fixed_issues_table
            result.known_issues = known_issues_table
            
            print(f"\nFinal results:")
            print(f"Fixed issues rows: {len(fixed_issues_table)}")
            print(f"Known issues rows: {len(known_issues_table)}")
            
            # Save to CSV and PDF
            base_path = os.path.join(output_dir, f"Fixed_Issues_{old_version}_to_{new_version}")
            
            # Save fixed issues
            if not fixed_issues_table.empty:
                fixed_csv = f"{base_path}.csv"
                fixed_pdf = f"{base_path}.pdf"
                fixed_issues_table.to_csv(fixed_csv, index=False)
                save_table_to_pdf(fixed_issues_table, fixed_pdf, f"Fixed Issues {old_version}_to_{new_version}")
                result.output_files["fixed_issues_csv"] = fixed_csv
                result.output_files["fixed_issues_pdf"] = fixed_pdf
                print(f"Fixed issues saved to: {fixed_csv} and {fixed_pdf}")
            
            # Save known issues
            if not known_issues_table.empty:
                known_csv = os.path.join(output_dir, f"Known_Issues_{old_version}_to_{new_version}.csv")
                known_pdf = os.path.join(output_dir, f"Known_Issues_{old_version}_to_{new_version}.pdf")
                known_issues_table.to_csv(known_csv, index=False)
                save_table_to_pdf(known_issues_table, known_pdf, f"Known Issues {old_version}_to_{new_version}")
                result.output_files["known_issues_csv"] = known_csv
                result.output_files["known_issues_pdf"] = known_pdf
                print(f"Known issues saved to: {known_csv} and {known_pdf}")
        
        return result
    
    except Exception as e:
        print(f"Error processing SCN changes: {str(e)}")
        import traceback
        traceback.print_exc()
        return result

if __name__ == "__main__":
    # Example usage
    old_version = "R511.2_SCN"
    new_version = "R511.4_SCN"
    
    result = process_scn_changes(old_version, new_version)
    
    if result.features:
        print("\nExtracted Features:")
        for release, features in result.features.items():
            print(f"\n{release}:")
            print(features)
    
    if not result.fixed_issues.empty:
        print("\nFixed Issues:")
        print(result.fixed_issues)
    
    if not result.known_issues.empty:
        print("\nKnown Issues:")
        print(result.known_issues)
    
    print("\nOutput Files:")
    for file_type, file_path in result.output_files.items():
        print(f"{file_type}: {file_path}")