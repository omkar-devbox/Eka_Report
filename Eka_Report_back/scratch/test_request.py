import urllib.request
import json

url = "http://127.0.0.1:8000/api/prod-report-type2"
payload = {
    "ReportDate": "2026-06-13",
    "StartDate": "2026-04-01",
    "LastDate": "2027-03-31",
    "Shift": "A",
    "Email": "omkarregetest@gmail.com"
}

req = urllib.request.Request(
    url,
    data=json.dumps(payload).encode('utf-8'),
    headers={'Content-Type': 'application/json'},
    method='POST'
)

try:
    print(f"Sending POST to {url} with email...")
    with urllib.request.urlopen(req) as resp:
        print("Status Code:", resp.status)
        print("Response:", resp.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP Error Status:", e.code)
    print("HTTP Error Response:", e.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
