# Gatonomía — Source of Truth

Última actualización: 2026-06-17

Este documento define la identidad, objetivo y criterios de producto de Gatonomía. Sirve como fuente de verdad para decisiones de diseño, copy, features, marketing y prompts de agentes.

Este SOT mezcla visión de producto, marca y principios porque Gatonomía todavía está en etapa fundacional. A medida que madure, debería separarse en:

- Product Vision: por qué existe.
- Brand Book: tono, identidad y copy.
- Product Principles: reglas de diseño y psicología.
- Feature Roadmap: qué construir y qué no.

## Tesis

Gatonomía no compite como "otro expense tracker". Compite como un ritual diario cozy para registrar gastos sin ansiedad.

Las apps financieras tradicionales optimizan funciones: presupuestos, reportes, reglas, categorías, exportaciones. Gatonomía optimiza la experiencia emocional: que hablar de plata sea menos frío, menos culposo y más amable.

La idea central:

> Registrar gastos debería sentirse como cuidar una libreta viva, no como llenar un Excel.

## Posicionamiento

Gatonomía es una app de gastos compartidos y personales con identidad cozy/craft, gatitos y una experiencia diseñada para reducir fricción emocional alrededor de la plata.

No vendemos "budgeting". Vendemos:

- Tranquilidad.
- Constancia.
- Belleza cotidiana.
- Menos ansiedad financiera.
- Menos fricción en pareja.
- Una forma tierna de mirar los hábitos.

Frases guía:

- La app cozy para registrar gastos sin ansiedad.
- Tu libreta de gastos con gatitos.
- Finanzas de pareja, pero tiernas.
- Cuidar tu plata sin sentirte en Excel.

"Animal Crossing para tus gastos" funciona como pitch interno, no necesariamente como tagline público principal.

Tagline público recomendado por ahora:

> La app cozy para registrar gastos sin ansiedad.

## Nombre

Marca visible recomendada: **Gatonomía**.

Nombre técnico recomendado: **gatonomia**.

Uso:

- UI visible, marketing, onboarding, PWA title largo: `Gatonomía`.
- Slugs, package names, storage keys nuevos, dominios, IDs técnicos: `gatonomia`.
- Si una plataforma no maneja bien acentos, usar `Gatonomia`.

No todo uso de "gastos" debe reemplazarse. "Gasto" sigue siendo el concepto de dominio. "Gatonomía" es el producto.

## Público Inicial

### 1. Parejas jóvenes (25-35)

Principal wedge de producto.

Dolor claro: la plata genera fricción. Gatonomía debe hacer que registrar y revisar gastos compartidos se sienta menos transaccional.

Ejemplo de tono:

- "Nico agregó súper 🛒"
- "Casa actualizada 🐾"
- "Nosotros este mes"

### 2. Mujeres 25-40 cozy/planner/cat people

Muy buen segmento para adquisición visual y retención emocional.

Afinidades:

- Estética cozy.
- Planners, trackers, Notion/Pinterest.
- Gatos.
- Apps bonitas y cuidadas.
- Rechazo a interfaces financieras corporativas.

### 3. Gen Z (18-25)

Buen potencial viral, especialmente por estética, widgets, logros y personalización. Menor prioridad inicial para monetización.

### No objetivo primario

- Power users financieros.
- Personas que quieren Excel con esteroides.
- Usuarios que priorizan reglas complejas, forecasting, inversiones o automatización bancaria avanzada.

## Principios de Producto

### 1. Cozy, no infantil

Debe sentirse cálido, artesanal y sofisticado. Más Studio Ghibli / libreta ilustrada que juguete infantil.

Evitar:

- Chistes excesivos.
- Guilt-tripping con gatitos tristes.
- UI demasiado caricaturesca.
- Gamificación agresiva.

### 2. Cero culpa

La app nunca debe hacer que el usuario se sienta malo con la plata.

Mal:

> Gastaste demasiado. Tu michi está preocupado.

Mejor:

> Michi notó un mes movido. Mañana lo miramos juntos 🐾

La app acompaña. No reta.

### 3. El gato es compañero, no protagonista

Los gatos son el vehículo emocional, no el producto.

El gato debe sentirse como una presencia en la casa: silenciosa, cálida, ocasional. No debe aparecer en cada línea ni empujar al usuario a interactuar con él todo el tiempo.

Regla:

> El gato es un personaje secundario.

Debe sentirse como:

- Una planta en casa.
- Un compañero silencioso.
- Un pequeño testigo amable.
- Algo que está ahí cuando volvés.

No debe sentirse como:

- Clippy.
- Un jefe.
- Una mascota demandante.
- Un sistema de castigo.
- Un chiste permanente.

### 4. Registrar cuida al michi; gastar no alimenta al michi

Importante: no premiar gastar.

Loop correcto:

- Registrar = cuidar.
- Ser constante = desbloquear.
- Ahorrar = darle pescado / descanso / hogar.
- Revisar sin evitar = progreso.

Loop incorrecto:

- Cada gasto alimenta al gato.
- Más gasto = más recompensa.

### 5. Simplicidad por encima de completitud

Si Gatonomía se vuelve YNAB con gatos, pierde.

Preferir:

- Registro rápido.
- Ítems humanos.
- Totales claros.
- Insights narrativos.
- Vista Nosotros/Míos.
- Historial bonito.

Evitar por defecto:

- Presupuestos complejos.
- Muchas configuraciones.
- Demasiadas categorías.
- Alertas duras.
- Forecasting financiero pesado.

### 6. Belleza funcional

La estética no es decoración. Es parte del valor: reduce resistencia a abrir la app.

Cada pantalla importante debe responder:

- ¿Se entiende rápido?
- ¿Da calma?
- ¿Se siente propia de Gatonomía?
- ¿Evita parecer una fintech genérica?

## Principios Psicológicos

Estos principios son tan importantes como los componentes visuales.

- La app nunca debe generar culpa.
- El usuario siempre debe sentirse capaz de volver.
- Un mes malo no rompe nada.
- No existen streaks perdidos como castigo.
- La ausencia no se castiga.
- Siempre se puede continuar.
- La app acompaña, no supervisa.
- Los datos pertenecen al usuario, no al sistema.
- La claridad es más importante que la precisión excesiva.
- Una pareja debe poder hablar de plata sin sentirse auditada.
- Las notificaciones deben invitar, no perseguir.
- Los insights deben explicar patrones, no juzgar decisiones.
- El usuario no le debe nada a la app.

Principio de recuperación:

> Volver después de no usar Gatonomía debe sentirse fácil, no vergonzoso.

Copy a evitar:

- "Perdiste tu racha".
- "Fallaste tu objetivo".
- "No registraste nada esta semana".
- "Te excediste".

Copy preferido:

- "Volvimos 🐾"
- "Seguimos desde acá."
- "Este mes estuvo movido."
- "Michi guardó tu lugar."

## Relación Usuario-Gatonomía

La relación principal no es "dueño y mascota" ni "usuario y herramienta".

Relación elegida:

> Gatonomía es un compañero silencioso para mirar la plata con calma.

Esto evita mezclar demasiados modelos:

- Mascota tipo Tamagotchi: demasiado demandante.
- Casa tipo Animal Crossing: útil como atmósfera, no como obligación.
- Jardín de progreso: útil para constancia, pero no debe volverse grind.
- Compañero silencioso: el mejor centro emocional.

El gato nunca pide. Nunca castiga. Nunca necesita que el usuario lo alimente. Simplemente está, como un gato real.

## Momento Mágico

El producto debe tener un momento diario pequeño y agradable.

Abrir Gatonomía debería sentirse como:

1. Abrir una libreta.
2. Ver que todo sigue en orden.
3. Registrar algo en pocos segundos.
4. Recibir una confirmación cálida.
5. Cerrar sin tareas pendientes.

Duración ideal: **30 segundos**.

Sensación final:

- "Listo, lo anoté."
- "No fue pesado."
- "Puedo volver mañana."

No buscar que el usuario pase mucho tiempo en la app. Buscar que vuelva con baja resistencia.

## Promesa de Usuario

Gatonomía ayuda a registrar y entender gastos cotidianos sin convertir la plata en una fuente más de estrés.

Para parejas:

> Saber qué pasó con la plata de la casa sin que parezca una auditoría.

Para uso personal:

> Mirar tus hábitos con cariño y claridad.

## Diferenciación

Competidores directos funcionales:

- Splitwise.
- YNAB.
- Wallet.
- Money Manager.
- Monarch.
- Spendee.

Gatonomía no debe intentar ganar por más features. Debe ganar por:

- Identidad.
- Baja ansiedad.
- Ritual diario.
- Diseño emocional.
- Rapidez mobile.
- Experiencia compartida de pareja.

La verdadera categoría a explorar:

> Cozy finance.

## Feature Pillars

### 1. Casa compartida

La vista Nosotros/Míos es central, no secundaria.

Esta es una de las ventajas reales de Gatonomía: no está pensada solo para dividir plata, sino para convivir con menos fricción.

Splitwise pregunta:

> ¿Quién le debe cuánto a quién?

Gatonomía pregunta:

> ¿Qué pasó con la casa?

Debe sentirse como:

- Lo de la casa.
- Lo mío.
- Lo que construimos juntos.

Copy guía:

- Casa actualizada.
- Nosotros este mes.
- Lo de la casa quedó anotado.
- Nico agregó súper 🛒

Evitar que la experiencia se sienta como auditoría, deuda o reclamo.

### 2. Registro rápido

Abrir, tocar ítem, monto, guardar. Debe ser más rápido que anotar en WhatsApp.

Incluye:

- Acceso rápido.
- Ítems frecuentes.
- Teclado custom.
- Escaneo de tickets.
- Custom items desde búsqueda.

### 3. Gatito como compañía

El gatito no es solo mascota decorativa. Es una presencia emocional.

Puede:

- Acompañar el boot.
- Reaccionar a constancia.
- Estar feliz por hábitos.
- Dormir cuando todo está tranquilo.
- Traer pequeños mensajes no juzgadores.

No debe:

- Castigar.
- Dar culpa.
- Ser demasiado ruidoso.
- Interrumpir el flujo principal.

### 4. Estadísticas bonitas

No barras azules corporativas.

Usar narrativa:

- "Este mes el gato delivery apareció mucho."
- "El café estuvo presente casi todos los días."
- "La casa se llevó la mayor parte."

Las estadísticas deben explicar patrones sin convertirlos en juicio.

### 5. Coleccionables y personalización

Buen camino de monetización y retención.

Ideas:

- Gatos extra.
- Sombreros.
- Fondos.
- Casitas.
- Stickers.
- Temas.
- Pequeñas insignias.

Debe sentirse como personalización cozy, no casino ni grind.

## Features Que Encajan

- Widgets con mensajes del michi.
- Logros por constancia.
- Resumen mensual narrativo.
- Gatos/temas desbloqueables.
- Ahorros como "Miaurro" o metáfora equivalente.
- Export mensual bonito.
- Recordatorios suaves.
- Insights de pareja sin juicio.

## Features Riesgosas

- Presupuestos rígidos.
- Alertas de culpa.
- Rankings.
- Streaks punitivos.
- Demasiada economía avanzada.
- Automatización bancaria antes de clavar el ritual manual.
- Subscriptions agresivas.

## Tono de Voz

### Debe ser

- Cercano.
- Tierno.
- Claro.
- Colombiano/neutro latino cuando aplique.
- Un poco juguetón.
- Nunca condescendiente.

### Debe evitar

- "Transacción #381".
- "Has excedido tu presupuesto".
- "Mal manejo".
- "Deberías".
- Humor gatuno excesivo en cada línea.

### Ejemplos

Bueno:

- Guardado 🐾
- Casa actualizada.
- Michi encontró un patrón.
- Hoy todavía no registramos nada.
- Este mes estuvo movido.

Malo:

- Error financiero.
- Gastaste demasiado.
- Presupuesto incumplido.
- Transaction saved.
- Optimize your cashflow.

## Monetización

Principio: lo funcional debe ser gratis o muy accesible. La monetización debe sentirse como comprar cariño/estética, no como pagar para dejar de sufrir.

Modelo inicial recomendado:

- Free: registro, historial, vista Nosotros/Míos, básicos.
- Lifetime o one-time packs: gatos, temas, fondos, export bonito.
- Premium suave: estadísticas avanzadas, PDF, personalización extendida.

Evitar al inicio:

- Suscripción obligatoria.
- Paywalls en funcionalidades básicas.
- Límites diarios tipo Splitwise.
- Ads.

Hipótesis:

> Gatonomía monetiza mejor como compra emocional/cosmética que como SaaS financiero tradicional.

## Métricas Importantes

No medir solo "gastos registrados".

Métricas de salud:

- D1/D7/D30 retention.
- Usuarios que registran 3+ días en primera semana.
- Parejas donde ambos registran.
- Tiempo hasta primer gasto guardado.
- Uso de custom items.
- Toggle Nosotros/Míos.
- Sesiones sin crear ansiedad: usuarios vuelven después de ver stats.

Señales cualitativas:

- "Me gusta abrirla."
- "No me da culpa."
- "Mi pareja la usa."
- "Es linda."
- "La uso más que Notion/Excel."

## Producto Actual — Lo Que Ya Sabemos

Fortalezas:

- Identidad visual craft/gatitos ya diferenciada.
- Home editorial con brandmark persistente.
- Vista Nosotros/Míos.
- Custom items.
- Teclado custom.
- Escaneo de tickets.
- PWA mobile-first.
- Convex real-time.

Riesgos actuales:

- App todavía puede sentirse como tracker si crece sin dirección.
- Falta consolidar nombre Gatonomía en todos lados.
- Falta definir loop emocional del gato.
- Falta onboarding explícito de promesa.
- Falta estrategia de widgets/logros/personalización.

## Non-Goals

Gatonomía no busca ser:

- Banco.
- App de inversión.
- ERP doméstico.
- Splitwise completo.
- YNAB con gatos.
- Excel bonito.
- App infantil.

## Decisiones Pendientes

- Mantener Taganga como universo visual o migrarlo a solo background/mood.
- Default de vista: Nosotros vs Míos.
- Modelo premium exacto.
- Nombre de features: Miaurro, Gastitos, Refugio, etc.
- Nivel de gamificación permitido.

## Decisiones Ya Tomadas

- Tagline público inicial: "La app cozy para registrar gastos sin ansiedad."
- Relación emocional: el gato es un compañero silencioso.
- Loop sano: registrar cuida; gastar no alimenta.
- No competir como expense tracker funcionalista.
- No usar "Animal Crossing para tus gastos" como tagline público principal.
- No diseñar streaks punitivos.
- No convertir el gato en Clippy.

## Regla de Decisión

Ante una duda de producto, elegir la opción que:

1. Reduzca ansiedad financiera.
2. Haga más probable volver mañana.
3. Mantenga la app simple.
4. Refuerce identidad cozy/craft.
5. Ayude a parejas a hablar de plata sin pelea.

Si una feature aumenta poder pero también aumenta culpa, complejidad o sensación de trabajo, probablemente no va.

## Mantra

> Gatonomía no es para controlar cada peso. Es para mirar la plata con cariño, constancia y un gatito al lado.
