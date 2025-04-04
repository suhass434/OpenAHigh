import os
from dotenv import load_dotenv
import fitz  # PyMuPDF
import pandas as pd
from tabula import read_pdf
from fuzzywuzzy import fuzz
import google.generativeai as genai
import logging
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configure Gemini AI
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

def find_section_boundaries(text, start_markers, end_markers):
    """Find the start and end indices of a section based on markers."""
    # Find start of section
    start_idx = -1
    end_idx = -1
    matched_start = None
    
    for marker in start_markers:
        idx = text.find(marker)
        if idx != -1 and (start_idx == -1 or idx < start_idx):
            start_idx = idx
            matched_start = marker
    
    if start_idx == -1:
        return None, None
    
    # Find end of section
    for marker in end_markers:
        idx = text.find(marker, start_idx + len(matched_start))
        if idx != -1 and (end_idx == -1 or idx < end_idx):
            end_idx = idx
    
    # If no end marker found, take a reasonable chunk
    if end_idx == -1:
        end_idx = start_idx + 5000  # Larger chunk to ensure we get everything
    
    return start_idx, end_idx

def extract_new_features(pdf_path):
    """Extract new features section from PDF using fuzzy search."""
    try:
        doc = fitz.open(pdf_path)
        logger.info(f"PDF has {len(doc)} pages")
        
        text = ""
        for page_num, page in enumerate(doc, 1):
            page_text = page.get_text()
            logger.info(f"Page {page_num} has {len(page_text)} characters")
            text += page_text
            
            # Print first 200 characters of each page for debugging
            preview = page_text[:200].replace('\n', ' ').strip()
            logger.info(f"Page {page_num} preview: {preview}")
        
        doc.close()
        
        # Define section markers
        start_markers = [
            "New Features and Enhancements",
            "New Features",
            "Features and Enhancements",
            "New Features & Enhancements",
            "What's New",
            "New in this Release"
        ]
        
        end_markers = [
            "Problems resolved",
            "Fixed Issues",
            "Known Issues",
            "Special Considerations",
            "Installation Instructions"
        ]
        
        # Find the features section
        start_idx, end_idx = find_section_boundaries(text, start_markers, end_markers)
        
        if start_idx is not None:
            feature_text = text[start_idx:end_idx]
            logger.info(f"Found feature text of length {len(feature_text)}")
            
            # Use Gemini to format the features nicely
            prompt = f"""Extract and format the new features from this text as a markdown list.
            Text: {feature_text}
            
            Instructions:
            1. Extract only the actual features and enhancements
            2. Format each feature as a bullet point
            3. Make the description clear and concise
            4. Ignore any headers, footers, or non-feature text
            5. If a feature has sub-points, include them as nested bullet points
            6. Group features by category if categories are present"""
            
            response = model.generate_content(prompt)
            return response.text
        return "No new features section found in the document"
    
    except Exception as e:
        logger.error(f"Error processing PDF for new features: {str(e)}")
        return f"Error extracting new features: {str(e)}"

def is_issue_table(table):
    """Check if a table contains issue information."""
    if table.empty:
        return False, None
    
    # Convert column names to string and clean them
    table.columns = table.columns.astype(str).str.strip()
    
    # Common patterns for issue tables
    required_columns = {
        'id': ['ID', 'PAR', 'Issue ID', 'Problem ID'],
        'description': ['Description', 'Problem Description', 'Issue Description'],
        'impact': ['Impact', 'System Impact', 'Severity']
    }
    
    # Check if the table has the required columns
    has_columns = {
        key: any(col in ' '.join(table.columns).upper() for col in patterns)
        for key, patterns in required_columns.items()
    }
    
    # Table should have at least ID and Description
    if has_columns['id'] and has_columns['description']:
        # Try to determine if it's a fixed or known issue table
        table_text = ' '.join(table.columns).upper()
        if 'FIXED' in table_text or 'RESOLVED' in table_text:
            return True, 'fixed'
        elif 'KNOWN' in table_text or 'OPEN' in table_text:
            return True, 'known'
        # If not clearly marked, check the content
        table_content = ' '.join(table.values.flatten().astype(str)).upper()
        if 'FIXED' in table_content or 'RESOLVED' in table_content:
            return True, 'fixed'
        elif 'KNOWN' in table_content or 'OPEN' in table_content:
            return True, 'known'
    
    return False, None

def extract_issues(pdf_path):
    """Extract fixed and known issues from PDF using tabula."""
    try:
        logger.info(f"Attempting to extract tables from {pdf_path}")
        
        # Try to extract tables that might contain issues
        tables = read_pdf(
            pdf_path,
            pages='all',
            multiple_tables=True,
            guess=True,
            lattice=True,  # Try to detect table borders
            stream=True    # Also try stream-mode as backup
        )
        
        logger.info(f"Found {len(tables)} tables in the PDF")
        
        fixed_issues = pd.DataFrame()
        known_issues = pd.DataFrame()
        
        for idx, table in enumerate(tables, 1):
            # Skip empty tables
            if table.empty:
                logger.info(f"Table {idx} is empty, skipping")
                continue
            
            # Print table info for debugging
            logger.info(f"\nTable {idx}:")
            logger.info(f"Columns: {table.columns.tolist()}")
            logger.info(f"Shape: {table.shape}")
            
            # Check if this is an issue table
            is_issue, issue_type = is_issue_table(table)
            
            if is_issue:
                logger.info(f"Table {idx} appears to contain {issue_type} issues")
                if issue_type == 'fixed':
                    fixed_issues = pd.concat([fixed_issues, table], ignore_index=True)
                elif issue_type == 'known':
                    known_issues = pd.concat([known_issues, table], ignore_index=True)
        
        # Clean up the dataframes
        for df_name, df in [("Fixed Issues", fixed_issues), ("Known Issues", known_issues)]:
            if not df.empty:
                logger.info(f"\nProcessing {df_name}:")
                logger.info(f"Original shape: {df.shape}")
                # Remove any completely empty rows or columns
                df.dropna(how='all', inplace=True)
                df.dropna(axis=1, how='all', inplace=True)
                # Clean column names
                df.columns = df.columns.str.strip()
                logger.info(f"Shape after cleaning: {df.shape}")
        
        return fixed_issues, known_issues
    
    except Exception as e:
        logger.error(f"Error processing PDF for issues: {str(e)}")
        return pd.DataFrame(), pd.DataFrame()

def main():
    # Get the current script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Set paths relative to the AIBackend directory
    features_dir = os.path.join(script_dir, "data", "For_NewFeatures")
    issues_dir = os.path.join(script_dir, "data", "For_IssuesFixed_KnownIssues")
    
    # Verify directories exist
    for directory in [features_dir, issues_dir]:
        if not os.path.exists(directory):
            logger.error(f"Directory not found: {directory}")
            return
    
    # Test with specific versions
    old_version = "R511.3"
    new_version = "R520.1"
    
    logger.info(f"Features directory: {features_dir}")
    logger.info(f"Issues directory: {issues_dir}")
    logger.info(f"\nAnalyzing changes between {old_version} and {new_version}")
    
    # Process new features
    new_features_pdf = os.path.join(features_dir, f"{new_version}_SCN.pdf")
    logger.info(f"\nLooking for new features in: {new_features_pdf}")
    if os.path.exists(new_features_pdf):
        logger.info("Found new features PDF file")
        features = extract_new_features(new_features_pdf)
        print("\n=== New Features ===")
        print(features)
    else:
        logger.error(f"New features PDF file not found: {new_features_pdf}")
    
    # Process fixed issues
    fixed_issues_pdf = os.path.join(issues_dir, f"{new_version}_TCU1_SCN.pdf")
    logger.info(f"\nLooking for issues in: {fixed_issues_pdf}")
    if os.path.exists(fixed_issues_pdf):
        logger.info("Found issues PDF file")
        fixed_issues, known_issues = extract_issues(fixed_issues_pdf)
        
        if not fixed_issues.empty:
            print("\n=== Fixed Issues ===")
            # Format the output for better readability
            pd.set_option('display.max_colwidth', None)
            pd.set_option('display.max_rows', None)
            print(fixed_issues.to_string(index=False))
        else:
            print("\nNo fixed issues found or could not parse the fixed issues table")
            
        if not known_issues.empty:
            print("\n=== Known Issues ===")
            print(known_issues.to_string(index=False))
        else:
            print("\nNo known issues found or could not parse the known issues table")
    else:
        logger.error(f"Issues PDF file not found: {fixed_issues_pdf}")

if __name__ == "__main__":
    main() 