from fastapi import FastAPI

app = FastAPI()
from youtube_search import YoutubeSearch


@app.get("/")
async def search(q: str):
    results = YoutubeSearch(q, max_results=1).to_dict()
    if len(results) == 0:
        return ""
    return results[0]["url_suffix"][9:]
