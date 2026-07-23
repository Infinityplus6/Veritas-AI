---
name: huggingface-hub pip package blocked
description: The huggingface-hub Python package cannot be installed here; how to get HF Hub files anyway.
---

The `huggingface-hub` / `huggingface_hub` pip package resolves to "no versions" in this environment (package firewall) — every version fails, batching it also fails the whole install.

**Why:** Observed July 2026 while setting up the Veritas AI model service; `uv add huggingface-hub` (any version) reports "no versions of huggingface-hub".

**How to apply:** Skip the package. Download Hub files directly via HTTPS: `curl -L https://huggingface.co/<repo>/resolve/main/<file>` and load from the local path. Clear any `model_config.json` hub fields so `model_setup.py` uses the local copy.
