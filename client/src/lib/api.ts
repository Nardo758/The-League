const API_BASE = '/api';

interface ApiError {
  detail: string;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        detail: 'An error occurred',
      }));
      throw new Error(error.detail);
    }

    return response.json();
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }
}

export const api = new ApiClient();

export interface User {
  id: number;
  email: string;
  username: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface Venue {
  id: number;
  name: string;
  venue_type: string;
  address: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
}

export interface League {
  id: number;
  name: string;
  description: string | null;
  venue_id: number;
  sport_id: number;
}

export interface Sport {
  id: number;
  name: string;
  scoring_type: string;
}

export interface OnlineGame {
  id: number;
  game_type: string;
  status: string;
  player1_id: number;
  player2_id: number | null;
  current_turn: number | null;
  winner_id: number | null;
  is_ranked: boolean;
  created_at: string;
}

export const auth = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await fetch('/api/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(error.detail);
    }
    
    return response.json();
  },
  register: (email: string, fullName: string, password: string) =>
    api.post<User>('/auth/register', { email, full_name: fullName, password }),
  me: () => api.get<User>('/users/me'),
};

export const venues = {
  list: (params?: { lat?: number; lng?: number; radius_miles?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.lat) searchParams.set('lat', params.lat.toString());
    if (params?.lng) searchParams.set('lng', params.lng.toString());
    if (params?.radius_miles)
      searchParams.set('radius_miles', params.radius_miles.toString());
    const query = searchParams.toString();
    return api.get<{ items: Venue[]; total: number }>(
      `/venues${query ? `?${query}` : ''}`
    );
  },
  get: (id: number) => api.get<Venue>(`/venues/${id}`),
};

export const leagues = {
  list: (venueId?: number) => {
    const query = venueId ? `?venue_id=${venueId}` : '';
    return api.get<{ items: League[]; total: number }>(`/leagues${query}`);
  },
  get: (id: number) => api.get<League>(`/leagues/${id}`),
};

export const sports = {
  list: () => api.get<{ items: Sport[]; total: number }>('/sports'),
};

export interface Channel {
  id: number;
  sport_id: number;
  slug: string;
  title: string;
  description: string | null;
  emoji: string | null;
  hero_image_url: string | null;
  primary_color: string | null;
  is_active: boolean;
  subscriber_count: number;
  live_events_count: number;
  upcoming_events_count: number;
  is_subscribed: boolean;
}

export interface ChannelStats {
  subscriber_count: number;
  live_events_count: number;
  upcoming_events_count: number;
  total_leagues: number;
  total_venues: number;
  recent_results_count: number;
}

export interface LiveEvent {
  id: number;
  event_type: string;
  title: string;
  subtitle: string | null;
  status: string;
  venue_name: string | null;
  started_at: string | null;
}

export interface UpcomingEvent {
  id: number;
  event_type: string;
  title: string;
  venue_name: string | null;
  location: string | null;
  starts_at: string | null;
  registration_open: boolean;
  spots_available: number | null;
}

export interface ChannelDetail {
  channel: Channel;
  stats: ChannelStats;
  live_events: LiveEvent[];
  upcoming_events: UpcomingEvent[];
}

export interface ChannelFeedEntry {
  id: number;
  content_type: string;
  title: string;
  subtitle: string | null;
  body: string | null;
  image_url: string | null;
  link_url: string | null;
  reference_id: number | null;
  reference_type: string | null;
  priority: number;
  is_pinned: boolean;
  is_featured: boolean;
  starts_at: string | null;
  created_at: string;
}

export const channels = {
  list: () => api.get<{ items: Channel[]; total: number }>('/channels'),
  get: (slug: string) => api.get<ChannelDetail>(`/channels/${slug}`),
  getFeed: (slug: string, params?: { content_type?: string; skip?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.content_type) searchParams.set('content_type', params.content_type);
    if (params?.skip) searchParams.set('skip', params.skip.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    const query = searchParams.toString();
    return api.get<{ items: ChannelFeedEntry[]; total: number }>(
      `/channels/${slug}/feed${query ? `?${query}` : ''}`
    );
  },
  subscribe: (slug: string, prefs?: {
    notify_live_events?: boolean;
    notify_upcoming?: boolean;
    notify_results?: boolean;
    notify_posts?: boolean;
  }) => api.post(`/channels/${slug}/subscribe`, prefs || {}),
  unsubscribe: (slug: string) => api.delete(`/channels/${slug}/subscribe`),
};

export const games = {
  list: (params?: { game_type?: string; status?: string; my_games?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.game_type) searchParams.set('game_type', params.game_type);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.my_games) searchParams.set('my_games', 'true');
    const query = searchParams.toString();
    return api.get<{ items: OnlineGame[]; total: number }>(
      `/online-games${query ? `?${query}` : ''}`
    );
  },
  available: (gameType?: string) => {
    const query = gameType ? `?game_type=${gameType}` : '';
    return api.get<OnlineGame[]>(`/online-games/available${query}`);
  },
  create: (gameType: string, isRanked = false) =>
    api.post<OnlineGame>('/online-games', { game_type: gameType, is_ranked: isRanked }),
  join: (id: number) => api.post<OnlineGame>(`/online-games/${id}/join`),
  getState: (id: number) => api.get<{
    id: number;
    game_type: string;
    status: string;
    board_state: Record<string, unknown>;
    current_turn: number;
    player_number: number;
    valid_moves: Record<string, unknown>[];
    is_your_turn: boolean;
    winner_id: number | null;
  }>(`/online-games/${id}`),
  spectate: (id: number) => api.get<{
    id: number;
    game_type: string;
    status: string;
    board_state: Record<string, unknown>;
    current_turn: number;
    player1_id: number;
    player2_id: number | null;
    winner_id: number | null;
  }>(`/online-games/${id}/spectate`),
  move: (id: number, move: Record<string, unknown>) =>
    api.post(`/online-games/${id}/move`, { move }),
  challenge: (opponentId: number, gameType: string, isRanked = false) =>
    api.post('/online-games/challenge', {
      opponent_id: opponentId,
      game_type: gameType,
      is_ranked: isRanked,
    }),
  challenges: () => api.get<OnlineGame[]>('/online-games/challenges'),
  accept: (id: number) => api.post<OnlineGame>(`/online-games/${id}/accept`),
  decline: (id: number) => api.post(`/online-games/${id}/decline`),
};
