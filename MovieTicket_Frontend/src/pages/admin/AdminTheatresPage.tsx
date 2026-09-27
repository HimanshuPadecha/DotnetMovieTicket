import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { theatresApi } from '../../api'
import { getErrorMessage } from '../../api/client'
import { toast } from '../../components/Toast'
import { Button, EmptyState, ErrorBanner, Input, Select, Spinner } from '../../components/ui'
import type { Theatre } from '../../types'

export function AdminTheatresPage() {
  const qc = useQueryClient()
  const [theatreForm, setTheatreForm] = useState({ name: '', city: '', address: '' })
  const [editing, setEditing] = useState<Theatre | null>(null)
  const [theatreOpen, setTheatreOpen] = useState(false)
  const [screenOpen, setScreenOpen] = useState(false)
  const [screenForm, setScreenForm] = useState({
    name: 'Screen 1',
    theatreId: 0,
    rows: 4,
    seatsPerRow: 5,
  })

  const theatresQ = useQuery({ queryKey: ['theatres'], queryFn: () => theatresApi.list() })

  const saveTheatreM = useMutation({
    mutationFn: () => {
      const body = {
        name: theatreForm.name.trim(),
        city: theatreForm.city.trim(),
        address: theatreForm.address.trim(),
      }
      if (editing) return theatresApi.update(editing.id, body)
      return theatresApi.create(body)
    },
    onSuccess: () => {
      toast(editing ? 'Theatre updated' : 'Theatre created', 'success')
      setTheatreOpen(false)
      setEditing(null)
      setTheatreForm({ name: '', city: '', address: '' })
      void qc.invalidateQueries({ queryKey: ['theatres'] })
      void qc.invalidateQueries({ queryKey: ['cities'] })
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  })

  const deleteM = useMutation({
    mutationFn: (id: number) => theatresApi.remove(id),
    onSuccess: () => {
      toast('Theatre deleted', 'success')
      void qc.invalidateQueries({ queryKey: ['theatres'] })
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  })

  const screenM = useMutation({
    mutationFn: () =>
      theatresApi.createScreen({
        name: screenForm.name.trim(),
        theatreId: Number(screenForm.theatreId),
        rows: Number(screenForm.rows),
        seatsPerRow: Number(screenForm.seatsPerRow),
      }),
    onSuccess: () => {
      toast('Screen created with seats', 'success')
      setScreenOpen(false)
      void qc.invalidateQueries({ queryKey: ['theatres'] })
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  })

  function onTheatreSubmit(e: FormEvent) {
    e.preventDefault()
    if (!theatreForm.name.trim() || !theatreForm.city.trim()) {
      toast('Name and city are required', 'error')
      return
    }
    saveTheatreM.mutate()
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold">Theatres</h2>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              const first = theatresQ.data?.[0]?.id ?? 0
              setScreenForm((f) => ({ ...f, theatreId: first }))
              setScreenOpen(true)
            }}
          >
            Add screen
          </Button>
          <Button
            onClick={() => {
              setEditing(null)
              setTheatreForm({ name: '', city: '', address: '' })
              setTheatreOpen(true)
            }}
          >
            Add theatre
          </Button>
        </div>
      </div>

      {theatresQ.isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}
      {theatresQ.isError && (
        <ErrorBanner message={getErrorMessage(theatresQ.error)} onRetry={() => void theatresQ.refetch()} />
      )}
      {!theatresQ.isLoading && !theatresQ.data?.length && <EmptyState title="No theatres" />}

      <div className="grid gap-4">
        {(theatresQ.data ?? []).map((t) => (
          <div key={t.id} className="rounded-2xl border border-white/8 bg-cinema-900/60 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{t.name}</h3>
                <p className="text-sm text-white/55">
                  {t.city} · {t.address}
                </p>
                <p className="mt-2 text-xs text-white/40">
                  Screens:{' '}
                  {t.screens.length
                    ? t.screens.map((s) => `${s.name} (${s.totalSeats})`).join(', ')
                    : 'None'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="!px-2 !py-1 text-xs"
                  onClick={() => {
                    setEditing(t)
                    setTheatreForm({ name: t.name, city: t.city, address: t.address })
                    setTheatreOpen(true)
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  className="!px-2 !py-1 text-xs"
                  onClick={() => {
                    if (confirm(`Delete "${t.name}"?`)) deleteM.mutate(t.id)
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {theatreOpen && (
        <Modal onClose={() => setTheatreOpen(false)}>
          <form onSubmit={onTheatreSubmit} className="space-y-3">
            <h3 className="font-display text-xl font-bold">{editing ? 'Edit theatre' : 'New theatre'}</h3>
            <Input label="Name" value={theatreForm.name} onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })} />
            <Input label="City" value={theatreForm.city} onChange={(e) => setTheatreForm({ ...theatreForm, city: e.target.value })} />
            <Input label="Address" value={theatreForm.address} onChange={(e) => setTheatreForm({ ...theatreForm, address: e.target.value })} />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setTheatreOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveTheatreM.isPending}>
                Save
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {screenOpen && (
        <Modal onClose={() => setScreenOpen(false)}>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              if (!screenForm.theatreId) {
                toast('Select a theatre', 'error')
                return
              }
              screenM.mutate()
            }}
          >
            <h3 className="font-display text-xl font-bold">Add screen</h3>
            <Select
              label="Theatre"
              value={screenForm.theatreId}
              onChange={(e) => setScreenForm({ ...screenForm, theatreId: Number(e.target.value) })}
            >
              <option value={0}>Select…</option>
              {(theatresQ.data ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.city})
                </option>
              ))}
            </Select>
            <Input label="Screen name" value={screenForm.name} onChange={(e) => setScreenForm({ ...screenForm, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Rows (1–10)"
                type="number"
                min={1}
                max={10}
                value={screenForm.rows}
                onChange={(e) => setScreenForm({ ...screenForm, rows: Number(e.target.value) })}
              />
              <Input
                label="Seats per row (1–20)"
                type="number"
                min={1}
                max={20}
                value={screenForm.seatsPerRow}
                onChange={(e) => setScreenForm({ ...screenForm, seatsPerRow: Number(e.target.value) })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setScreenOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={screenM.isPending}>
                Create
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-cinema-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
