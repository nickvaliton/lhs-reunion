#!/usr/bin/env python3
"""
Reads registrant data from a Google Sheet and writes attendees.json.

Required environment:
  GOOGLE_CREDENTIALS - JSON content of a Google service account key file
  SHEET_ID           - Google Sheets spreadsheet ID (can also be set below)
"""

import json
import os
import sys

from google.oauth2 import service_account
from googleapiclient.discovery import build

SHEET_ID = "1WZRUHam3WhA_D-mXkENvpY9o-AgVQe9E__I7xoEI-bA"
RANGE = "Registrations!A2:B"
OUTPUT_FILE = "attendees.json"


def get_sheets_service():
    creds_json = os.environ.get("GOOGLE_CREDENTIALS")
    if not creds_json:
        sys.exit("Error: GOOGLE_CREDENTIALS environment variable is not set.")
    creds_info = json.loads(creds_json)
    creds = service_account.Credentials.from_service_account_info(
        creds_info,
        scopes=["https://www.googleapis.com/auth/spreadsheets.readonly"],
    )
    return build("sheets", "v4", credentials=creds)


def parse_plus_one(value: str) -> bool:
    """Treat 'yes', 'true', '1', 'y' (case-insensitive) as True."""
    return value.strip().lower() in {"yes", "true", "1", "y"}


def main():
    service = get_sheets_service()
    result = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=SHEET_ID, range=RANGE)
        .execute()
    )
    rows = result.get("values", [])

    attendees = []
    for row in rows:
        name = row[0].strip() if len(row) > 0 else ""
        plus_one_raw = row[1].strip() if len(row) > 1 else ""
        if not name:
            continue
        attendees.append({"name": name, "plusOne": parse_plus_one(plus_one_raw)})

    attendees.sort(key=lambda a: a["name"].lower())

    with open(OUTPUT_FILE, "w") as f:
        json.dump(attendees, f, indent=2)
        f.write("\n")

    print(f"Wrote {len(attendees)} attendees to {OUTPUT_FILE}.")


if __name__ == "__main__":
    main()
