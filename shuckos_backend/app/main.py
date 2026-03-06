from fastapi import FastAPI
from app.routes import users
from app import database  # 👈 ESTA LÍNEA es clave

app = FastAPI(
   title="Plataforma Analítica para Evaluación de Inversión Gastronómica",
   description="Backend desarrollado con FastAPI y MongoDB Atlas.",
   docs_url="/swagger",
   redoc_url="/documentation",
   version="1.0.0"
)

#http://127.0.0.1:8000/swagger

app.include_router(users.router)

@app.get("/")
def root():
    return {"message": "API funcionando"}