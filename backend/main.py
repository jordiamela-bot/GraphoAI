import io
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn
import json

from analyzer import process_file_to_image, analyze_handwriting
from openai_client import generate_graphology_report
from pdf_generator import generate_pdf_report

app = FastAPI(title="GraphoAI API", description="API for AI-assisted graphopsychological analysis")

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze")
async def analyze_document(file: UploadFile = File(...)):
    """
    Endpoint that receives an image or PDF, runs OpenCV layout calculations,
    sends metrics to OpenAI, and returns a detailed graphological report.
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
        
        # 4. Return everything to the frontend
        return {
            "success": True,
            "filename": filename,
            "is_demo_mode": is_demo_mode,
            "features": features,
            "report": report,
            "visualizations": steps_visualizations
        }
        
    except Exception as e:
        print(f"Exception during analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class ExportPDFRequest(BaseModel):
    report: dict

@app.post("/api/export/pdf")
async def export_pdf(payload: ExportPDFRequest):
    """
    Endpoint that takes a report JSON payload and returns a generated PDF file stream.
    """
    try:
        report_data = payload.report
        pdf_buffer = io.BytesIO()
        
        # Generate the PDF into our memory buffer
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
    """Simple API health check endpoint."""
    return {"status": "ok", "mode": "development"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
