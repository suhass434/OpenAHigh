from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
import os
from typing import List, Dict
import shutil
from pathlib import Path
from datetime import datetime
from urllib.parse import unquote
from pydantic import BaseModel
from chat_utils import setup_conversation_chain, get_conversation_response
import logging


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
async def upload_pdf(
    files: List[UploadFile] = File(..., alias="file[]"),
    userEmail: str = Form(...)
):
    try:
        if not files:
            raise HTTPException(status_code=400, detail="No files provided")
        
        
        user_dir = ensure_user_directory(userEmail)
        uploaded_files = []
        
        for file in files:
            if file and allowed_file(file.filename):
                filename = Path(file.filename).name
                file_path = os.path.join(user_dir, filename)
                
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                
                uploaded_files.append(get_file_info(file_path))
        
        if not uploaded_files:
            raise HTTPException(status_code=400, detail="No valid PDF files uploaded")
            
        return JSONResponse(
            content={
                "message": "Files uploaded successfully",
                "files": uploaded_files
            },
            status_code=200
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Chat models and endpoint
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)


