from datetime import datetime
from bson import ObjectId

VALID_STATUSES = ["TODO", "IN_PROGRESS", "DONE"]
VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

def format_task(task):
    """Convert MongoDB BSON task document into JSON-serializable dictionary."""
    if not task:
        return None
    task["id"] = str(task["_id"])
    del task["_id"]
    if isinstance(task.get("created_at"), datetime):
        task["created_at"] = task["created_at"].isoformat()
    if isinstance(task.get("updated_at"), datetime):
        task["updated_at"] = task["updated_at"].isoformat()
    return task

def validate_task_payload(data, is_update=False):
    """Validate task creation/update payload."""
    errors = []
    
    if not is_update and not data.get("title"):
        errors.append("Title is required")
        
    if "status" in data and data["status"] not in VALID_STATUSES:
        errors.append(f"Status must be one of: {', '.join(VALID_STATUSES)}")
        
    if "priority" in data and data["priority"] not in VALID_PRIORITIES:
        errors.append(f"Priority must be one of: {', '.join(VALID_PRIORITIES)}")
        
    return errors
