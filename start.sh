#!/bin/bash
cd backend && gunicorn --bind=0.0.0.0:8000 --reuse-port app:app &
cd frontend && npm run start -- -p 5000
