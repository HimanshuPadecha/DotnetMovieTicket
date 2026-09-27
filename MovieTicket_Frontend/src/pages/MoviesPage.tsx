import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { moviesApi } from '../api'
import { getErrorMessage } from '../api/client'
import { MovieCard, MovieGridSkeleton } from '../components/MovieCard'
import { EmptyState, ErrorBanner, Input, PageHeader, Select } from '../components/ui'

export function MoviesPage() {
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [language, setLanguage] = useState('')

  const genresQ = useQuery({ queryKey: ['genres'], queryFn: moviesApi.genres })
  const moviesQ = useQuery({
    queryKey: ['movies', { search, genre, language }],
    queryFn: () =>
      moviesApi.list({
        search: search || undefined,
        genre: genre || undefined,
        language: language || undefined,
      }),
  })

  const languages = Array.from(
    new Set((moviesQ.data ?? []).map((m) => m.language).filter(Boolean)),
  ).sort()

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Movies"
        subtitle="Browse the catalog, filter by genre or language, and open a film to book seats."
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <div className="relative sm:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-[2.35rem] h-4 w-4 text-white/35" />
          <Input
            label="Search"
            className="pl-10"
            placeholder="Title or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select label="Genre" value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="">All genres</option>
          {(genresQ.data ?? []).map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </Select>
        <Select label="Language" value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="">All languages</option>
          {languages.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </Select>
      </div>

      {moviesQ.isError && (
        <ErrorBanner
          message={getErrorMessage(moviesQ.error)}
          onRetry={() => void moviesQ.refetch()}
        />
      )}

      {moviesQ.isLoading ? (
        <MovieGridSkeleton count={10} />
      ) : !moviesQ.data?.length ? (
        <EmptyState title="No movies match" description="Clear filters or try another search." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {moviesQ.data.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      )}
    </div>
  )
}
