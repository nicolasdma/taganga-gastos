export function ConvexConfigError() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center bg-background">
      <span className="text-5xl mb-4">⚠️</span>
      <h1 className="text-xl font-extrabold text-foreground">Configuración incompleta</h1>
      <p className="text-sm text-muted-foreground mt-3 max-w-sm leading-relaxed">
        Falta la variable de entorno{' '}
        <code className="text-xs font-semibold bg-muted px-1.5 py-0.5 rounded">VITE_CONVEX_URL</code>.
        Configurala en Vercel o en tu archivo <code className="text-xs">.env.local</code> para conectar con Convex.
      </p>
    </div>
  )
}
