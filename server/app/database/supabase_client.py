"""
Supabase Python client — used ONLY for Storage (resume file uploads).
All table reads/writes go through SQLAlchemy (session.py), not this client.

NOTE: Supabase recently changed their API key format from JWT (eyJ...)
to the new sb_publishable_* / sb_secret_* format. The supabase-py
library v2.5.1 may not yet fully support the new key format for all
operations. Storage uploads use the service role key directly via HTTP
if the client fails to initialize.
"""
from app.config import settings

supabase_client = None

if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
    try:
        from supabase import create_client, Client
        supabase_client: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
        print("[OK] Supabase storage client initialized.")
    except Exception as e:
        print(f"[WARN] Supabase client init failed: {e}. File uploads will use local disk fallback.")
else:
    print("[INFO] Supabase credentials not set. Resume file uploads will use local disk.")
