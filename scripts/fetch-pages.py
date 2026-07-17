import urllib.request
import os

pages = [
    "success-stories",
    "faqs",
    "learn",
    "blog",
    "google-ads",
    "youtube-ads",
    "social-ads",
    "landing-page-optimization",
    "publisher-partnerships",
    "creative-studio",
    "privacy-policy"
]

out_dir = "docs/research/advida.com/pages"
os.makedirs(out_dir, exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

for page in pages:
    url = f"https://advida.com/{page}/"
    print(f"Fetching {url}...")
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            out_path = os.path.join(out_dir, f"{page}.html")
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(html)
            print(f"Saved {page}.html")
    except Exception as e:
        print(f"Error fetching {page}: {e}")
