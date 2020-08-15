from fastapi import FastAPI

app = FastAPI()
from youtube_search import YoutubeSearch
from fastapi.middleware.cors import CORSMiddleware

origins = ["https://open.spotify.com"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/")
async def search(q: str):
    results = YoutubeSearch(q, max_results=1).to_dict()
    if len(results) == 0:
        return ""
    return {"video": results[0]["url_suffix"][9:]}

