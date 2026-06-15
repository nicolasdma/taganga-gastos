import { useAuthActions } from '@convex-dev/auth/react'
import { Button } from '@/components/ui/button'
import { TagangaBackground } from '@/components/TagangaBackground'

export function LoginScreen() {
  const { signIn } = useAuthActions()

  return (
    <div className="app-shell flex flex-col bg-transparent">
      <TagangaBackground />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="editorial-kicker text-white/90 editorial-text-shadow mb-2">Taganga Gastos</p>
        <h1 className="font-display text-4xl font-bold text-white editorial-text-shadow mb-3">
          Gastos en pareja
        </h1>
        <p className="text-sm text-white/85 editorial-text-shadow max-w-xs mb-8 leading-relaxed">
          Compartidos en tiempo real. Personales solo para vos.
        </p>
        <Button
          size="lg"
          className="w-full max-w-xs rounded-2xl"
          onClick={() => void signIn('google')}
        >
          Continuar con Google
        </Button>
      </div>
    </div>
  )
}
