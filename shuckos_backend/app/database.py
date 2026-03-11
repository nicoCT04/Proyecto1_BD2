from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pymongo import monitoring
from app.mongo_logger import MongoCommandLogger

monitoring.register(MongoCommandLogger())

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "shukosDB")

client = MongoClient(
    MONGO_URI,
    maxPoolSize=50,
    minPoolSize=10,
    serverSelectionTimeoutMS=30000,
    retryWrites=True,
)

db = client[DATABASE_NAME]

async_client = AsyncIOMotorClient(
    MONGO_URI,
    maxPoolSize=50,
    minPoolSize=5,
    serverSelectionTimeoutMS=30000,
    retryWrites=True,
)
async_db = async_client[DATABASE_NAME]

try:
    client.admin.command("ping")
    print(f"Conectado correctamente a MongoDB: {DATABASE_NAME}")
except Exception as e:
    print("Error de conexión:", e)