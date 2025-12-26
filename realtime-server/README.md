# Realtime Server (Reference)

This folder is a **reference implementation** imported from DeepSeek shares.

- It is **not wired into** the FastAPI backend in `app/`.
- It can be deployed as a **separate** low-latency realtime service (Socket.IO) using Redis.

See:
- `docs/realtime-latency-and-game-server.md`
- `docs/socketio-handlers-and-client-prediction.md`

## Notes

- The original share content assumes a Node.js Socket.IO server (`server/index.js`) and a web client prediction engine.
- If you want this repo to run it end-to-end, we can add a `package.json`, implement the referenced modules, and document how to run it on Replit alongside the FastAPI API.
