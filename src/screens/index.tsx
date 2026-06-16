import { HomeScreen } from '@/screens/HomeScreen'
import { CalendarScreen } from '@/screens/CalendarScreen'
import { LoginScreen } from '@/screens/LoginScreen'
import { DebugAuthScreen } from '@/screens/DebugAuthScreen'
import { OnboardingScreen } from '@/screens/OnboardingScreen'

export function PlaceholderScreen({ title, emoji }: { title: string; emoji: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <span className="text-5xl mb-4">{emoji}</span>
      <h2 className="text-xl font-extrabold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground mt-2">Próximamente en la siguiente fase.</p>
    </div>
  )
}

export { HomeScreen, CalendarScreen, LoginScreen, OnboardingScreen, DebugAuthScreen }
