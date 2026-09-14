"""
Overrides Django's default `runserver` port.
Port 8000 is used by another project on this machine, so StayNRide's
backend defaults to 8010 instead. `python manage.py runserver` now
starts on http://127.0.0.1:8010 unless a port is explicitly given.
"""
from django.contrib.staticfiles.management.commands.runserver import Command as StaticRunserverCommand


class Command(StaticRunserverCommand):
    default_port = "8010"
