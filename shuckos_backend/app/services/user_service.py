from app.database import db
from bson import ObjectId

def create_user(user_data: dict):
   result = db.users.insert_one(user_data)
   return str(result.inserted_id)

def get_all_users():
   users = list(db.users.find())
   for user in users:
      user["_id"] = str(user["_id"])
   return users