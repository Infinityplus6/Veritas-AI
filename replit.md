# Veritas AI

A deepfake detection web app: users upload an image (or pick a built-in sample) and a trained CNN reports whether it's Real or AI-Generated with probability bars.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at /api)
- Model Service workflow — `.pythonlibs/bin/python3 model_service/main.py` (port 8090, FastAPI, loads the Keras model)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (`artifacts/veritas-ai`, served at `/`)
- API: Express 5 (`artifacts/api-server`, `/api`) — proxies inference to the Python model service
- Model service: Python 3.12 + FastAPI + TensorFlow CPU (`model_service/`, `/model-api`, internal port 8090)
- API codegen: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)

## Where things live

- `model_service/` — uploaded model bundle: `deepfake_detector.keras` (downloaded locally from HF Hub), `helpers.py` (preprocessing: 128x128 RGB /255, single sigmoid = P(AI-Generated)), `class_names.json`, `sample_images/` (10 real dataset samples), `main.py` (FastAPI wrapper)
- `artifacts/api-server/src/routes/detection.ts` — `/api/predict`, `/api/samples`, `/api/samples/:id/image`, `/api/model/status`
- `artifacts/veritas-ai/src/` — frontend (upload zone, sample grid, verdict display)

## Architecture decisions

- Express is the single `/api` contract (OpenAPI-typed); it forwards predictions to the Python service at `http://127.0.0.1:8090` (override with `MODEL_SERVICE_URL`).
- `huggingface_hub` pip package is blocked by the package firewall, so the model file was downloaded directly via HTTPS and committed locally; `model_config.json` hub fields were cleared.
- Model loads on a background thread; `/api/model/status` reports readiness and the frontend polls it before allowing analysis.
- Deployment: the Model Service has a production run command in `artifacts/api-server/.replit-artifact/artifact.toml`, so publishing launches Express, the Python service, and the static frontend.

## Product

- Upload an image via drag & drop or file picker, or click one of 10 preloaded dataset samples
- Verdict card with label, confidence, and probability bars for Real vs AI-Generated
- Model warm-up screen while the CNN loads

## User preferences

- Minimal, abstract visual style

## Gotchas

- Express JSON body limit is 20mb (base64 image uploads)
- API server dev cwd is `artifacts/api-server`; sample-image paths are resolved by walking up to find `model_service/`
- One sample (`AI-Generated_0.png`) is genuinely misclassified by the model as Real — that's the model, not a bug

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
