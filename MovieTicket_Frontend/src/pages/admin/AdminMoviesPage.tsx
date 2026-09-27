import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { moviesApi } from '../../api'
import { getErrorMessage } from '../../api/client'
import { toast } from '../../components/Toast'
import { Badge, Button, EmptyState, ErrorBanner, Input, Spinner, TextArea } from '../../components/ui'
import { formatDate } from '../../lib/utils'
import type { Movie } from '../../types'

const emptyForm = {
  title: '',
  genre: '',
  language: '',
  durationMinutes: 120,
  rating: 'U/A',
  description: '',
  releaseDate: '',
  imageUrl: '',
  backdropUrl: '',
  isActive: true,
}

export function AdminMoviesPage() {
  const qc = useQueryClient()
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<Movie | null>(null)
  const [open, setOpen] = useState(false)

  const moviesQ = useQuery({
    queryKey: ['movies', { includeInactive: true }],
    queryFn: () => moviesApi.list({ includeInactive: true }),
  })

  const saveM = useMutation({
    mutationFn: async () => {
      const body = {
        title: form.title.trim(),
        genre: form.genre.trim(),
        language: form.language.trim(),
        durationMinutes: Number(form.durationMinutes),
        rating: form.rating.trim() || 'U/A',
        description: form.description.trim(),
        releaseDate: form.releaseDate || new Date().toISOString(),
        imageUrl: form.imageUrl.trim() || null,
        backdropUrl: form.backdropUrl.trim() || null,
        ...(editing ? { isActive: form.isActive } : {}),
      }
      if (editing) return moviesApi.update(editing.id, body)
      return moviesApi.create(body)
    },
    onSuccess: () => {
      toast(editing ? 'Movie updated' : 'Movie created', 'success')
      setOpen(false)
      setEditing(null)
      setForm(emptyForm)
      void qc.invalidateQueries({ queryKey: ['movies'] })
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  })

  const deleteM = useMutation({
    mutationFn: (id: number) => moviesApi.remove(id),
    onSuccess: () => {
      toast('Movie deactivated', 'success')
      void qc.invalidateQueries({ queryKey: ['movies'] })
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  })

  function startEdit(m: Movie) {
    setEditing(m)
    setForm({
      title: m.title,
      genre: m.genre,
      language: m.language,
      durationMinutes: m.durationMinutes,
      rating: m.rating,
      description: m.description,
      releaseDate: m.releaseDate?.slice(0, 10) ?? '',
      imageUrl: m.imageUrl ?? '',
      backdropUrl: m.backdropUrl ?? '',
      isActive: m.isActive ?? true,
    })
    setOpen(true)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      toast('Title is required', 'error')
      return
    }
    saveM.mutate()
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold">Movies</h2>
        <Button
          onClick={() => {
            setEditing(null)
            setForm(emptyForm)
            setOpen(true)
          }}
        >
          Add movie
        </Button>
      </div>

      {moviesQ.isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}
      {moviesQ.isError && (
        <ErrorBanner message={getErrorMessage(moviesQ.error)} onRetry={() => void moviesQ.refetch()} />
      )}
      {!moviesQ.isLoading && !moviesQ.data?.length && <EmptyState title="No movies" />}

      {!!moviesQ.data?.length && (
        <div className="overflow-x-auto rounded-2xl border border-white/8">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-cinema-800/80 text-xs uppercase text-white/45">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Genre</th>
                <th className="px-4 py-3">Release</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {moviesQ.data.map((m) => (
                <tr key={m.id} className="border-t border-white/5">
                  <td className="px-4 py-3 font-medium">{m.title}</td>
                  <td className="px-4 py-3 text-white/60">{m.genre}</td>
                  <td className="px-4 py-3 text-white/60">{formatDate(m.releaseDate)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={m.isActive === false ? 'danger' : 'success'}>
                      {m.isActive === false ? 'Inactive' : 'Active'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="secondary" className="!px-2 !py-1 text-xs" onClick={() => startEdit(m)}>
                        Edit
                      </Button>
                      {m.isActive !== false && (
                        <Button
                          variant="danger"
                          className="!px-2 !py-1 text-xs"
                          onClick={() => {
                            if (confirm(`Deactivate "${m.title}"?`)) deleteM.mutate(m.id)
                          }}
                        >
                          Deactivate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <form
            onSubmit={onSubmit}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-cinema-900 p-6 shadow-2xl"
          >
            <h3 className="font-display text-xl font-bold">{editing ? 'Edit movie' : 'New movie'}</h3>
            <div className="mt-4 grid gap-3">
              <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Genre" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} />
                <Input label="Language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Duration (min)"
                  type="number"
                  min={1}
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                />
                <Input label="Rating" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
              </div>
              <Input
                label="Release date"
                type="date"
                value={form.releaseDate}
                onChange={(e) => setForm({ ...form, releaseDate: e.target.value })}
              />
              <TextArea
                label="Description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <Input label="Poster URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
              <Input label="Backdrop URL" value={form.backdropUrl} onChange={(e) => setForm({ ...form, backdropUrl: e.target.value })} />
              {editing && (
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  Active
                </label>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveM.isPending}>
                {saveM.isPending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
