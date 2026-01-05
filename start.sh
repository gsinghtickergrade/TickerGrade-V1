#!/bin/bash
cd /home/runner/workspace/backend && gunicorn --bind=0.0.0.0:8000 --reuse-port --workers=2 app:app &
sleep 3
cd /home/runner/workspace/frontend && npm run start -- -p 5000
