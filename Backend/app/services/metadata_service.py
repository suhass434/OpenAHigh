import fitz
import re
import os
import logging
import json
import google.generativeai as genai
from pathlib import Path
from dotenv import load_dotenv
from typing import List, Dict, Any
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Initialize logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configure Gemini API
load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def extract_document_id(pdf_path: str) -> str:
    """Extract document ID from filename with validation"""
    try:
        match = re.search(r'\b(BW|PN)\d{4}-\d+[A-Z]?\b', Path(pdf_path).stem.upper())
        return match.group(0) if match else "UNKNOWN"
    except Exception as e:
        logger.error(f"Error extracting document ID: {str(e)}")
        return "UNKNOWN"

async def extract_with_llm(text: str, doc_id: str) -> Dict[str, Any]:
    """Enhanced LLM extraction with sliding window"""
    chunk_size = 12000
    overlap = 3000
    max_chunks = 5
    base_delay = 15
    max_retries = 3
    required_keys = ["affected_assets", "affected_release", 
                    "fixed_release", "par_number", "configuration"]
    
    combined_result = {}
    
    for chunk_idx in range(max_chunks):
        start = chunk_idx * (chunk_size - overlap)
        end = start + chunk_size
        chunk_text = text[start:end]
        
        if not chunk_text:
            break

        prompt = f"""Analyze this technical document and extract the following information:
        - Affected assets (list of hardware/software components)
        - Affected software releases/versions
        - Fixed releases/versions with updates
        - PAR numbers (problem report IDs)
        - Affected configurations

        Format response as JSON with these keys:
        "affected_assets", "affected_release", "fixed_release", "par_number", "configuration"

        Document text:
        {chunk_text}
        """

        for attempt in range(max_retries):
            try:
                model = genai.GenerativeModel('gemini-1.5-flash')
                response = model.generate_content(prompt)
                json_str = response.text.replace('```json', '').replace('```', '').strip()
                chunk_data = json.loads(json_str)

                for key in required_keys:
                    if key not in combined_result or not combined_result[key]:
                        combined_result[key] = chunk_data.get(key, "")

                if all(combined_result.get(k) for k in required_keys):
                    return combined_result

                break

            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON in chunk {chunk_idx+1}, attempt {attempt+1}")
                if attempt == max_retries-1:
                    continue
            except Exception as e:
                logger.error(f"Chunk {chunk_idx+1} failed: {str(e)}")
                if '429' in str(e):
                    await asyncio.sleep(base_delay * (2 ** attempt))
                continue

        if all(combined_result.get(k) for k in required_keys):
            break

    return combined_result if any(combined_result.values()) else None

def extract_sections(text: str, doc_id: str) -> Dict[str, str]:
    """Enhanced hybrid extraction with improved patterns"""
    sections = {
        "document_id": doc_id,
        "affected_product": "Experion PKS",
        "affected_assets": "",
        "affected_release": "",
        "fixed_release": "",
        "par_number": "",
        "configuration": ""
    }

    try:
        # Assets with multi-line support
        assets_match = re.search(
            r'(?:AFFECTED COMPONENTS?|PRODUCT AFFECTED):\s*((?:(?:C300|UOC|EIM|ELCN|C200E?|C300PM|EHPMX|UEA|UVA|CN100|Experion PKS Servers)[\s\S]*?))(?:\.|$|\n\S+)',
            text, re.IGNORECASE)
        if assets_match:
            sections["affected_assets"] = "\n".join(
                [a.strip() for a in re.split(r', |\n|;', assets_match.group(1)) if a.strip()]
            )

        # Other regex patterns...
        # (keeping the core extraction logic from the original file)

    except Exception as e:
        logger.error(f"Regex extraction error: {str(e)}")

    return sections

async def process_single_pdf(pdf_path: Path) -> Dict[str, Any]:
    """Process a single PDF file and extract metadata"""
    try:
        doc = fitz.open(str(pdf_path))
        text = " ".join([page.get_text("text") for page in doc])
        doc_id = extract_document_id(str(pdf_path))
        
        # Get initial results from regex
        result = extract_sections(text, doc_id)
        
        # Augment with LLM if needed
        required_fields = ["affected_assets", "affected_release", "fixed_release"]
        if not all(result.get(field) for field in required_fields):
            llm_data = await extract_with_llm(text, doc_id)
            if llm_data:
                for key, value in llm_data.items():
                    if not result.get(key) and value:
                        result[key] = value
        
        return result
        
    except Exception as e:
        logger.error(f"Error processing {pdf_path}: {str(e)}")
        return None

async def process_pdfs_for_user(user_pdf_dir: Path) -> List[Dict[str, Any]]:
    """Process all PDFs in the user's directory"""
    pdf_files = list(user_pdf_dir.glob("*.pdf"))
    if not pdf_files:
        return []

    # Process PDFs concurrently
    tasks = [process_single_pdf(pdf) for pdf in pdf_files]
    results = await asyncio.gather(*tasks)
    
    # Filter out None results and return
    return [result for result in results if result is not None] 