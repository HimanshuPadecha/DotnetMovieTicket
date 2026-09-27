import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { moviesApi, showsApi, theatresApi } from '../../api'
import { getErrorMessage } from '../../api/client'
import { toast } from '../../components/Toast'
import { Button, EmptyState, ErrorBanner, Input, Select, Spinner } from '../../components/ui'
import { formatCurrency, formatDateTime } from '../../lib/utils'
import type { ShowListItem } from '../../types'

export function AdminShowsPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ShowListItem | null>(null)
  const [form, setForm] = useState({
    movieId: 0,
    screenId: 0,
    startTime: '',
    ticketPrice: 250,
  })

  const showsQ = useQuery({ queryKey: ['shows', 'admin'], queryFn: () => showsApi.list() })
  const moviesQ = useQuery({ queryKey: ['movies'], queryFn: () => moviesApi.list() })
  const theatresQ = useQuery({ queryKey: ['theatres'], queryFn: () => theatresApi.list() })

  const screens = useMemo(() => {
    const list: { id: number; label: string }[] = []
    for (const t of theatresQ.data ?? []) {
      for (const s of t.screens) {
        list.push({ id: s.id, label: `${t.name} · ${s.name}` })
      }
    }
    return list
  }, [theatresQ.data])

  const saveM = useMutation({
    mutationFn: () => {
      if (editing) {
        return showsApi.update(editing.id, {
          startTime: form.startTime,
          ticketPrice: Number(form.ticketPrice),
        })
      }
      return showsApi.create({
        movieId: Number(form.movieId),
        screenId: Number(form.screenId),
        startTime: form.startTime,
        ticketPrice: Number(form.ticketPrice),
      })
    },
    onSuccess: () => {
      toast(editing ? 'Show updated' : 'Show created', 'success')
      setOpen(false)
      setEditing(null)
      void qc.invalidateQueries({ queryKey: ['shows'] })
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  })

  const deleteM = useMutation({
    mutationFn: (id: number) => showsApi.remove(id),
    onSuccess: () => {
      toast('Show deleted', 'success')
      void qc.invalidateQueries({ queryKey: ['shows'] })
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  })

  function toLocalInput(iso: string) {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!editing && (!form.movieId || !form.screenId)) {
      toast('Select movie and screen', 'error')
      return
    }
    if (!form.startTime) {
      toast('Start time is required', 'error')
      return
    }
    if (Number(form.ticketPrice) <= 0) {
      toast('Ticket price must be greater than 0', 'error')
      return
    }
    saveM.mutate()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold">Shows</h2>
        <Button
          onClick={() => {
            setEditing(null)
            setForm({
              movieId: moviesQ.data?.[0]?.id ?? 0,
              screenId: screens[0]?.id ?? 0,
              startTime: '',
              ticketPrice: 250,
            })
            setOpen(true)
          }}
        >
          Add show
        </Button>
      </div>

      {showsQ.isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}
      {showsQ.isError && (
        <ErrorBanner message={getErrorMessage(showsQ.error)} onRetry={() => void showsQ.refetch()} />
      )}
      {!showsQ.isLoading && !showsQ.data?.length && <EmptyState title="No upcoming shows" />}

      {!!showsQ.data?.length && (
        <div className="overflow-x-auto rounded-2xl border border-white/8">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-cinema-800/80 text-xs uppercase text-white/45">
              <tr>
                <th className="px-4 py-3">Movie</th>
                <th className="px-4 py-3">Theatre</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Seats</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {showsQ.data.map((s) => (
                <tr key={s.id} className="border-t border-white/5">
                  <td className="px-4 py-3 font-medium">{s.movie.title}</td>
                  <td className="px-4 py-3 text-white/60">
                    {s.theatre.name} · {s.screen}
                  </td>
                  <td className="px-4 py-3 text-white/60">{formatDateTime(s.startTime)}</td>
                  <td className="px-4 py-3">{formatCurrency(s.ticketPrice)}</td>
                  <td className="px-4 py-3">{s.availableSeats}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        className="!px-2 !py-1 text-xs"
                        onClick={() => {
                          setEditing(s)
                          setForm({
                            movieId: s.movie.id,
                            screenId: s.screenId,
                            startTime: toLocalInput(s.startTime),
                            ticketPrice: s.ticketPrice,
                          })
                          setOpen(true)
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        className="!px-2 !py-1 text-xs"
                        onClick={() => {
                          if (confirm('Delete this show?')) deleteM.mutate(s.id)
                        }}
                      >
                        Delete
                      </Button>
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
            className="w-full max-w-lg space-y-3 rounded-2xl border border-white/10 bg-cinema-900 p-6"
          >
            <h3 className="font-display text-xl font-bold">{editing ? 'Edit show' : 'New show'}</h3>
            {!editing && (
              <>
                <Select
                  label="Movie"
                  value={form.movieId}
                  onChange={(e) => setForm({ ...form, movieId: Number(e.target.value) })}
                >
                  <option value={0}>Select…</option>
                  {(moviesQ.data ?? []).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Screen"
                  value={form.screenId}
                  onChange={(e) => setForm({ ...form, screenId: Number(e.target.value) })}
                >
                  <option value={0}>Select…</option>
                  {screens.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              </>
            )}
            <Input
              label="Start time"
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
            <Input
              label="Ticket price (₹)"
              type="number"
              min={1}
              value={form.ticketPrice}
              onChange={(e) => setForm({ ...form, ticketPrice: Number(e.target.value) })}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveM.isPending}>
                Save
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
