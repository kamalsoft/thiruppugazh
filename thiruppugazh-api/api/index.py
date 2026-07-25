import traceback

try:
    from app.main import app
except Exception:
    print("=== FastAPI import failed ===")
    print(traceback.format_exc())
    raise