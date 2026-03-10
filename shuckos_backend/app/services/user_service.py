from app.database import db
from bson import ObjectId
from datetime import datetime

def create_user(user_data: dict):
   user_data["createdAt"] = datetime.utcnow()
   if "password" not in user_data:
       user_data["password"] = "default_pass" # Simple placeholder
   result = db.users.insert_one(user_data)
   return str(result.inserted_id)

def get_all_users():
   users = list(db.users.find())
   for user in users:
      user["_id"] = str(user["_id"])
      if "createdAt" not in user:
          user["createdAt"] = datetime.utcnow()
   return users