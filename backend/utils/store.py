"""Simple in-memory store for training results (replace with DB in production)"""
from typing import Dict, List, Optional

_results_store: Dict[str, dict] = {}
_results_order: List[str] = []  

def save_result(model_id: str, result: dict):
    _results_store[model_id] = result
    if model_id not in _results_order:
        _results_order.append(model_id)

def get_result(model_id: str) -> Optional[dict]:
    return _results_store.get(model_id)

def get_all_results() -> List[dict]:
    return [_results_store[mid] for mid in reversed(_results_order) if mid in _results_store]

def delete_result(model_id: str) -> bool:
    if model_id in _results_store:
        del _results_store[model_id]
        _results_order.remove(model_id)
        return True
    return False
