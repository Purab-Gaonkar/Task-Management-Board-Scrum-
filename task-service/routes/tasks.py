from flask import Blueprint, request, jsonify
from datetime import datetime
from bson import ObjectId
from models.task import format_task, validate_task_payload, VALID_STATUSES

tasks_bp = Blueprint("tasks", __name__)

def init_tasks_routes(db):
    tasks_collection = db["tasks"]

    @tasks_bp.route("/health", methods=["GET"])
    def health_check():
        try:
            # Check DB ping
            db.command("ping")
            return jsonify({
                "service": "task-service",
                "status": "HEALTHY",
                "database": "CONNECTED",
                "timestamp": datetime.utcnow().isoformat()
            }), 200
        except Exception as e:
            return jsonify({
                "service": "task-service",
                "status": "UNHEALTHY",
                "database_error": str(e)
            }), 500

    @tasks_bp.route("/tasks", methods=["GET"])
    def get_tasks():
        try:
            status_filter = request.args.get("status")
            assignee_filter = request.args.get("assignee")
            
            query = {}
            if status_filter:
                query["status"] = status_filter
            if assignee_filter:
                query["assignee"] = assignee_filter
                
            cursor = tasks_collection.find(query).sort("created_at", -1)
            tasks = [format_task(doc) for doc in cursor]
            return jsonify({"success": True, "count": len(tasks), "data": tasks}), 200
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    @tasks_bp.route("/tasks/<task_id>", methods=["GET"])
    def get_task(task_id):
        try:
            if not ObjectId.is_valid(task_id):
                return jsonify({"success": False, "error": "Invalid task ID format"}), 400
                
            task = tasks_collection.find_one({"_id": ObjectId(task_id)})
            if not task:
                return jsonify({"success": False, "error": "Task not found"}), 404
                
            return jsonify({"success": True, "data": format_task(task)}), 200
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    @tasks_bp.route("/tasks", methods=["POST"])
    def create_task():
        try:
            data = request.get_json() or {}
            errors = validate_task_payload(data)
            if errors:
                return jsonify({"success": False, "errors": errors}), 400
                
            now = datetime.utcnow()
            new_task = {
                "title": data.get("title").strip(),
                "description": data.get("description", "").strip(),
                "status": data.get("status", "TODO"),
                "priority": data.get("priority", "MEDIUM"),
                "assignee": data.get("assignee", "Unassigned"),
                "assignee_id": data.get("assignee_id", None),
                "created_at": now,
                "updated_at": now
            }
            
            result = tasks_collection.insert_one(new_task)
            created_task = tasks_collection.find_one({"_id": result.inserted_id})
            return jsonify({"success": True, "data": format_task(created_task)}), 201
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    @tasks_bp.route("/tasks/<task_id>", methods=["PUT", "PATCH"])
    def update_task(task_id):
        try:
            if not ObjectId.is_valid(task_id):
                return jsonify({"success": False, "error": "Invalid task ID format"}), 400
                
            data = request.get_json() or {}
            errors = validate_task_payload(data, is_update=True)
            if errors:
                return jsonify({"success": False, "errors": errors}), 400
                
            update_fields = {}
            for field in ["title", "description", "status", "priority", "assignee", "assignee_id"]:
                if field in data:
                    update_fields[field] = data[field]
                    
            if not update_fields:
                return jsonify({"success": False, "error": "No update fields provided"}), 400
                
            update_fields["updated_at"] = datetime.utcnow()
            
            result = tasks_collection.find_one_and_update(
                {"_id": ObjectId(task_id)},
                {"$set": update_fields},
                return_document=True
            )
            
            if not result:
                return jsonify({"success": False, "error": "Task not found"}), 404
                
            return jsonify({"success": True, "data": format_task(result)}), 200
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    @tasks_bp.route("/tasks/<task_id>", methods=["DELETE"])
    def delete_task(task_id):
        try:
            if not ObjectId.is_valid(task_id):
                return jsonify({"success": False, "error": "Invalid task ID format"}), 400
                
            result = tasks_collection.delete_one({"_id": ObjectId(task_id)})
            if result.deleted_count == 0:
                return jsonify({"success": False, "error": "Task not found"}), 404
                
            return jsonify({"success": True, "message": "Task deleted successfully"}), 200
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    return tasks_bp
