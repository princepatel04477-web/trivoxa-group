import urllib.request
import json
import os

url = "https://advida.com/wp-json/wp/v2/posts?per_page=12&_embed"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        posts = []
        for item in data:
            # extract image URL
            image_url = ""
            if "_embedded" in item and "wp:featuredmedia" in item["_embedded"]:
                media = item["_embedded"]["wp:featuredmedia"]
                if len(media) > 0 and "source_url" in media[0]:
                    image_url = media[0]["source_url"]
            
            # extract categories
            categories = []
            if "_embedded" in item and "wp:term" in item["_embedded"]:
                terms = item["_embedded"]["wp:term"]
                if len(terms) > 0:
                    for term in terms[0]:
                        categories.append(term["name"])
            
            posts.append({
                "id": item["id"],
                "title": item["title"]["rendered"],
                "slug": item["slug"],
                "date": item["date"],
                "excerpt": item["excerpt"]["rendered"],
                "content": item["content"]["rendered"],
                "image": image_url,
                "categories": categories
            })
            
        out_dir = "docs/research/advida.com"
        os.makedirs(out_dir, exist_ok=True)
        with open(os.path.join(out_dir, "posts.json"), "w", encoding="utf-8") as f:
            json.dump(posts, f, indent=2, ensure_ascii=False)
        print(f"Saved {len(posts)} posts to posts.json")
except Exception as e:
    print(f"Error fetching posts: {e}")
