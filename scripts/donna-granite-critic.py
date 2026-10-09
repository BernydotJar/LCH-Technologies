#!/usr/bin/env python3
"""Local IBM Granite product/CX critique. No secrets, browser logs, or user data."""
import hashlib
import json
from pathlib import Path
from urllib.request import Request, urlopen

root = Path(__file__).resolve().parents[1]
ui = (root / "src/components/DonnaChat.tsx").read_text(encoding="utf-8")
css = (root / "src/components/donna-experience.css").read_text(encoding="utf-8")
ideas = (root / "src/donna/experience.ts").read_text(encoding="utf-8")
spec = (root / "specs/GH-21/donna-proactive-orb.md").read_text(encoding="utf-8")

chunks = [
    "SPEC:\n" + spec[:1800],
    "IDEAS AND FOLLOW-UPS:\n" + ideas,
    "ORB + LIFECYCLE CODE:\n" + ui[:10400],
    "IDLE CHAT AND INVITATION UI:\n" + ui[-12200:],
    "ORB CSS:\n" + css,
]
prompt = """
You are a separate IBM Granite adversarial PRODUCT/UX and accessibility critic.
Evaluate a bounded enhancement to Donna on LCH's website. You did not author it.
Do not ask to copy Cadre/Claude; do not propose new features or integrations beyond scope.
Check: (1) animated signal orb states and honest status labels,
(2) rotating business prompts: hover/focus/typing/reduced-motion/hidden-tab behavior,
(3) no visual distraction, layout jump or keyboard traps,
(4) facts only from current LCH content, no invented pricing/ROI/meeting,
(5) no automatic lead capture, no submission without consent.
Report only SPECIFIC source-anchored HIGH/MEDIUM or LOW findings:
SEVERITY | FILE/SNIPPET | WHY IT MATTERS | MINIMAL FIX.
Call uncertain concerns unverified; don't invent code behaviors.
Then write an explicit GO / GO WITH FIXES / HOLD recommendation.
Source and spec follow:
""".strip() + "\n\n" + "\n\n".join(chunks)

body = {
    "model": "ibm/granite3.3:2b",
    "prompt": prompt,
    "stream": False,
    "keep_alive": 0,
    "options": {"temperature": 0, "num_predict": 1150, "num_ctx": 8192},
}
request = Request(
    "http://127.0.0.1:11434/api/generate",
    data=json.dumps(body).encode("utf-8"),
    headers={"Content-Type": "application/json"},
    method="POST",
)
with urlopen(request, timeout=140) as response:
    data = json.loads(response.read().decode("utf-8"))
review = (data.get("response") or "").strip()
output = root / "progress/GH-21/granite-product-review.md"
output.parent.mkdir(parents=True, exist_ok=True)
status = "EVIDENCE" if len(review) > 220 and any(word in review.lower() for word in ["go", "hold", "severity", "fix", "risk"]) else "INCONCLUSIVE"
output.write_text(
    "# GH-21 independent local IBM Granite product critique\n\n"
    "Model: ibm/granite3.3:2b (localhost Ollama)\n\n"
    f"Status: {status}; advisory, not an automated release approval.\n\n"
    f"Prompt SHA256: {hashlib.sha256(prompt.encode('utf-8')).hexdigest()}\n\n"
    + (review or "No substantive reviewer response.") + "\n",
    encoding="utf-8",
)
print(json.dumps({
    "model": body["model"],
    "status": status,
    "response_chars": len(review),
    "eval_count": data.get("eval_count"),
    "output_path": str(output),
}))
print(review[:5000])
