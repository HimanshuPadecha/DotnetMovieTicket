import type {
  AuthResponse,
  Booking,
  DashboardStats,
  Movie,
  MovieDetail,
  SeatMap,
  ShowListItem,
  Theatre,
  User,
} from '../types'
import { api } from './client'

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),

  register: (name: string, email: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { name, email, password }).then((r) => r.data),

  me: () => api.get<User>('/auth/me').then((r) => r.data),

  updateProfile: (name: string, email: string) =>
    api.put<User>('/auth/profile', { name, email }).then((r) => r.data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put<{ message: string }>('/auth/password', { currentPassword, newPassword }).then((r) => r.data),
}

export const moviesApi = {
  list: (params?: { search?: string; genre?: string; language?: string; includeInactive?: boolean }) =>
    api.get<Movie[]>('/movies', { params }).then((r) => r.data),

  genres: () => api.get<string[]>('/movies/genres').then((r) => r.data),

  get: (id: number) => api.get<MovieDetail>(`/movies/${id}`).then((r) => r.data),

  create: (body: Record<string, unknown>) => api.post<Movie>('/movies', body).then((r) => r.data),

  update: (id: number, body: Record<string, unknown>) =>
    api.put<Movie>(`/movies/${id}`, body).then((r) => r.data),

  remove: (id: number) => api.delete<{ message: string; id: number }>(`/movies/${id}`).then((r) => r.data),
}

export const showsApi = {
  list: (params?: { movieId?: number; city?: string; date?: string }) =>
    api.get<ShowListItem[]>('/shows', { params }).then((r) => r.data),

  get: (id: number) => api.get(`/shows/${id}`).then((r) => r.data),

  seats: (id: number) => api.get<SeatMap>(`/shows/${id}/seats`).then((r) => r.data),

  create: (body: Record<string, unknown>) => api.post('/shows', body).then((r) => r.data),

  update: (id: number, body: Record<string, unknown>) => api.put(`/shows/${id}`, body).then((r) => r.data),

  remove: (id: number) => api.delete(`/shows/${id}`).then((r) => r.data),
}

export const theatresApi = {
  list: (city?: string) =>
    api.get<Theatre[]>('/theatres', { params: city ? { city } : {} }).then((r) => r.data),

  cities: () => api.get<string[]>('/theatres/cities').then((r) => r.data),

  get: (id: number) => api.get<Theatre>(`/theatres/${id}`).then((r) => r.data),

  create: (body: Record<string, unknown>) => api.post<Theatre>('/theatres', body).then((r) => r.data),

  update: (id: number, body: Record<string, unknown>) =>
    api.put(`/theatres/${id}`, body).then((r) => r.data),

  remove: (id: number) => api.delete(`/theatres/${id}`).then((r) => r.data),

  createScreen: (body: Record<string, unknown>) =>
    api.post('/theatres/screens', body).then((r) => r.data),
}

export const bookingsApi = {
  create: (showId: number, seatNumbers: string[]) =>
    api.post<Booking>('/bookings', { showId, seatNumbers }).then((r) => r.data),

  list: (status?: string) =>
    api.get<Booking[]>('/bookings', { params: status ? { status } : {} }).then((r) => r.data),

  get: (id: number) => api.get<Booking>(`/bookings/${id}`).then((r) => r.data),

  cancel: (id: number) =>
    api.post<{ id: number; bookingCode: string; status: string; message: string }>(
      `/bookings/${id}/cancel`,
    ).then((r) => r.data),
}

export const adminApi = {
  dashboard: () => api.get<DashboardStats>('/admin/dashboard').then((r) => r.data),
  users: () =>
    api
      .get<Array<User & { bookingsCount: number }>>('/admin/users')
      .then((r) => r.data),
}
