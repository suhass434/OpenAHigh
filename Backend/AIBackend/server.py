from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Response, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
import os
from typing import List, Dict, Any, Optional
import shutil
from pathlib import Path
from datetime import datetime
from urllib.parse import unquote
from pydantic import BaseModel
from chat_utils import setup_conversation_chain, get_conversation_response
import logging
from metadata_extraction import process_pdf, create_excel_output
import json
import asyncio
from services.version_compatibility_service import process_migration, generate_migration_excel
import pandas as pd
from io import BytesIO
from services.scn_service import process_scn_data
from scn_accumulation import process_scn_changes, SCNResult
from services.chat_service import process_chat_request
from services.metadata_service import process_metadata_request
from services.version_service import process_version_request


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()


conversation_chain = setup_conversation_chain()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = 'pdfs'
ALLOWED_EXTENSIONS = {'pdf'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_info(file_path: str) -> dict:
    stats = os.stat(file_path)
    return {
        "filename": os.path.basename(file_path),
        "path": file_path,
        "size": stats.st_size,
        "last_modified": datetime.fromtimestamp(stats.st_mtime).isoformat(),
    }

def ensure_user_directory(email: str) -> str:
    """Create and return the user's directory path."""
   
    decoded_email = unquote(email)
    user_dir = os.path.join(UPLOAD_FOLDER, decoded_email)
    if not os.path.exists(user_dir):
        os.makedirs(user_dir)
    return user_dir

@app.get("/")
async def hello_world_ai():
    return {"message": "HELLO AI TEAM"}

@app.get("/pdfs/{user_email}")
async def list_pdfs(user_email: str):
    try:
       
        user_dir = ensure_user_directory(user_email)
        
        files = []
        if os.path.exists(user_dir): 
            for filename in os.listdir(user_dir):
                if filename.lower().endswith('.pdf'):
                    file_path = os.path.join(user_dir, filename)
                    files.append(get_file_info(file_path))
        
        return JSONResponse(
            content={
                "message": "PDFs retrieved successfully" if files else "No PDFs found",
                "files": files
            },
            status_code=200
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/pdfs/{user_email}/{filename}")
async def get_pdf(user_email: str, filename: str):
    try:
        user_dir = ensure_user_directory(user_email)
        file_path = os.path.join(user_dir, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="PDF not found")
        
        return FileResponse(
            file_path,
            media_type="application/pdf",
            filename=filename
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/pdfs/{user_email}/{filename}")
async def delete_pdf(user_email: str, filename: str):
    try:
        user_dir = ensure_user_directory(user_email)
        file_path = os.path.join(user_dir, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="PDF not found")
        
        os.remove(file_path)
        return JSONResponse(
            content={
                "message": f"PDF {filename} deleted successfully"
            },
            status_code=200
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-pdf/")
async def upload_pdf(file: List[UploadFile] = File(...), userEmail: str = Form(...)):
    try:
       
        user_pdf_dir = Path(UPLOAD_FOLDER) / userEmail
        user_pdf_dir.mkdir(exist_ok=True)
        user_output_dir = Path("outputs") / userEmail
        user_output_dir.mkdir(exist_ok=True)

        uploaded_files = []
        for pdf in file:
            if not pdf.filename.lower().endswith('.pdf'):
                raise HTTPException(status_code=400, detail=f"{pdf.filename} is not a PDF file")
            
            file_path = user_pdf_dir / pdf.filename
            with file_path.open("wb") as buffer:
                shutil.copyfileobj(pdf.file, buffer)
            uploaded_files.append(pdf.filename)

        return {"message": "Files uploaded successfully", "files": uploaded_files}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extract-metadata/")
async def extract_metadata(userEmail: str = Form(...)):
    try:
      
        user_pdf_dir = Path("pdfs") / userEmail
        user_output_dir = Path("outputs") / userEmail
        user_output_dir.mkdir(parents=True, exist_ok=True)

        if not user_pdf_dir.exists():
            raise HTTPException(status_code=404, detail="No PDFs found for processing")

        output_file = user_output_dir / "extracted_metadata.xlsx"

       
        metadata_list = []
        pdf_files = list(user_pdf_dir.glob("*.pdf"))
        
        if not pdf_files:
            raise HTTPException(status_code=404, detail="No PDF files found in directory")

      
        for pdf_path in pdf_files:
            try:
                result = process_pdf(pdf_path)
                if result:
                    metadata_list.append(result)
            except Exception as e:
                logger.error(f"Error processing {pdf_path}: {str(e)}")
                continue

        if not metadata_list:
            raise HTTPException(status_code=404, detail="No metadata could be extracted from PDFs")

       
        try:
            create_excel_output(metadata_list, str(output_file))
        except Exception as e:
            logger.error(f"Error creating Excel file: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to create Excel file")

        return {
            "message": "Metadata extraction completed",
            "output_file": str(output_file),
            "metadata": metadata_list
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error in metadata extraction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/download-metadata/{userEmail}")
async def download_metadata(userEmail: str):
    try:
     
        user_output_dir = Path("outputs") / userEmail
        user_output_dir.mkdir(parents=True, exist_ok=True)
        
        output_file = user_output_dir / "extracted_metadata.xlsx"
        
       
        if not output_file.exists():
            logger.error(f"Output file not found at {output_file}")
            raise HTTPException(
                status_code=404, 
                detail=f"No metadata file found for {userEmail}"
            )

       
        return FileResponse(
            path=str(output_file),
            filename="extracted_metadata.xlsx",
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f'attachment; filename="extracted_metadata.xlsx"'
            }
        )

    except Exception as e:
        logger.error(f"Error downloading metadata file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/list-pdfs/{userEmail}")
async def list_pdfs(userEmail: str):
    try:
        user_pdf_dir = Path(UPLOAD_FOLDER) / userEmail
        if not user_pdf_dir.exists():
            return {"files": []}

        files = [f.name for f in user_pdf_dir.glob("*.pdf")]
        return {"files": files}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[Dict[str, str]]

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Chat endpoint that uses our knowledge base to answer questions.
    """
    try:
        if not request.question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")
            
        response = get_conversation_response(
            conversation_chain=conversation_chain,
            question=request.question
        )
        
        return ChatResponse(
            answer=response["answer"],
            sources=response["sources"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e))

@app.post("/api/process_migration")
async def process_migration_endpoint(data: Dict[Any, Any]):
    try:
        installed_source = data.get("installed_source")
        source_details = data.get("source_details")
        target_source = data.get("target_source")
        
        if not all([installed_source, source_details, target_source]):
            raise HTTPException(status_code=400, detail="Missing required fields")

        # Process migration using the version compatibility service
        recommended_versions = process_migration(
            installed_source=installed_source,
            installed_versions=source_details,
            target_version=target_source
        )

        return {"updates": recommended_versions}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/download_results")
async def download_migration_results(data: Dict[Any, Any]):
    try:
        installed_source = data.get("installed_source")
        source_details = data.get("source_details")
        target_source = data.get("target_source")
        
        if not all([installed_source, source_details, target_source]):
            raise HTTPException(status_code=400, detail="Missing required fields")

        # Generate Excel file using the version compatibility service
        excel_bytes = generate_migration_excel(
            installed_source=installed_source,
            installed_versions=source_details,
            target_version=target_source
        )

        # Return the Excel file
        return Response(
            content=excel_bytes.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename=migration_{installed_source}_to_{target_source}.xlsx"
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SCNRequest(BaseModel):
    old_version: str
    new_version: str
    include_features: bool = True
    include_issues: bool = True

class SCNResponse(BaseModel):
    features: Dict[str, str] = {}
    fixed_issues: List[Dict] = []
    known_issues: List[Dict] = []
    output_files: Dict[str, str] = {}

@app.post("/api/scn/process", response_model=SCNResponse)
async def process_scn(request: SCNRequest):
    """
    Process SCN changes between two versions.
    Returns features, fixed issues, and known issues found in the SCN documents.
    """
    try:
        result = process_scn_changes(
            request.old_version,
            request.new_version,
            request.include_features,
            request.include_issues
        )
        
        # Convert DataFrames to lists of dicts for JSON serialization
        response = SCNResponse(
            features=result.features,
            fixed_issues=result.fixed_issues.to_dict('records') if not result.fixed_issues.empty else [],
            known_issues=result.known_issues.to_dict('records') if not result.known_issues.empty else [],
            output_files=result.output_files
        )
        
        return response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/scn/files")
async def get_scn_files():
    """Get list of available SCN files"""
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        features_dir = os.path.join(script_dir, "data", "For_NewFeatures")
        issues_dir = os.path.join(script_dir, "data", "For_IssuesFixed_KnownIssues")
        
        features_files = [f.replace(".pdf", "") for f in os.listdir(features_dir) if f.endswith('.pdf')]
        issues_files = [f.replace(".pdf", "") for f in os.listdir(issues_dir) if f.endswith('.pdf')]
        
        return {
            "features_files": sorted(features_files),
            "issues_files": sorted(issues_files)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/scn/download/{file_path:path}")
async def download_scn_file(file_path: str):
    """Download a generated SCN file"""
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        output_dir = os.path.join(script_dir, "outputs")
        file_path = os.path.join(output_dir, file_path)
        
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            raise HTTPException(status_code=404, detail="File not found")
            
        # Set correct media type based on file extension
        if file_path.endswith('.csv'):
            media_type = "text/csv"
        elif file_path.endswith('.pdf'):
            media_type = "application/pdf"
        elif file_path.endswith('.md'):
            media_type = "text/markdown"
        else:
            media_type = "application/octet-stream"
            
        return FileResponse(
            path=file_path,
            filename=os.path.basename(file_path),
            media_type=media_type
        )
    except Exception as e:
        logger.error(f"Error downloading file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)


