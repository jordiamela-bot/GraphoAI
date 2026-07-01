import urllib.request
import urllib.parse
import mimetypes
import json
import os
from PIL import Image, ImageDraw

def create_mock_handwriting_image(filepath):
    """Creates a simple mock image representing handwriting using PIL."""
    # Create a white canvas (A4 ratio approximation: 600x800)
    img = Image.new('RGB', (600, 800), color='white')
    d = ImageDraw.Draw(img)
    
    # Draw some mock handwriting strokes (lines of text)
    # Line 1
    d.line([(50, 100), (200, 95), (350, 105), (500, 100)], fill='black', width=3)
    # Line 2
    d.line([(60, 180), (180, 185), (320, 175), (480, 180)], fill='black', width=3)
    # Line 3
    d.line([(55, 260), (210, 255), (380, 265), (510, 260)], fill='black', width=3)
    # Signature component at the bottom
    d.line([(350, 650), (400, 630), (450, 670), (520, 640)], fill='blue', width=4)
    d.line([(380, 610), (480, 690)], fill='blue', width=2)
    
    img.save(filepath)
    print(f"Mock handwriting image created at: {filepath}")

def send_multipart_form(url, file_path, subject_name="Albert Einstein"):
    """Sends a file via HTTP POST multipart/form-data using only standard library."""
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    data = []
    
    # Add subject name field
    data.append(f'--{boundary}')
    data.append('Content-Disposition: form-data; name="name"')
    data.append('')
    data.append(subject_name)
    
    # Add file field
    filename = os.path.basename(file_path)
    mime_type, _ = mimetypes.guess_type(file_path)
    if not mime_type:
        mime_type = 'application/octet-stream'
        
    data.append(f'--{boundary}')
    data.append(f'Content-Disposition: form-data; name="file"; filename="{filename}"')
    data.append(f'Content-Type: {mime_type}')
    data.append('')
    
    with open(file_path, 'rb') as f:
        file_content = f.read()
        
    # Build request body
    body = bytearray()
    body.extend('\r\n'.join(data).encode('utf-8'))
    body.extend(b'\r\n')
    body.extend(file_content)
    body.extend(b'\r\n')
    body.extend(f'--{boundary}--\r\n'.encode('utf-8'))
    
    req = urllib.request.Request(url, data=body, method='POST')
    req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')
    
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            return json.loads(res_body)
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code} - {e.read().decode('utf-8')}")
        raise
    except Exception as e:
        print(f"Error during request: {e}")
        raise

if __name__ == "__main__":
    mock_file = "mock_sample.png"
    api_url = "http://127.0.0.1:8000/api/analyze"
    
    try:
        # 1. Create mock handwriting sample
        create_mock_handwriting_image(mock_file)
        
        # 2. Query API
        print(f"Sending request to: {api_url}...")
        result = send_multipart_form(api_url, mock_file)
        
        # 3. Print verification results
        print("\n=== API VERIFICATION SUCCESSFUL ===")
        print(f"Success Status: {result.get('success')}")
        print(f"Filename Processed: {result.get('filename')}")
        print(f"Is Demo Mode: {result.get('is_demo_mode')}")
        
        print("\nExtracted features sample:")
        features = result.get('features', {})
        print(f"- Grandària: {features.get('grandaria', {}).get('value')} ({features.get('grandaria', {}).get('confidence')}% confidence)")
        print(f"- Inclinació: {features.get('inclinacio', {}).get('value')} ({features.get('inclinacio', {}).get('confidence')}% confidence)")
        print(f"- Línia base: {features.get('linea_base', {}).get('value')} ({features.get('linea_base', {}).get('confidence')}% confidence)")
        
        print("\nReport sections received:")
        report = result.get('report', {})
        print(f"- Resum executiu: {report.get('resum_executiu')[:60]}...")
        print(f"- Index Lideratge: {report.get('indexes', {}).get('lideratge')}/100")
        print(f"- Index Organització: {report.get('indexes', {}).get('organitzacio')}/100")
        
        print("\nVisualizations base64 keys:")
        print(list(result.get('visualizations', {}).keys()))
        
    finally:
        # Cleanup mock file
        if os.path.exists(mock_file):
            os.remove(mock_file)
            print(f"\nCleaned up temporary file: {mock_file}")
