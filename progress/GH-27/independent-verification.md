# GH-27 | Independent n8n monitor verification

Tests are independent of the live Docker instance and use fixture health probes and fake start scripts, so failure behavior is validated without killing Lina's n8n container. Operational verification uses `supervisorctl` to prove a new program is running alongside the existing site process. A keeper-only restart did not change the website PID and the health endpoints remained healthy.

No credentials were installed and the n8n LCH workflow remains INACTIVE. No messages were sent to Microsoft Outlook. **Quality PASS, delivery NOT VERIFIED.**

The unexpected keeper-parent SIGTERM scenario uncovered a real inherited-lock issue, now covered by a fifth isolated test and second live supervisor recovery check. The corrected monitor restored itself automatically without restarting the existing n8n or LCH web server.
