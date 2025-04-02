from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from typing import List
import shutil
from pathlib import Path

app = FastAPI()


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

@app.get("/")
async def hello_world_ai():
    return {"message": "HELLO AI TEAM"}

@app.post("/upload-pdf/")
async def upload_pdf(
    files: List[UploadFile] = File(..., alias="file[]"),
    userEmail: str = Form(...)
):
    try:
        if not files:
            raise HTTPException(status_code=400, detail="No files provided")
        
       
        user_dir = os.path.join(UPLOAD_FOLDER, userEmail)
        if not os.path.exists(user_dir):
            os.makedirs(user_dir)
        
        uploaded_files = []
        
        for file in files:
            if file and allowed_file(file.filename):
               
                filename = Path(file.filename).name  
                file_path = os.path.join(user_dir, filename)
                
               
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                
                uploaded_files.append({
                    "filename": filename,
                    "path": file_path
                })
        
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)


