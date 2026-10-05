# main.py (Root entrypoint for Render and cloud deployments)
import sys
from pathlib import Path

root_dir = Path(__file__).resolve().parent
backend_dir = root_dir / "backend"

if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
if str(root_dir) not in sys.path:
    sys.path.insert(1, str(root_dir))

import backend.main
app = backend.main.app
