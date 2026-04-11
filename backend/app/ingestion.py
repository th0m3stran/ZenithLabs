from pathlib import Path

def load_documents(folder: str) -> list[dict]:
    docs = []
    path = Path(folder)

    for file_path in path.glob("*.txt"):  #Finds all files ending in .txt
        text = file_path.read_text(encoding="utf-8") #Reads contents of file
        docs.append({
            "source": file_path.name,
            "text": text
        })
    return docs