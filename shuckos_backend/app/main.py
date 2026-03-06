from fastapi import FastAPI
from app.routes import users
from app import database  # 👈 ESTA LÍNEA es clave

app = FastAPI()

app.include_router(users.router)

@app.get("/")
def root():
    return {"message": "API funcionando"}