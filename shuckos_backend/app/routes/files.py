from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from app.database import db
from bson import ObjectId
import gridfs
import io

router = APIRouter(prefix="/files", tags=["Files"])

fs = gridfs.GridFS(db)


@router.get("/")
def list_files():
    """
    Lista todos los archivos almacenados en GridFS.
    """
    files = []
    for grid_out in fs.find():
        files.append({
            "_id": str(grid_out._id),
            "filename": grid_out.filename,
            "contentType": grid_out.content_type,
            "length": grid_out.length,
            "uploadDate": grid_out.upload_date.isoformat() if grid_out.upload_date else None
        })
    
    return {
        "message": "Archivos en GridFS",
        "total": len(files),
        "files": files
    }


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Sube un archivo a GridFS.
    Diseñado especialmente para imágenes de menu items.
    """
    content = await file.read()

    # Validar tipo de archivo (opcional)
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Tipo de archivo no permitido. Permitidos: {', '.join(allowed_types)}"
        )

    file_id = fs.put(
        content,
        filename=file.filename,
        contentType=file.content_type,
        metadata={
            "uploadedBy": "menu_system",
            "purpose": "menu_item_image",
            "originalSize": len(content)
        }
    )

    return {
        "fileId": str(file_id),
        "filename": file.filename,
        "contentType": file.content_type,
        "size": len(content),
        "downloadUrl": f"/api/files/download/{str(file_id)}",
        "message": "Archivo subido exitosamente. Usa 'fileId' para asociarlo con un menu item."
    }

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