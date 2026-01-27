import requests
import json
import sys

def run_system_test():
    url = "http://127.0.0.1:8000/api/v1/generate/"
    payload = {
        "intent": "Create a modern personal portfolio website for a photographer named 'Vibe'. It should have a gallery, an about section, and a contact form. Use a dark premium theme.",
        "project_id": "test_verification_002"
    }
    
    print(f"Testing API: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    print("-" * 50)

    try:
        with requests.post(url, json=payload, stream=True) as response:
            if response.status_code != 200:
                print(f"FAILED: Status Code {response.status_code}")
                print(response.text)
                return

            print("Stream started...")
            for line in response.iter_lines():
                if line:
                    decoded_line = line.decode('utf-8')
                    if decoded_line.startswith("data: "):
                        data_str = decoded_line[6:]
                        if data_str == "[DONE]":
                            print("\n[SUCCESS] Generation Complete.")
                            break
                        try:
                            data = json.loads(data_str)
                            step = data.get("step", "unknown")
                            print(f"[STEP] {step}")
                            if step == "error":
                                print(f"[ERROR] {data}")
                        except json.JSONDecodeError:
                            print(f"[RAW] {decoded_line}")
                    else:
                        print(f"[PING] {decoded_line}")
                        
    except Exception as e:
        print(f"[EXCEPTION] {e}")

if __name__ == "__main__":
    run_system_test()
