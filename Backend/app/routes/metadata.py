from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from typing import List
import os
import shutil
from pathlib import Path
from ..auth.auth_bearer import JWTBearer
from ..services.metadata_service import process_pdfs_for_user

router = APIRouter()

# Ensure PDF upload directory exists
PDF_UPLOAD_DIR = Path("uploads/pdfs")
PDF_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload", dependencies=[Depends(JWTBearer())])
async def upload_pdfs(files: List[UploadFile] = File(...), user_id: str = Depends(JWTBearer())):
    """
    Upload PDFs for metadata extraction
    """
    try:
        # Create user-specific directory
        user_pdf_dir = PDF_UPLOAD_DIR / user_id
        user_pdf_dir.mkdir(exist_ok=True)
        
        uploaded_files = []
        for file in files:
            if not file.filename.lower().endswith('.pdf'):
                raise HTTPException(status_code=400, detail=f"File {file.filename} is not a PDF")
            
            # Save the file
            file_path = user_pdf_dir / file.filename
            with file_path.open("wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            uploaded_files.append(file.filename)
        
        return {"message": f"Successfully uploaded {len(uploaded_files)} files", "files": uploaded_files}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extract", dependencies=[Depends(JWTBearer())])
async def extract_metadata(user_id: str = Depends(JWTBearer())):
    """
    Process PDFs and extract metadata
    """
    try:
        user_pdf_dir = PDF_UPLOAD_DIR / user_id
        if not user_pdf_dir.exists():
            raise HTTPException(status_code=404, detail="No PDFs found for processing")
        
        # Process PDFs and get metadata
        metadata_results = await process_pdfs_for_user(user_pdf_dir)
        
        return {
            "message": "Metadata extraction completed",
            "results": metadata_results
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/files", dependencies=[Depends(JWTBearer())])
async def list_user_files(user_id: str = Depends(JWTBearer())):
    """
    List PDFs uploaded by the user
    """
    try:
        user_pdf_dir = PDF_UPLOAD_DIR / user_id
        if not user_pdf_dir.exists():
            return {"files": []}
        
        files = [f.name for f in user_pdf_dir.glob("*.pdf")]
        return {"files": files}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 