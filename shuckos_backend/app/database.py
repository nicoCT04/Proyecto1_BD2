from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client.get_default_database()

try:
    client.admin.command("ping")
    print("Conectado correctamente a MongoDB")
except Exception as e:
    print("Error de conexión:", e)