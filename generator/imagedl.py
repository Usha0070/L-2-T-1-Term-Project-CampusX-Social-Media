import requests
import os
from dotenv import load_dotenv

load_dotenv()
headers = {
    'Authorization': os.getenv('API_KEY')
}

query = 'faces'
per_page = 25
pages = 4
index = 1

output_dir = 'photos'
os.makedirs(output_dir, exist_ok=True)


for page in range(1, pages + 1):
    url = f"https://api.pexels.com/v1/search?query=face&page={page}&per_page={per_page}&orientation=portrait"
    response = requests.get(url, headers=headers)
    data = response.json()

    for i, photo in enumerate(data['photos']):
        img_url = photo['src']['medium']
        img_data = requests.get(img_url).content
        with open(f'{output_dir}/profile-{index}.jpg', 'wb') as f:
            f.write(img_data)
        print(f'Downloaded: img_{page}_{i+1}.jpg')
        index += 1
