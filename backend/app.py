from __future__ import annotations

import os
import sqlite3
from pathlib import Path
from typing import Any

from flask import Flask, jsonify, request, send_from_directory
from werkzeug.exceptions import RequestEntityTooLarge
from werkzeug.utils import secure_filename

ROOT = Path(__file__).resolve().parent.parent
INSTANCE = Path(__file__).resolve().parent / "instance"
DB_PATH = INSTANCE / "cropiq.sqlite3"
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_CROPS = {"Tomato", "Potato", "Other"}

app = Flask(__name__, static_folder=None)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

WEATHER = {
    "Guntur, Andhra Pradesh": {"temperature_c": 28, "condition": "Partly cloudy", "humidity_percent": 64, "wind_kmh": 12, "rain_chance_percent": 20},
    "Warangal, Telangana": {"temperature_c": 27, "condition": "Cloudy", "humidity_percent": 68, "wind_kmh": 10, "rain_chance_percent": 25},
    "Nashik, Maharashtra": {"temperature_c": 26, "condition": "Clear", "humidity_percent": 52, "wind_kmh": 9, "rain_chance_percent": 10},
    "Coimbatore, Tamil Nadu": {"temperature_c": 29, "condition": "Partly cloudy", "humidity_percent": 59, "wind_kmh": 11, "rain_chance_percent": 15},
}

RECOMMENDATIONS = [
    {"id": "leaf-check", "category": "Crop care", "title": "Check leaves weekly", "body": "Look at both sides of leaves and note changes early. A consistent observation routine can help you spot issues sooner."},
    {"id": "water-near-soil", "category": "Water", "title": "Water near the soil", "body": "When appropriate for your crop and soil, watering near the root zone can reduce evaporation. Check soil moisture before watering."},
    {"id": "organic-matter", "category": "Soil", "title": "Build soil organic matter", "body": "Compost and other locally suitable organic matter can support soil structure. Use well-decomposed material and local guidance."},
    {"id": "field-notes", "category": "Crop care", "title": "Keep simple field notes", "body": "Record planting dates, irrigation, and visible changes. Notes make it easier to compare seasons and discuss issues with an advisor."},
    {"id": "irrigation-conditions", "category": "Water", "title": "Match irrigation to conditions", "body": "Consider crop stage, soil type, and recent rain before irrigating. Avoid relying on a generic schedule alone."},
    {"id": "soil-test", "category": "Soil", "title": "Test before adjusting nutrients", "body": "A soil test can help guide nutrient decisions. Ask a local extension service or soil lab about sampling for your region."},
]


def connect_db() -> sqlite3.Connection:
    INSTANCE.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with connect_db() as db:
        db.execute("""CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            name TEXT NOT NULL,
            location TEXT NOT NULL,
            language TEXT NOT NULL
        )""")
        db.execute("""INSERT OR IGNORE INTO settings (id, name, location, language)
            VALUES (1, 'Ravi Kumar', 'Guntur, Andhra Pradesh', 'English')""")


def error(message: str, code: str, status: int):
    return jsonify({"error": {"code": code, "message": message}}), status


@app.errorhandler(RequestEntityTooLarge)
def too_large(_exc):
    return error("Image must be 10 MB or smaller.", "file_too_large", 413)


@app.get("/")
def index():
    return send_from_directory(ROOT, "index.html")


@app.get("/<path:filename>")
def frontend_file(filename: str):
    if filename not in {"styles.css", "script.js", "backend-client.js"}:
        return error("File not found.", "not_found", 404)
    return send_from_directory(ROOT, filename)


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "service": "CropIQ API", "disease_model_configured": False, "weather_provider_configured": False, "chat_provider_configured": False})


@app.get("/api/weather")
def weather():
    location = request.args.get("location", "Guntur, Andhra Pradesh")
    values = WEATHER.get(location)
    if values is None:
        return error("Choose one of the supported sample locations.", "unknown_location", 400)
    return jsonify({"location": location, "is_sample": True, "source": "demo", "current": values,
                    "forecast": [
                        {"day": "Today", "condition": "Partly cloudy", "high_c": 29, "low_c": 22},
                        {"day": "Tomorrow", "condition": "Cloudy", "high_c": 28, "low_c": 21},
                        {"day": "Wednesday", "condition": "Light showers", "high_c": 27, "low_c": 21},
                    ]})


@app.get("/api/recommendations")
def recommendations():
    category = request.args.get("category", "All")
    if category not in {"All", "Crop care", "Soil", "Water"}:
        return error("Unknown recommendation category.", "invalid_category", 400)
    items = RECOMMENDATIONS if category == "All" else [item for item in RECOMMENDATIONS if item["category"] == category]
    return jsonify({"items": items, "is_personalized": False, "source": "general_demo_content"})


@app.route("/api/settings", methods=["GET", "PUT", "DELETE"])
def settings():
    init_db()
    if request.method == "GET":
        with connect_db() as db:
            row = db.execute("SELECT name, location, language FROM settings WHERE id = 1").fetchone()
        return jsonify(dict(row))

    if request.method == "DELETE":
        with connect_db() as db:
            db.execute("UPDATE settings SET name = ?, location = ?, language = ? WHERE id = 1",
                       ("Ravi Kumar", "Guntur, Andhra Pradesh", "English"))
        return jsonify({"name": "Ravi Kumar", "location": "Guntur, Andhra Pradesh", "language": "English"})

    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return error("Send settings as a JSON object.", "invalid_json", 400)
    name = str(payload.get("name", "")).strip()[:80]
    location = payload.get("location")
    language = payload.get("language")
    if not name:
        return error("Name is required.", "invalid_name", 400)
    if location not in WEATHER:
        return error("Choose a supported location.", "invalid_location", 400)
    if language not in {"English", "తెలుగు"}:
        return error("Choose English or Telugu.", "invalid_language", 400)
    with connect_db() as db:
        db.execute("UPDATE settings SET name = ?, location = ?, language = ? WHERE id = 1", (name, location, language))
    return jsonify({"name": name, "location": location, "language": language})


@app.post("/api/chat")
def chat():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return error("Send a JSON object with a message.", "invalid_json", 400)
    message = str(payload.get("message", "")).strip()
    language = payload.get("language", "English")
    if not message:
        return error("Enter a question first.", "empty_message", 400)
    if len(message) > 1000:
        return error("Question must be 1,000 characters or fewer.", "message_too_long", 400)
    if language not in {"English", "తెలుగు"}:
        return error("Choose English or Telugu.", "invalid_language", 400)

    lower = message.lower()
    if any(word in lower for word in ("water", "irrigat", "watering")):
        answer = "This demo cannot tailor an irrigation schedule. Check soil moisture, crop stage, recent rainfall, and local advice before irrigating."
    elif any(word in lower for word in ("soil", "compost", "nutrient", "fertilizer")):
        answer = "This demo cannot assess your soil. A soil test and local agricultural extension advice can help guide nutrient and soil amendments."
    elif any(word in lower for word in ("disease", "pest", "spots", "leaf")):
        answer = "This demo cannot diagnose crop problems. Note which plants are affected and consult a local agricultural extension service before treatment."
    else:
        answer = "This is a local demo response, not AI-generated advice. Share the crop and growing stage with a local agricultural extension service for guidance suited to your farm."

    return jsonify({"reply": answer, "language": language, "source": "local_demo", "is_ai_generated": False})


@app.post("/api/disease/analyze")
def analyze_disease():
    upload = request.files.get("image")
    crop = request.form.get("crop", "").strip()
    if upload is None or not upload.filename:
        return error("Select a crop image first.", "image_required", 400)
    if crop not in ALLOWED_CROPS:
        return error("Choose Tomato, Potato, or Other.", "invalid_crop", 400)
    if upload.mimetype not in ALLOWED_IMAGE_TYPES:
        return error("Choose a JPG, PNG, or WebP image.", "unsupported_image", 415)

    filename = secure_filename(upload.filename)
    image_data = upload.read(app.config["MAX_CONTENT_LENGTH"] + 1)
    if not image_data:
        return error("The selected image is empty.", "empty_image", 400)
    if len(image_data) > app.config["MAX_CONTENT_LENGTH"]:
        return error("Image must be 10 MB or smaller.", "file_too_large", 413)

    # Deliberately do not label a placeholder as a diagnosis. Connect an actual
    # model here before returning disease classes or confidence values.
    return jsonify({"error": {"code": "model_not_configured",
                               "message": "Image received, but crop disease analysis is not configured yet. No diagnosis was made.",
                               "crop": crop,
                               "filename": filename}}), 503


@app.errorhandler(404)
def not_found(_exc):
    return error("Route not found.", "not_found", 404)


if __name__ == "__main__":
    init_db()
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", "5000")), debug=False)
