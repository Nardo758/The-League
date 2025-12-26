import math
from typing import TypeVar, Callable

T = TypeVar('T')

EARTH_RADIUS_MILES = 3959.0


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat / 2) ** 2 + \
        math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return EARTH_RADIUS_MILES * c


def filter_by_distance(
    items: list[T],
    user_lat: float,
    user_lon: float,
    radius_miles: float,
    get_lat: Callable[[T], float | None],
    get_lon: Callable[[T], float | None]
) -> list[tuple[T, float]]:
    results = []
    for item in items:
        item_lat = get_lat(item)
        item_lon = get_lon(item)
        if item_lat is None or item_lon is None:
            continue
        distance = haversine_distance(user_lat, user_lon, item_lat, item_lon)
        if distance <= radius_miles:
            results.append((item, distance))
    return sorted(results, key=lambda x: x[1])


def add_distance_to_items(
    items: list[T],
    user_lat: float | None,
    user_lon: float | None,
    get_lat: Callable[[T], float | None],
    get_lon: Callable[[T], float | None]
) -> list[dict]:
    results = []
    for item in items:
        item_dict = item.model_dump() if hasattr(item, 'model_dump') else dict(item)
        if user_lat is not None and user_lon is not None:
            item_lat = get_lat(item)
            item_lon = get_lon(item)
            if item_lat is not None and item_lon is not None:
                item_dict['distance_miles'] = round(
                    haversine_distance(user_lat, user_lon, item_lat, item_lon), 1
                )
            else:
                item_dict['distance_miles'] = None
        else:
            item_dict['distance_miles'] = None
        results.append(item_dict)
    return results
