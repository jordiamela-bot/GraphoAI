import io
import os
import uuid
import datetime
import base64
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn
import json

from analyzer import process_file_to_image, analyze_handwriting
from openai_client import generate_graphology_report
from pdf_generator import generate_pdf_report
import db

app = FastAPI(title="GraphoAI API", description="API for AI-assisted graphopsychological analysis")

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup and mount static uploads directory to serve history images
uploads_dir = os.path.join(os.path.dirname(__file__), "data", "uploads")
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)
app.mount("/api/uploads", StaticFiles(directory=uploads_dir), name="uploads")

def save_base64_image(base64_str, output_path):
    """Saves a base64 encoded data URI to a physical file on disk."""
    try:
        # Extract the base64 part
        data_part = base64_str.split(",")[1]
        img_bytes = base64.b64decode(data_part)
        with open(output_path, "wb") as f:
            f.write(img_bytes)
    except Exception as e:
        print(f"Error saving image file {output_path}: {e}")

@app.post("/api/analyze")
async def analyze_document(
    file: UploadFile = File(...),
    name: str = Form("Desconegut")
):
    """
    Endpoint that receives an image or PDF, along with the subject's name.
    Runs layout calculations, requests the report, saves images to disk,
    persists in SQLite history database, and returns the result.
    """
    filename = file.filename
    try:
        file_bytes = await file.read()
        
        # 1. Convert file (PDF, HEIC, Images) to OpenCV image
        img = process_file_to_image(file_bytes, filename)
        
        # 2. Extract layout features and step base64s
        features, steps_visualizations = analyze_handwriting(img)
        
        # 3. Request graphology report from OpenAI
        report, is_demo_mode = generate_graphology_report(features)
        
        # 4. Save visualization steps to files and register in Database
        analysis_id = str(uuid.uuid4())
        timestamp = datetime.datetime.now().isoformat()
        
        original_url = f"/api/uploads/{analysis_id}_original.jpg"
        processed_url = f"/api/uploads/{analysis_id}_processed.jpg"
        lines_url = f"/api/uploads/{analysis_id}_lines.jpg"
        words_url = f"/api/uploads/{analysis_id}_words.jpg"
        letters_url = f"/api/uploads/{analysis_id}_letters.jpg"
        
        save_base64_image(steps_visualizations['original'], os.path.join(uploads_dir, f"{analysis_id}_original.jpg"))
        save_base64_image(steps_visualizations['processed'], os.path.join(uploads_dir, f"{analysis_id}_processed.jpg"))
        save_base64_image(steps_visualizations['lines_detected'], os.path.join(uploads_dir, f"{analysis_id}_lines.jpg"))
        save_base64_image(steps_visualizations['words_detected'], os.path.join(uploads_dir, f"{analysis_id}_words.jpg"))
        save_base64_image(steps_visualizations['letters_detected'], os.path.join(uploads_dir, f"{analysis_id}_letters.jpg"))
        
        db.save_analysis(
            analysis_id,
            name,
            filename,
            timestamp,
            features,
            report,
            original_url,
            processed_url,
            lines_url,
            words_url,
            letters_url
        )
        
        # Add analysis ID and name to response
        return {
            "success": True,
            "id": analysis_id,
            "name": name,
            "filename": filename,
            "is_demo_mode": is_demo_mode,
            "features": features,
            "report": report,
            "visualizations": {
                "original": original_url,
                "processed": processed_url,
                "lines_detected": lines_url,
                "words_detected": words_url,
                "letters_detected": letters_url
            }
        }
        
    except Exception as e:
        print(f"Exception during analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
async def get_history():
    """Retrieves a list of previous analyses (lightweight summary)."""
    try:
        history = db.get_history()
        return {
            "success": True,
            "history": history
        }
    except Exception as e:
        print(f"Exception fetching history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history/{analysis_id}")
async def get_analysis_detail(analysis_id: str):
    """Retrieves the full report details for a specific historical entry."""
    try:
        data = db.get_analysis(analysis_id)
        if not data:
            raise HTTPException(status_code=404, detail="Registre no trobat")
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        print(f"Exception fetching analysis detail: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/history/{analysis_id}")
async def delete_analysis_record(analysis_id: str):
    """Deletes an analysis entry and all its generated visualization files."""
    try:
        image_urls = db.delete_analysis(analysis_id)
        
        # Delete image files from disk
        for url in image_urls:
            filename = url.split("/")[-1]
            filepath = os.path.join(uploads_dir, filename)
            if os.path.exists(filepath):
                try:
                    os.remove(filepath)
                except Exception as e:
                    print(f"Error removing image file {filepath}: {e}")
                    
        return {
            "success": True
        }
    except Exception as e:
        print(f"Exception deleting analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class ExportPDFRequest(BaseModel):
    report: dict

@app.post("/api/export/pdf")
async def export_pdf(payload: ExportPDFRequest):
    """Generates and downloads a PDF of the report."""
    try:
        report_data = payload.report
        pdf_buffer = io.BytesIO()
        
        generate_pdf_report(report_data, pdf_buffer)
        pdf_buffer.seek(0)
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=GraphoAI_Report.pdf"}
        )
    except Exception as e:
        print(f"Exception during PDF generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "mode": "development"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
