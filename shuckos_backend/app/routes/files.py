from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from app.database import db
from bson import ObjectId
import gridfs
import io

router = APIRouter(prefix="/files", tags=["Files"])

fs = gridfs.GridFS(db)


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()

    file_id = fs.put(
        content,
        filename=file.filename,
        contentType=file.content_type
    )

    return {"fileId": str(file_id)}

@router.get("/download/{file_id}")
def download_file(file_id: str):
    try:
        grid_out = fs.get(ObjectId(file_id))
    except:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    return StreamingResponse(
        io.BytesIO(grid_out.read()),
        media_type=grid_out.content_type,
        headers={
            "Content-Disposition": f"attachment; filename={grid_out.filename}"
        }
    )

@router.delete("/{file_id}")
def delete_file(file_id: str):
    try:
        fs.delete(ObjectId(file_id))
        return {"message": "Archivo eliminado correctamente"}
    except:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")