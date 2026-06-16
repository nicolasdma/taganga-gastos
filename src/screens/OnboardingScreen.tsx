import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TagangaBackground } from '@/components/TagangaBackground'
import { cn } from '@/lib/utils'

interface OnboardingScreenProps {
  initialInviteCode?: string
}

export function OnboardingScreen({ initialInviteCode }: OnboardingScreenProps) {
  const createHousehold = useMutation(api.households.createHousehold)
  const joinHousehold = useMutation(api.households.joinHousehold)
  const [mode, setMode] = useState<'create' | 'join'>(initialInviteCode ? 'join' : 'create')
  const [householdName, setHouseholdName] = useState('')
  const [inviteCode, setInviteCode] = useState(initialInviteCode ?? '')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const lookup = useQuery(
    api.households.lookupInvite,
    inviteCode.trim().length >= 6 ? { inviteCode: inviteCode.trim() } : 'skip'
  )

  const handleCreate = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await createHousehold({
        name: householdName.trim() || undefined,
      })
      if (initialInviteCode) {
        window.history.replaceState({}, '', '/')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el hogar')
    } finally {
      setSubmitting(false)
    }
  }

  const handleJoin = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await joinHousehold({ inviteCode: inviteCode.trim() })
      window.history.replaceState({}, '', '/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código inválido')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="app-shell flex flex-col bg-transparent">
      <TagangaBackground />
      <div className="relative z-10 flex flex-1 flex-col px-5 pt-safe pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <p className="editorial-kicker text-white/90 editorial-text-shadow mb-2">Un paso más</p>
          <h1 className="font-display text-3xl font-bold text-white editorial-text-shadow mb-2">
            Tu hogar compartido
          </h1>
          <p className="text-sm text-white/85 editorial-text-shadow mb-6 leading-relaxed">
            Creá un hogar para vos y tu pareja, o unite con un código de invitación.
          </p>

          <div className="grid grid-cols-2 gap-2 mb-5">
            <button
              type="button"
              onClick={() => setMode('create')}
              className={cn(
                'rounded-2xl px-3 py-2.5 text-sm font-bold transition-all',
                mode === 'create' ? 'btn-cobalt' : 'chip-tile'
              )}
            >
              Crear hogar
            </button>
            <button
              type="button"
              onClick={() => setMode('join')}
              className={cn(
                'rounded-2xl px-3 py-2.5 text-sm font-bold transition-all',
                mode === 'join' ? 'btn-cobalt' : 'chip-tile'
              )}
            >
              Unirme
            </button>
          </div>

          <div className="rounded-3xl card-porcelain-rim shadow-porcelain p-5 space-y-4">
            {mode === 'create' ? (
              <>
                <div>
                  <label className="label-stitch mb-2 block" htmlFor="household-name">
                    Nombre (opcional)
                  </label>
                  <Input
                    id="household-name"
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    placeholder="Ej: Casa Taganga"
                    className="rounded-xl"
                  />
                </div>
                <Button
                  size="lg"
                  className="w-full rounded-2xl"
                  disabled={submitting}
                  onClick={() => void handleCreate()}
                >
                  {submitting ? 'Creando…' : 'Crear hogar'}
                </Button>
              </>
            ) : (
              <>
                <div>
                  <label className="label-stitch mb-2 block" htmlFor="invite-code">
                    Código de invitación
                  </label>
                  <Input
                    id="invite-code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="ABC12345"
                    className="rounded-xl uppercase tracking-widest"
                    autoCapitalize="characters"
                  />
                  {lookup?.valid === true && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Hogar encontrado{lookup.householdName ? `: ${lookup.householdName}` : ''}
                    </p>
                  )}
                  {lookup?.valid === false && inviteCode.trim().length >= 6 && (
                    <p className="text-xs text-red-600 mt-2">Código no encontrado</p>
                  )}
                </div>
                <Button
                  size="lg"
                  className="w-full rounded-2xl"
                  disabled={submitting || inviteCode.trim().length < 6}
                  onClick={() => void handleJoin()}
                >
                  {submitting ? 'Uniéndome…' : 'Unirme al hogar'}
                </Button>
              </>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
