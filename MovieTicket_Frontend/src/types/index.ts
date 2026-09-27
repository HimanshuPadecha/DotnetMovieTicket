export type Role = 'ADMIN' | 'CUSTOMER'

export interface User {
  id: number
  name: string
  email: string
  role: Role
  createdAt?: string
}

export interface AuthResponse {
  token: string
  expiresAt: string
  tokenType: string
  user: User
}

export interface Movie {
  id: number
  title: string
  genre: string
  language: string
  durationMinutes: number
  rating: string
  description: string
  releaseDate: string
  imageUrl?: string | null
  backdropUrl?: string | null
  isActive?: boolean
}

export interface MovieDetail extends Movie {
  shows: ShowSummary[]
}

export interface ShowSummary {
  id: number
  startTime: string
  ticketPrice: number
  screenId?: number
  screen: string
  theatreId?: number
  theatre: string
  city: string
  availableSeats?: number
}

export interface ShowListItem {
  id: number
  movie: Pick<Movie, 'id' | 'title' | 'genre' | 'language' | 'durationMinutes' | 'imageUrl' | 'rating'>
  theatre: { id: number; name: string; city: string; address?: string }
  screenId: number
  screen: string
  startTime: string
  ticketPrice: number
  availableSeats: number
}

export interface SeatInfo {
  id: number
  seatNumber: string
  seatType: 'PREMIUM' | 'REGULAR' | string
  isBooked: boolean
  priceMultiplier: number
}

export interface SeatMap {
  showId: number
  movie: { id: number; title: string; imageUrl?: string | null }
  theatre: string
  city: string
  screen: string
  startTime: string
  ticketPrice: number
  seats: SeatInfo[]
}

export interface Theatre {
  id: number
  name: string
  city: string
  address: string
  screens: { id: number; name: string; totalSeats: number }[]
}

export interface Booking {
  id: number
  bookingCode: string
  customer?: { id: number; name: string; email: string }
  movie: string
  imageUrl?: string | null
  theatre: string
  city: string
  screen: string
  showTime: string
  seats: string[] | { seatNumber: string; seatType?: string }[]
  totalAmount: number
  status: 'CONFIRMED' | 'CANCELLED' | string
  bookedAt: string
}

export interface DashboardStats {
  totalMovies: number
  totalTheatres: number
  totalShows: number
  totalUsers: number
  confirmedBookings: number
  cancelledBookings: number
  revenue: number
  recentBookings: {
    id: number
    bookingCode: string
    customer: string
    movie: string
    totalAmount: number
    status: string
    bookedAt: string
  }[]
}

export interface ApiError {
  message?: string
  seats?: string[]
  invalid?: string[]
}
