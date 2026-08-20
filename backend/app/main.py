from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import close_driver, init_driver
from app.routers import health, ingredients, pantry, recipes


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_driver()
    yield
    close_driver()


app = FastAPI(title="Substitute API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(recipes.router)
app.include_router(ingredients.router)
app.include_router(pantry.router)
