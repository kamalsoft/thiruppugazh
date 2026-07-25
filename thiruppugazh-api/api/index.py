import os
import sys

ROOT = os.path.dirname(os.path.dirname(__file__))
SUBAPP = os.path.join(ROOT, "thiruppugazh-api")
if SUBAPP not in sys.path:
    sys.path.insert(0, SUBAPP)

from app.main import app  # noqa: E402