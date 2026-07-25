import json
import os
from sqlalchemy.orm import Session
from app.database.session import SessionLocal, engine
from app.database.base import Base
from app.database.models import Opportunity

def seed_db():
    print("Initializing Database Seeding...")
    # Create all tables in Supabase if they don't exist yet
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # Load mock data
        json_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'mock-data', 'opportunities.json')
        with open(json_path, 'r') as f:
            opportunities_data = json.load(f)

        print(f"Loaded {len(opportunities_data)} opportunities from json.")

        # Optional: Clear existing opportunities to allow clean reruns
        deleted_count = db.query(Opportunity).delete()
        print(f"Cleared {deleted_count} old opportunities.")

        # Insert new opportunities
        for opp_data in opportunities_data:
            opp = Opportunity(
                title=opp_data["title"],
                company=opp_data["company"],
                description=opp_data["description"],
                opportunity_type=opp_data["opportunity_type"],
                url=opp_data["url"],
                location=opp_data["location"],
                skills_required=opp_data["skills_required"]
            )
            db.add(opp)

        db.commit()
        print("Mock opportunities successfully seeded in database!")
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
