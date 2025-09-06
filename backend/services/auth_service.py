import bcrypt
from Schemas.user_model import users
from utils.jwt_utils import create_token

def register_user(username, email, password):
    if users.find_one({"email": email}):
        return {"error": "Email already exists"}

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    users.insert_one({
        "username": username,
        "email": email,
        "password": hashed
    })
    return {"message": "User registered successfully"}

def login_user(email, password):
    user = users.find_one({"email": email})
    if not user:
        return {"error": "Invalid credentials"}

    if not bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        return {"error": "Invalid credentials"}

    token = create_token({
        "user_id": str(user["_id"]),
        "email": user["email"]
    })
    return {"token": token}
