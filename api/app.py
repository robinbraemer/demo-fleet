"""Fleet Management API — Python/Flask backend."""

import uuid
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# In-memory vehicle store seeded with demo data
vehicles = {
    "v1": {
        "id": "v1",
        "name": "Truck Alpha",
        "type": "truck",
        "status": "active",
        "lat": 37.7749,
        "lng": -122.4194,
        "speed": 45,
        "fuel": 72,
        "driver": "Alice Johnson",
    },
    "v2": {
        "id": "v2",
        "name": "Van Beta",
        "type": "van",
        "status": "idle",
        "lat": 37.7849,
        "lng": -122.4094,
        "speed": 0,
        "fuel": 91,
        "driver": "Bob Smith",
    },
    "v3": {
        "id": "v3",
        "name": "Sedan Gamma",
        "type": "sedan",
        "status": "maintenance",
        "lat": 37.7649,
        "lng": -122.4294,
        "speed": 0,
        "fuel": 34,
        "driver": "Carol Lee",
    },
    "v4": {
        "id": "v4",
        "name": "Truck Delta",
        "type": "truck",
        "status": "active",
        "lat": 37.7949,
        "lng": -122.3994,
        "speed": 62,
        "fuel": 55,
        "driver": "Dan Park",
    },
    "v5": {
        "id": "v5",
        "name": "Van Epsilon",
        "type": "van",
        "status": "active",
        "lat": 37.7549,
        "lng": -122.4394,
        "speed": 30,
        "fuel": 83,
        "driver": "Eve Torres",
    },
}


@app.route("/api/vehicles", methods=["GET"])
def list_vehicles():
    status_filter = request.args.get("status")
    type_filter = request.args.get("type")
    result = list(vehicles.values())
    if status_filter:
        result = [v for v in result if v["status"] == status_filter]
    if type_filter:
        result = [v for v in result if v["type"] == type_filter]
    return jsonify(result)


@app.route("/api/vehicles/<vehicle_id>", methods=["GET"])
def get_vehicle(vehicle_id):
    vehicle = vehicles.get(vehicle_id)
    if not vehicle:
        return jsonify({"error": "Vehicle not found"}), 404
    return jsonify(vehicle)


@app.route("/api/vehicles", methods=["POST"])
def add_vehicle():
    data = request.get_json()
    vid = f"v{uuid.uuid4().hex[:6]}"
    vehicle = {
        "id": vid,
        "name": data.get("name", "Unnamed"),
        "type": data.get("type", "sedan"),
        "status": data.get("status", "idle"),
        "lat": data.get("lat", 37.77),
        "lng": data.get("lng", -122.42),
        "speed": data.get("speed", 0),
        "fuel": data.get("fuel", 100),
        "driver": data.get("driver", "Unassigned"),
    }
    vehicles[vid] = vehicle
    return jsonify(vehicle), 201


@app.route("/api/vehicles/<vehicle_id>", methods=["PUT"])
def update_vehicle(vehicle_id):
    if vehicle_id not in vehicles:
        return jsonify({"error": "Vehicle not found"}), 404
    data = request.get_json()
    for key in ("name", "type", "status", "lat", "lng", "speed", "fuel", "driver"):
        if key in data:
            vehicles[vehicle_id][key] = data[key]
    return jsonify(vehicles[vehicle_id])


@app.route("/api/vehicles/<vehicle_id>", methods=["DELETE"])
def delete_vehicle(vehicle_id):
    if vehicle_id not in vehicles:
        return jsonify({"error": "Vehicle not found"}), 404
    del vehicles[vehicle_id]
    return "", 204


@app.route("/api/stats", methods=["GET"])
def stats():
    all_v = list(vehicles.values())
    return jsonify(
        {
            "total": len(all_v),
            "active": sum(1 for v in all_v if v["status"] == "active"),
            "idle": sum(1 for v in all_v if v["status"] == "idle"),
            "maintenance": sum(1 for v in all_v if v["status"] == "maintenance"),
            "avg_fuel": round(sum(v["fuel"] for v in all_v) / max(len(all_v), 1), 1),
        }
    )


if __name__ == "__main__":
    app.run(debug=True, port=5000)
