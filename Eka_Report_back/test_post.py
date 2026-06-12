import requests

url = "http://127.0.0.1:8000/api/prod-report-type2"
payload = {
    "ReportDate": "2026-06-12",
    "StartDate": "2026-04-01",
    "LastDate": "2027-03-31",
    "Shift": "A"
}

try:
    print(f"Sending POST request to {url} with payload {payload}...")
    response = requests.post(url, json=payload)
    print("Status Code:", response.status_code)
    print("Response JSON:", response.json())
except Exception as e:
    print("Error:", e)
