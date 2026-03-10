from pymongo import MongoClient, WriteConcern, ReadPreference
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "shukosDB")

# Configuración optimizada para Consistencia y Escalabilidad
client = MongoClient(
    MONGO_URI,
    # Pool de conexiones para manejar múltiples hilos de FastAPI
    maxPoolSize=50,
    minPoolSize=10,
    # Tiempo de espera para evitar bloqueos infinitos
    serverSelectionTimeoutMS=5000,
    # Consistencia mayoritaria por defecto para seguridad de datos
    retryWrites=True,
    writeConcern=WriteConcern(w="majority")
)

db = client[DATABASE_NAME]

try:
    # Verificar conexión
    client.admin.command("ping")
    print(f"Conectado correctamente a MongoDB: {DATABASE_NAME}")
except Exception as e:
    print("Error de conexión:", e)