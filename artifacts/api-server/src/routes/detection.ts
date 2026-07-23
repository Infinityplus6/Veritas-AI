import fs from "node:fs";
import path from "node:path";
import { Router, type IRouter } from "express";
import {
  GetModelStatusResponse,
  ListSamplesResponse,
  PredictImageBody,
  PredictImageResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const MODEL_SERVICE_URL =
  process.env["MODEL_SERVICE_URL"] ?? "http://127.0.0.1:8090";

function findSamplesDir(): string {
  let dir = process.cwd();
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, "model_service", "sample_images");
    if (fs.existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }
  return path.resolve(process.cwd(), "model_service/sample_images");
}

const SAMPLES_DIR = findSamplesDir();

function listSampleFiles(): { id: string; label: string; file: string }[] {
  if (!fs.existsSync(SAMPLES_DIR)) return [];
  return fs
    .readdirSync(SAMPLES_DIR)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .sort()
    .map((file) => {
      const id = path.parse(file).name;
      const label = id.startsWith("AI-Generated") ? "AI-Generated" : "Real";
      return { id, label, file };
    });
}

router.get("/model/status", async (req, res) => {
  try {
    const r = await fetch(`${MODEL_SERVICE_URL}/model-api/status`);
    const json = await r.json();
    res.json(GetModelStatusResponse.parse(json));
  } catch (err) {
    req.log.warn({ err }, "model service unreachable");
    res.json(
      GetModelStatusResponse.parse({
        ready: false,
        message: "Model service is starting",
      }),
    );
  }
});

router.get("/samples", (_req, res) => {
  const samples = listSampleFiles().map(({ id, label }) => ({
    id,
    label,
    url: `/api/samples/${id}/image`,
  }));
  res.json(ListSamplesResponse.parse(samples));
});

router.get("/samples/:id/image", (req, res) => {
  const id = req.params.id;
  const match = listSampleFiles().find((s) => s.id === id);
  if (!match) {
    res.status(404).json({ error: "Sample not found" });
    return;
  }
  res.sendFile(path.join(SAMPLES_DIR, match.file));
});

router.post("/predict", async (req, res) => {
  const parsed = PredictImageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "imageBase64 is required" });
    return;
  }
  try {
    const r = await fetch(`${MODEL_SERVICE_URL}/model-api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    const json = await r.json();
    if (!r.ok) {
      res.status(r.status).json(json);
      return;
    }
    res.json(PredictImageResponse.parse(json));
  } catch (err) {
    req.log.error({ err }, "predict failed");
    res.status(503).json({ error: "Model service unavailable" });
  }
});

export default router;
