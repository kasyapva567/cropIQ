# CropIQ Flask backend

This Flask app serves the standalone frontend and its same-origin JSON API. Start it from this folder:

```sh
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Open `http://127.0.0.1:5000`. The frontend files remain one directory above this README: `index.html`, `styles.css`, `script.js`, and `backend-client.js`.

## API routes

- `GET /api/health` — service status and configured-provider flags.
- `GET /api/weather?location=...` — clearly marked sample weather data.
- `GET /api/recommendations?category=All|Crop%20care|Soil|Water` — general tips.
- `GET`, `PUT`, `DELETE /api/settings` — local single-user settings persisted in SQLite at `instance/cropiq.sqlite3`.
- `POST /api/chat` — deterministic local demo replies; no AI model is used.
- `POST /api/disease/analyze` — accepts an image and crop, validates the upload, then returns `503 model_not_configured`. No diagnosis is made until a trained model is connected.

The development server binds only to `127.0.0.1`. Do not expose this single-user demo server to a public network without adding authentication, per-user settings, and production deployment controls.

