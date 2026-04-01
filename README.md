# Fleet Demo

A demo fleet management application with a **Python API backend**, **HTML/CSS dashboard**, and **JavaScript frontend logic**.

## Components

- **Backend** (`api/`) — Python Flask REST API for fleet data (vehicles, status, locations)
- **Frontend** (`frontend/`) — HTML/CSS/JS dashboard with live map and vehicle management

## Quick Start

### Backend

```bash
cd api
pip install -r requirements.txt
python app.py
```

API runs at `http://localhost:5000`

### Frontend

Open `frontend/index.html` in a browser, or serve it:

```bash
cd frontend
python -m http.server 8080
```

Then visit `http://localhost:8080`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vehicles` | List all vehicles |
| GET | `/api/vehicles/:id` | Get vehicle details |
| POST | `/api/vehicles` | Add a vehicle |
| PUT | `/api/vehicles/:id` | Update vehicle |
| DELETE | `/api/vehicles/:id` | Remove vehicle |
| GET | `/api/stats` | Fleet statistics |

## License

MIT
