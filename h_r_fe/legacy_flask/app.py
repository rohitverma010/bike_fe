"""
StayNRide - Homestay Booking & Bike Rental Website (frontend)

This Flask app renders pages only. All real data — homestays, bikes, users,
bookings — lives in the Django backend (h_r_be) and is fetched client-side
from the browser via the JS/TS API client (static/ts/api.ts -> static/js/api.js),
which talks to http://127.0.0.1:8010/api/.

Run:  pip install -r requirements.txt   then   python app.py
Open: http://127.0.0.1:5176   (the Django backend must also be running, on :8010)
"""

from flask import Flask, render_template, send_from_directory
import logging
import os
import threading
import webbrowser

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
except ImportError:
    pass

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "staynride-super-secret-key-change-me")

# Base URL of the Django API, injected into every page as window.STAYNRIDE_API_BASE
# (see templates/base.html and static/js/api.js). Point this at the deployed
# backend's URL in production via the API_BASE env var.
API_BASE = os.environ.get("API_BASE", "http://127.0.0.1:8010/api")


@app.context_processor
def inject_api_base():
    return {"api_base": API_BASE}


# Quiet down only the per-request access log lines (GET /static/... 200, etc.)
# while keeping the important startup lines (Running on http://..., Restarting...).
class _HideAccessLogLines(logging.Filter):
    def filter(self, record):
        return "HTTP/1.1" not in record.getMessage()


logging.getLogger("werkzeug").addFilter(_HideAccessLogLines())


# ---------------------------------------------------------------------------
# CORE PAGES
# ---------------------------------------------------------------------------

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/homestays")
def homestays():
    return render_template("homestays.html")


@app.route("/homestay/<int:hid>")
def homestay_detail(hid):
    return render_template("homestay_detail.html", hid=hid)


@app.route("/bikes")
def bikes():
    return render_template("bikes.html")


@app.route("/bike/<int:bid>")
def bike_detail(bid):
    return render_template("bike_detail.html", bid=bid)


# ---------------------------------------------------------------------------
# BOOKING FLOW (auth + data handled client-side against the Django API)
# ---------------------------------------------------------------------------

@app.route("/book/homestay/<int:hid>")
def book_homestay(hid):
    return render_template("book_homestay.html", hid=hid)


@app.route("/book/bike/<int:bid>")
def book_bike(bid):
    return render_template("book_bike.html", bid=bid)


@app.route("/confirmation/<int:booking_id>")
def confirmation(booking_id):
    return render_template("confirmation.html", booking_id=booking_id)


@app.route("/my-bookings")
def my_bookings():
    return render_template("my_bookings.html")


# ---------------------------------------------------------------------------
# AUTH (handled client-side against the Django API; these just render the form)
# ---------------------------------------------------------------------------

@app.route("/signup")
def signup():
    return render_template("signup.html")


@app.route("/login")
def login():
    return render_template("login.html")


# ---------------------------------------------------------------------------
# STATIC INFO PAGES
# ---------------------------------------------------------------------------

@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/contact")
def contact():
    return render_template("contact.html")


@app.route("/favicon.ico")
def favicon():
    return send_from_directory(
        os.path.join(app.root_path, "static", "img"),
        "favicon.svg",
        mimetype="image/svg+xml",
    )


@app.errorhandler(404)
def not_found(e):
    return render_template("404.html"), 404


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5176))
    debug = os.environ.get("FLASK_DEBUG", "True") == "True"
    url = f"http://localhost:{port}"
    # Auto-open the browser locally only (skipped in production / on the
    # Werkzeug reloader's child re-exec).
    if debug and os.environ.get("WERKZEUG_RUN_MAIN") != "true":
        threading.Timer(1.2, lambda: webbrowser.open(url)).start()
    # Flask/Werkzeug prints "Running on http://127.0.0.1:5176" itself below —
    # that line is the one to open in your browser.
    app.run(debug=debug, host="0.0.0.0", port=port)
