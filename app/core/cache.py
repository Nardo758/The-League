import copy
import functools
import hashlib
import json
from typing import Any, Callable

from cachetools import TTLCache

list_cache = TTLCache(maxsize=1000, ttl=60)
entity_cache = TTLCache(maxsize=5000, ttl=120)


def cache_key(*args, **kwargs) -> str:
    key_data = {"args": args, "kwargs": kwargs}
    return hashlib.md5(json.dumps(key_data, default=str, sort_keys=True).encode()).hexdigest()


def get_cached_list(cache_id: str) -> dict | None:
    if cache_id in list_cache:
        return copy.deepcopy(list_cache[cache_id])
    return None


def set_cached_list(cache_id: str, result: dict) -> None:
    list_cache[cache_id] = copy.deepcopy(result)


def invalidate_list_cache(prefix: str) -> None:
    keys_to_delete = [k for k in list_cache.keys() if k.startswith(prefix)]
    for k in keys_to_delete:
        del list_cache[k]


def invalidate_entity_cache(prefix: str, entity_id: int | None = None) -> None:
    if entity_id:
        key = f"{prefix}:{entity_id}"
        if key in entity_cache:
            del entity_cache[key]
    else:
        keys_to_delete = [k for k in entity_cache.keys() if k.startswith(prefix)]
        for k in keys_to_delete:
            del entity_cache[k]


def cached_list(prefix: str):
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            key = f"{prefix}:{cache_key(*args[1:], **kwargs)}"
            if key in list_cache:
                return list_cache[key]
            result = func(*args, **kwargs)
            list_cache[key] = result
            return result
        return wrapper
    return decorator


def cached_entity(prefix: str):
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            entity_id = kwargs.get("id") or (args[1] if len(args) > 1 else None)
            key = f"{prefix}:{entity_id}"
            if key in entity_cache:
                return entity_cache[key]
            result = func(*args, **kwargs)
            if result:
                entity_cache[key] = result
            return result
        return wrapper
    return decorator
