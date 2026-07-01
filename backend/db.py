import sqlite3
import json
import os

DB_DIR = os.path.join(os.path.dirname(__file__), "data")
DB_PATH = os.path.join(DB_DIR, "history.db")

def init_db():
    """Initializes the database and creates the schema if it doesn't exist."""
    if not os.path.exists(DB_DIR):
        os.makedirs(DB_DIR)
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            filename TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            features TEXT NOT NULL,
            report TEXT NOT NULL,
            original_img TEXT NOT NULL,
            processed_img TEXT NOT NULL,
            lines_img TEXT NOT NULL,
            words_img TEXT NOT NULL,
            letters_img TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()
    print(f"Database initialized at: {DB_PATH}")

def save_analysis(analysis_id, name, filename, timestamp, features, report, 
                  original_img, processed_img, lines_img, words_img, letters_img):
    """Saves a new analysis entry to the database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO analyses (
            id, name, filename, timestamp, features, report,
            original_img, processed_img, lines_img, words_img, letters_img
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        analysis_id,
        name,
        filename,
        timestamp,
        json.dumps(features),
        json.dumps(report),
        original_img,
        processed_img,
        lines_img,
        words_img,
        letters_img
    ))
    
    conn.commit()
    conn.close()

def get_history():
    """Retrieves a list of summary records for sidebar navigation (newest first)."""
    if not os.path.exists(DB_PATH):
        return []
        
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, name, filename, timestamp 
        FROM analyses 
        ORDER BY datetime(timestamp) DESC
    """)
    
    rows = cursor.fetchall()
    conn.close()
    
    history_list = []
    for row in rows:
        history_list.append({
            "id": row["id"],
            "name": row["name"],
            "filename": row["filename"],
            "timestamp": row["timestamp"]
        })
        
    return history_list

def get_analysis(analysis_id):
    """Retrieves the full record of a single analysis by its ID."""
    if not os.path.exists(DB_PATH):
        return None
        
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM analyses WHERE id = ?", (analysis_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
        
    return {
        "id": row["id"],
        "name": row["name"],
        "filename": row["filename"],
        "timestamp": row["timestamp"],
        "features": json.loads(row["features"]),
        "report": json.loads(row["report"]),
        "visualizations": {
            "original": row["original_img"],
            "processed": row["processed_img"],
            "lines_detected": row["lines_img"],
            "words_detected": row["words_img"],
            "letters_detected": row["letters_img"]
        }
    }

def delete_analysis(analysis_id):
    """
    Deletes an analysis entry from the database.
    Returns list of paths of associated images so they can be deleted from disk.
    """
    if not os.path.exists(DB_PATH):
        return []
        
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get image paths first to delete files later
    cursor.execute("""
        SELECT original_img, processed_img, lines_img, words_img, letters_img 
        FROM analyses WHERE id = ?
    """, (analysis_id,))
    row = cursor.fetchone()
    
    image_paths = []
    if row:
        image_paths = [
            row["original_img"],
            row["processed_img"],
            row["lines_img"],
            row["words_img"],
            row["letters_img"]
        ]
        
    # Delete from DB
    cursor.execute("DELETE FROM analyses WHERE id = ?", (analysis_id,))
    conn.commit()
    conn.close()
    
    return image_paths

# Initialize DB on import
init_db()
