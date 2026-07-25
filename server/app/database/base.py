from app.database.session import Base
# Import all models here so Alembic can discover them
from app.database.models import User, Profile, Resume, Opportunity, AICallLog
