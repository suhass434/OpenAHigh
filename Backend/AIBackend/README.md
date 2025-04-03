python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

python server.py

Set-ExecutionPolicy RemoteSigned

deactivate

netstat -ano | findstr :5001
taskkill /PID (id) /F

