import urllib.request
import sys

def verify():
    url = "http://localhost:8000/"
    print(f"Verifying {url}...")
    try:
        response = urllib.request.urlopen(url)
        status = response.getcode()
        html = response.read().decode('utf-8')
        
        print(f"Status Code: {status}")
        if status == 200:
            print("SUCCESS: Homepage resolved correctly!")
            # Check for key content
            if "Project Chronos" in html and "TITAN" in html:
                print("SUCCESS: Found newly added projects Chronos and TITAN in html!")
                sys.exit(0)
            else:
                print("FAILURE: Chronos or TITAN not found in homepage HTML.")
                sys.exit(1)
        else:
            print(f"FAILURE: Got status code {status}")
            sys.exit(1)
    except Exception as e:
        print(f"ERROR: Failed to connect or request. Exception: {e}")
        sys.exit(1)

if __name__ == "__main__":
    verify()
