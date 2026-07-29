import asyncio
import json
import os
import sys
import time
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

sys.path.insert(0, str(Path(__file__).parent))
from simulator import Simulator


sim = Simulator()

BACKEND_DIR = Path(__file__).parent
FRONTEND_DIST = BACKEND_DIR.parent / "frontend" / "dist"


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(title="PulseOps API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok", "uptime": time.time() - sim.t0}


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    init = sim.get_init_state()
    await ws.send_json(init)

    async def tick_loop():
        while True:
            await asyncio.sleep(2)
            messages = sim.tick()
            for msg in messages:
                try:
                    await ws.send_json(msg)
                except Exception:
                    return

    tick_task = asyncio.create_task(tick_loop())

    try:
        while True:
            data = await ws.receive_text()
            msg = json.loads(data)
            if msg.get("type") == "ping":
                await ws.send_json({"type": "pong"})
    except WebSocketDisconnect:
        pass
    finally:
        tick_task.cancel()
        try:
            await tick_task
        except asyncio.CancelledError:
            pass


if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
