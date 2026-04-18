from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client["placementsDB"]

company_collection = db["company_details"]
drive_collection = db["company_records"]
students_collection = db["students_data"]
batch_collection = db["batch_reports"]
branch_collection = db["branch_reports"]
users_collection = db["users"]