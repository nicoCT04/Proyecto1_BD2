from fastapi import FastAPI
from app.routes import users
from app.routes import restaurant
from app.routes import orders
from app.routes import menu_items
from app.routes import admin


app = FastAPI(
   title="Plataforma Analítica para Evaluación de Inversión Gastronómica",
   description="Backend desarrollado con FastAPI y MongoDB Atlas.",
   docs_url="/swagger",
   redoc_url="/documentation",
   version="1.0.0"
)

#http://127.0.0.1:8000/swagger

app.include_router(users.router)
app.include_router(restaurant.router)
app.include_router(menu_items.router)
app.include_router(orders.router)
app.include_router(admin.router)

@app.get("/")
def root():
   return {"message": "API funcionando"}