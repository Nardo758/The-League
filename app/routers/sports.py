from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, select

from app.core.cache import cache_key, get_cached_list, invalidate_list_cache, set_cached_list
from app.db import get_session
from app.deps import get_current_user
from app.models import Sport, User
from app.schemas import PaginatedResponse, SportCategory, SportCreate, SportRead, paginate

router = APIRouter(prefix="/sports", tags=["sports"])


@router.get("", response_model=PaginatedResponse[SportRead])
def list_sports(
    category: SportCategory | None = None,
    is_online: bool | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_session)
):
    cache_id = f"sports:{cache_key(category=category.value if category else None, is_online=is_online, page=page, page_size=page_size)}"
    cached = get_cached_list(cache_id)
    if cached is not None:
        return cached

    stmt = select(Sport)
    count_stmt = select(func.count()).select_from(Sport)

    if category:
        stmt = stmt.where(Sport.category == category)
        count_stmt = count_stmt.where(Sport.category == category)
    if is_online is not None:
        stmt = stmt.where(Sport.is_online == is_online)
        count_stmt = count_stmt.where(Sport.is_online == is_online)

    total = session.exec(count_stmt).one()

    stmt = stmt.order_by(Sport.name)
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    items = [SportRead.model_validate(s) for s in session.exec(stmt).all()]
    result = paginate(items, total, page, page_size)
    set_cached_list(cache_id, result)
    return result


@router.get("/{sport_id}", response_model=SportRead)
def get_sport(sport_id: int, session: Session = Depends(get_session)):
    sport = session.get(Sport, sport_id)
    if not sport:
        raise HTTPException(status_code=404, detail="Sport not found")
    return sport


@router.post("", response_model=SportRead, status_code=status.HTTP_201_CREATED)
def create_sport(
    payload: SportCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    existing = session.exec(select(Sport).where(Sport.name == payload.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Sport with this name already exists")

    sport = Sport(**payload.model_dump())
    session.add(sport)
    session.commit()
    session.refresh(sport)

    invalidate_list_cache("sports:")
    return sport
