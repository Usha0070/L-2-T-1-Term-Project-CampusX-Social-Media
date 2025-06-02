import requests, os
from random import *

output_dir = "C:/Users/adman/Documents/Codes/CampusX/meta/media"

url = "https://picsum.photos/512/850"

def gen_img(ind, url):
    # url = f"https://picsum.photos/512/{choices(heights,weights)[0]}"
    res = requests.get(url)
    img = res.content
    name = f"{output_dir}/group-profile-{ind}.jpg"
    # name = "photo.jpg"
    with open(name, "wb") as f:
        f.write(img)
    return name

print(gen_img(5, "https://picsum.photos/300/300"))