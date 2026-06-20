import urllib.request
import sys

def verify_url(url, label):
    print(f"Testing {label} ({url})...")
    try:
        response = urllib.request.urlopen(url)
        status = response.getcode()
        print(f"  -> Status: {status}")
        return status == 200
    except Exception as e:
        print(f"  -> ERROR: {e}")
        return False

def verify_all():
    base = "http://localhost:8000"
    pages = [
        (f"{base}/", "Homepage"),
        (f"{base}/biography", "Biography"),
        (f"{base}/swadesh", "Swadesh AI"),
        (f"{base}/homies", "Homies"),
        (f"{base}/support", "Customer Support"),
        (f"{base}/privacy-policy", "Privacy Policy"),
        (f"{base}/terms-of-use", "Terms of Use"),
        (f"{base}/udyam-certificate", "UDYAM Certificate")
    ]
    
    success = True
    for url, label in pages:
        if not verify_url(url, label):
            success = False
            
    if success:
        print("\nSUCCESS: All clean routes are responding correctly on localhost:8000!")
        sys.exit(0)
    else:
        print("\nFAILURE: One or more routes failed verification.")
        sys.exit(1)

if __name__ == "__main__":
    verify_all()
