#!/usr/bin/env bash
# Start both frontend and backend

echo "🛡️  FraudGuard ML Platform"
echo "=========================="

# Backend
echo "Starting backend..."
cd backend
if [ ! -d "venv" ]; then
  python3 -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
else
  source venv/bin/activate
fi
python main.py &
BACKEND_PID=$!

cd ..

# Frontend
echo "Starting frontend..."
cd frontend
npm install --silent
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Backend:  http://localhost:8000"
echo "✅ Frontend: http://localhost:3000"
echo "✅ API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
