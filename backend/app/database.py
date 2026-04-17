from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = "mongodb+srv://abhiramaleti18_db_user:abhi18abhi18@cluster0.fuisl8t.mongodb.net/"
client = MongoClient(MONGO_URL)
db = client["placementsDB"]

company_collection = db["company_details"]
drive_collection = db["company_records"]
students_collection = db["students_data"]
batch_collection = db["batch_reports"]
branch_collection = db["branch_reports"]
leaderboard_collection = db["leaderboard"]
users_collection = db["users"]