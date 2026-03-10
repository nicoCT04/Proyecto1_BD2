from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import users
from app.routes import restaurant
from app.routes import orders
from app.routes import menu_items
from app.routes import admin
from app.routes import reviews
from app.routes import visits
from app.routes import analytics
from app.routes import inspection
from app.routes import files

app = FastAPI(
   title="Plataforma Analítica para Evaluación de Inversión Gastronómica",
   description="Backend desarrollado con FastAPI y MongoDB Atlas.",
   docs_url="/swagger",
   redoc_url="/documentation",
   version="1.0.0"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# http://127.0.0.1:8000/swagger

# Incluir routers con prefijo /api para coincidir con el frontend
app.include_router(users.router, prefix="/api")
app.include_router(restaurant.router, prefix="/api")
app.include_router(menu_items.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")
app.include_router(visits.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(inspection.router, prefix="/api")
app.include_router(files.router, prefix="/api")

@app.get("/")
def root():
   return {"message": "API funcionando"}