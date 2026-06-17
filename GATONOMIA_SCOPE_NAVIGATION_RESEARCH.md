# Gatonomía: investigación de navegación y scope

Fecha: 2026-06-17  
Estado: investigación de producto/UX, sin implementación  
Ámbito: selector `Nosotros | Míos`, brandmark/gatitos, navegación mobile-first

## Resumen ejecutivo

El problema actual no es solo visual. Es un desacople entre el modelo de producto y la presentación: un scope global de datos se está renderizando como parte de un brandmark decorativo en el área más sensible del Home.

La recomendación principal es separar identidad emocional y control funcional:

- El brandmark/gatito debe seguir siendo identidad, compañía y señal emocional.
- El selector de scope debe ser un control claro, textual y accesible.
- El gato puede seguir reflejando el estado de forma pasiva: 1 gato para `Míos`, 2 gatos para `Nosotros` o espacios compartidos.
- El control textual no debería vivir pegado al brandmark.
- El modelo debería evolucionar hacia `Espacios`: `Míos`, `Nosotros`, `Casa`, `Viaje Tayrona`, `Amigos`, etc.

Recomendación principal: usar un `context pill` tipo `Nosotros ▾` que abra una sheet de espacios.  
Recomendación mínima: mover el selector binario a una fila pequeña debajo del título/header, desacoplado del gatito, y nombrarlo internamente como `SpaceSwitcher` para preparar el futuro.

No se recomienda mover el selector al bottom nav ni mantenerlo acoplado al brandmark.

## Contexto del producto

Gatonomía es una app cozy/craft para registrar gastos personales y compartidos sin ansiedad. La estética busca sentirse como una libreta ilustrada/artesanal con gatitos, cerámica, papel, Taganga, UI emocional y cero culpa.

El Home tiene:

- Título editorial `Gatonomía`.
- Brandmark/gatito.
- BottomNav con `Inicio`, `Calendario`, `Casa`.
- Scope global `Nosotros | Míos`.

El scope afecta:

- Home.
- Calendar.
- Stats.
- Quick actions.
- Recent expenses.
- Totals.

Hoy el brandmark puede mostrar:

- 1 gatito para `Míos`.
- 2 gatitos para `Nosotros`.

Esa idea se quiere conservar, pero sin que el control invada el título ni compita con los gatitos.

## Problema observado

En mobile Safari, especialmente en pantallas de 360-430px:

- El selector flota junto al brandmark.
- Invade o corta el título `Gatonomía`.
- Compite visualmente con los gatitos.
- Entorpece la lectura del header.
- Suma ruido a la zona superior, que ya contiene safe area, título editorial, collage/hero y movimiento de scroll.
- Se siente como un parche de UI, no como una arquitectura de navegación.

Además, `Nosotros` no debería quedar hardcodeado como la única forma de gasto compartido. En el futuro puede representar múltiples espacios:

- Pareja/casa.
- Amigos.
- Viaje Tayrona.
- Grupo temporal.
- Subgrupos dentro de household.
- Espacio privado `Míos`.

## Lectura del repo actual

La arquitectura actual ya tiene algo valioso: el estado de scope está centralizado.

`App.tsx` usa `ExpenseViewProvider` y pasa `view`/`setView` al dock del brandmark. Home, Calendar y Stats consumen el mismo estado vía `useExpenseView`.

El problema está en la capa de presentación:

- `AppBrandmarkDock` renderiza un único brandmark fijo para toda la app.
- Ese brandmark se traduce verticalmente según el scroll de cada tab.
- `EditorialBrandmark` contiene tanto los gatitos como `ExpenseViewFilter`.
- Por eso el control hereda el footprint, movimiento y prioridad visual del brandmark.

El estado no necesita cambiar ahora. La presentación sí.

## Hallazgos de investigación

### 1. Controles segmentados en mobile

Los controles segmentados funcionan bien cuando:

- Hay pocas opciones, idealmente 2-4.
- Las opciones son mutuamente excluyentes.
- El control cambia una vista, filtro o presentación dentro del contexto actual.
- Las etiquetas son cortas.
- El touch target es cómodo.

Material Design limita los segmented buttons a elecciones simples entre 2-5 opciones y, en Material 3 Expressive, recomienda reemplazarlos por connected button groups.

Apple permite colocar un segmented control en una navigation bar cuando ayuda a aplanar la jerarquía, pero advierte que si se usa ahí no debería convivir con título ni otros controles. En otras palabras: si el segmento ocupa el header, reemplaza la función del título; no se amontona junto a él.

Implicación para Gatonomía: `Nosotros | Míos` puede funcionar como control binario de corto plazo, pero no debería compartir esquina con título, gato y sync sticker. Si se usa como segmented control, debe vivir en su propia fila estable.

### 2. Scope global vs filtro local

`Nosotros | Míos` no es un filtro local de una card. Cambia el significado de toda la app:

- Los totales cambian.
- Las acciones rápidas cambian.
- Los gastos recientes cambian.
- Calendar cambia.
- Stats cambia.

Por eso necesita comportarse como contexto global o espacio activo, no como toggle decorativo.

En productos colaborativos, los scopes globales suelen representarse como:

- Workspace switchers.
- Team switchers.
- Group selectors.
- Account/team context menus.
- Project or space selectors.

Estos patrones dan un landmark claro: “estoy en este lugar”.

### 3. Context switching y carga cognitiva

NN/g describe el cambio de contexto como un reset cognitivo: el usuario necesita recuperar qué está mirando, qué datos aplican y qué acciones son válidas.

Para reducir esa carga, el producto debe dar señales consistentes:

- Nombre visible del contexto actual.
- Ubicación estable.
- Estado seleccionado accesible.
- Cambios predecibles entre pantallas.
- Landmark visual que no dependa solo de decoración.

Implicación para Gatonomía: el gatito puede ayudar como landmark emocional, pero no debe ser el único indicador. El texto del espacio activo debe existir.

### 4. Apps comparables

Slack separa workspaces de navegación interna. En mobile, el workspace switcher se abre desde un gesto/menú y no compite con cada título de pantalla. Slack también ha trabajado en vistas unificadas para reducir switching cuando los usuarios pertenecen a muchos workspaces.

Figma organiza por organización, equipo, proyecto y archivo. El selector de organización/equipo vive como contexto de navegación, no como adorno.

Notion usa workspaces/teamspaces y una sidebar para organizar contextos. El patrón relevante es que el espacio es un contenedor semántico, no un booleano.

Splitwise usa grupos y amigos como unidades centrales. Sus rediseños movieron grupos/friends a navegación visible porque son la forma principal de entender balances y gastos compartidos.

Implicación para Gatonomía: si el futuro incluye `Casa`, `Amigos`, `Viaje Tayrona`, etc., conviene modelar esto como espacios desde la UI aunque el backend siga binario por ahora.

### 5. iOS Safari/PWA

Mobile Safari y PWAs en iOS exigen especial cuidado con:

- Safe areas.
- Headers fijos o sticky.
- Contenido detrás de barras.
- `100vh`/`100dvh` y visual viewport.
- Scroll performance.
- Capas flotantes con transform.

En este repo ya hay señales de cuidado técnico:

- `--vv-height`.
- `--keyboard-height`.
- `env(safe-area-inset-bottom)`.
- `-webkit-overflow-scrolling: touch`.
- `requestAnimationFrame` para reportar scroll.

Pero el brandmark actual usa un dock fixed con transform según scroll. Eso puede ser aceptable para una ilustración pasiva, pero no es ideal para un control global táctil y textual. Un control funcional debería vivir en una capa estable, con hit area clara y sin depender del movimiento del brandmark.

## Principios de decisión para Gatonomía

1. Separar emoción de control.  
   El gato acompaña; el scope decide.

2. Hacer visible el contexto actual.  
   El usuario debe saber si está mirando `Míos`, `Nosotros` u otro espacio sin deducirlo por decoración.

3. Diseñar para espacios futuros desde ahora.  
   No hardcodear el producto alrededor de un booleano permanente.

4. No competir con el título editorial.  
   `Gatonomía` debe respirar. El selector no debe cortar, tapar ni disputarle jerarquía.

5. Mobile first.  
   Todo debe funcionar en 360-430px, con Safari iOS/PWA, safe areas y scroll.

6. Cozy, no dashboard corporativo.  
   El patrón puede venir de workspaces, pero la expresión visual debe ser papel, cerámica, libreta, no SaaS enterprise.

7. Accesibilidad primero.  
   El estado seleccionado debe ser textual, anunciable y tocable con target suficiente.

## Comparación de patrones

### Opción 1: Context pill + sheet

Nombre del patrón: `Context pill + space sheet`.

Descripción: mostrar el espacio actual como una pequeña píldora textual, por ejemplo `Nosotros ▾`, que abre una bottom sheet con espacios disponibles.

Home: el título `Gatonomía` queda limpio. La píldora aparece debajo del título o en una fila secundaria del header, sin tocar el brandmark.

Calendar/Stats: la misma píldora aparece debajo del header de pantalla o en una zona consistente superior. El título de pantalla sigue siendo primario.

1 gatito vs 2 gatitos: el gatito queda como indicador pasivo. `Míos` muestra 1 gato; espacios compartidos muestran 2 gatos o una variante de grupo. El texto de la píldora sigue siendo la fuente principal de verdad.

Escala a múltiples grupos: muy bien. La sheet puede listar `Míos`, `Nosotros`, `Casa`, `Viaje Tayrona`, `Amigos`, crear/gestionar espacios, mostrar miembros y descripciones.

Pros:

- Prepara el futuro multi-grupo.
- Separa identidad y control.
- Da un landmark claro.
- Funciona en mobile.
- Puede sentirse cozy si la sheet se diseña como libreta/papel.

Contras:

- Más implementación que mover un toggle.
- Requiere definir copy y estructura mínima de espacios.
- Si se oculta demasiado, puede perder descubribilidad; la píldora debe ser visible.

Riesgos de implementación:

- Crear una sheet demasiado pesada.
- Hacerla parecer selector corporativo.
- Mezclar demasiado pronto conceptos que backend aún no soporta.

Impacto emocional/cozy:

- Alto si se expresa como “espacios de la libreta”.
- Puede sentirse íntimo: `Mi libreta`, `Casa`, `Viaje Tayrona`.

Impacto en claridad/accesibilidad:

- Alto. Nombre visible, botón claro, estado seleccionable.

Conviene para Gatonomía ahora:

Sí. Es la recomendación principal, aunque puede implementarse por etapas.

### Opción 2: Tab pequeña debajo del título

Nombre del patrón: `Inline segmented scope row`.

Descripción: mover `Nosotros | Míos` a una fila debajo del título, full-width o inline, desacoplada del gato.

Home: aparece debajo de `Gatonomía` o debajo del bloque editorial, con suficiente aire. No flota junto al brandmark.

Calendar/Stats: aparece debajo de `Calendario`/`Estadísticas`, en la misma posición relativa.

1 gatito vs 2 gatitos: el gato sigue cambiando de 1 a 2, pero el control vive aparte.

Escala a múltiples grupos: mal si se mantiene como segmented control. Puede funcionar solo como paso intermedio.

Pros:

- Implementación simple.
- Resuelve el choque visual inmediato.
- Mantiene visibilidad alta.
- Es fácil de entender para el usuario actual.

Contras:

- Refuerza el modelo binario.
- No escala a más de 2-3 espacios.
- Puede ocupar altura vertical en pantallas pequeñas.

Riesgos de implementación:

- Que se codifique como `ExpenseViewFilter` permanente y luego cueste migrar.
- Que en pantallas pequeñas siga compitiendo si se pone demasiado cerca del título.

Impacto emocional/cozy:

- Bueno si se diseña como chip de papel/cerámica.
- Menos “mágico” que una sheet de espacios, pero claro.

Impacto en claridad/accesibilidad:

- Alto para dos opciones.
- Menor cuando aparezcan grupos futuros.

Conviene para Gatonomía ahora:

Sí como alternativa mínima o fase 1, siempre que se nombre internamente como `SpaceSwitcher`.

### Opción 3: Scope en bottom nav/controller

Nombre del patrón: `Bottom global mode control`.

Descripción: mover el scope al bottom nav o a una banda junto al bottom nav.

Home: el header queda limpio; el modo se cambia abajo.

Calendar/Stats: el control está siempre cerca del pulgar.

1 gatito vs 2 gatitos: el gato podría seguir reflejando el scope, pero el control queda lejos del header.

Escala a múltiples grupos: moderado si se convierte en botón de espacio, malo si se vuelve otra barra segmentada.

Pros:

- Ergonomía de pulgar.
- Libera el header.
- Puede ser persistente.

Contras:

- Compite con navegación primaria.
- Apple distingue tab bars para secciones y toolbars para acciones; mezclar un mode switch global con tabs puede confundir.
- Riesgo de “glass sandwich”: bottom nav + FAB + banners + selector.
- Menos relación espacial con el contenido que cambia.

Riesgos de implementación:

- Romper jerarquía del BottomNav.
- Aumentar ruido en una zona ya ocupada por FAB, safe area y PWA banners.

Impacto emocional/cozy:

- Medio. Puede sentirse como controlador de app, menos libreta.

Impacto en claridad/accesibilidad:

- Medio. Accesible al pulgar, pero ambiguo como navegación vs modo.

Conviene para Gatonomía ahora:

No como solución principal.

### Opción 4: Header editorial sin toggle visible; scope en menú/sheet

Nombre del patrón: `Hidden contextual menu`.

Descripción: Home mantiene el header editorial sin selector visible. El scope se abre desde un menú o gesto.

Home: muy limpio, sin toggle.

Calendar/Stats: podrían mostrar solo el espacio actual o esconderlo detrás de menú.

1 gatito vs 2 gatitos: el gato funciona como señal pasiva.

Escala a múltiples grupos: bien a nivel arquitectura.

Pros:

- Máxima limpieza visual.
- Preserva el tono editorial.
- Escala a espacios.

Contras:

- Baja descubribilidad.
- Riesgo de que el usuario no entienda qué datos está mirando.
- Si el scope afecta toda la app, esconderlo demasiado puede generar errores.

Riesgos de implementación:

- Depender demasiado del gato como señal.
- Crear una interacción demasiado sutil para una función importante.

Impacto emocional/cozy:

- Alto visualmente.
- Potencialmente ansioso si el usuario no sabe dónde está.

Impacto en claridad/accesibilidad:

- Bajo a medio, dependiendo de cómo se indique el estado actual.

Conviene para Gatonomía ahora:

No como única solución. Puede combinarse con context pill visible.

### Opción 5: Mantener brandmark + toggle acoplados

Nombre del patrón: `Brandmark-coupled toggle`.

Descripción: mantener gatitos y control textual como una sola unidad flotante.

Home: igual al estado actual.

Calendar/Stats: el dock global sigue flotando y traduciéndose por scroll.

1 gatito vs 2 gatitos: funciona visualmente, pero mezcla indicador y control.

Escala a múltiples grupos: mal. El layout no soporta nombres largos ni muchos contextos.

Pros:

- Ya existe.
- Conserva una asociación directa entre gatos y scope.

Contras:

- Compite con el título.
- Se rompe en mobile Safari.
- Mezcla decoración con control.
- No escala.
- Puede entorpecer scroll y percepción visual.

Riesgos de implementación:

- Seguir acumulando parches de CSS.
- Hacer el brandmark cada vez más complejo.

Impacto emocional/cozy:

- Inicialmente simpático, pero invasivo cuando tapa contenido.

Impacto en claridad/accesibilidad:

- Bajo. El control está en una zona decorativa y móvil.

Conviene para Gatonomía ahora:

No. Conviene retirarlo.

## Evaluación de hipótesis

### A. Separar brandmark y scope switcher

Validada. Es el principio central.

El gatito debe ser identidad/emoción; el scope switcher debe ser control. Pueden estar coordinados, pero no acoplados en el mismo componente visual.

### B. Convertir `Nosotros/Míos` en una tab pequeña debajo del título

Válida como implementación mínima.

Debe ser una fila estable, con buen touch target, sin competir con `Gatonomía`. Debe evitar el nombre interno rígido `ExpenseViewFilter` como concepto final.

### C. Mover scope switcher al bottom/nav/controller

No recomendada como principal.

Aunque mejora ergonomía del pulgar, mezcla navegación primaria con modo global y suma ruido a la zona inferior, donde ya viven BottomNav, FAB, safe area y banners.

### D. Usar `context pill` tipo `Nosotros ▾`

Validada y recomendada.

Es el mejor puente entre el estado actual y el futuro multi-espacio.

### E. Home editorial sin toggle visible; scope en sheet/context menu

Parcialmente válida.

El Home puede respirar más, pero el espacio actual debe seguir visible. No conviene esconder por completo una decisión que afecta todos los datos.

### F. Gatitos como indicador visual pasivo

Validada.

1 gato vs 2 gatos es una buena señal emocional, pero debe ser redundante. El texto y los controles accesibles son la fuente principal.

### G. Modelo `Espacios`

Validada.

`Míos` y `Nosotros` deberían ser espacios iniciales, no un booleano permanente. Esto evita bloquear `Casa`, `Amigos`, `Viaje Tayrona` y grupos temporales.

## Recomendación principal

Crear un patrón de `Espacio activo`:

- Mostrar una píldora pequeña con el espacio actual: `Míos`, `Nosotros`, `Casa`, etc.
- La píldora abre una bottom sheet de selección.
- La sheet lista espacios con nombre, tipo y señal de miembros/privacidad.
- El brandmark solo muestra gatitos y estado emocional.
- El gato cambia pasivamente según el tipo de espacio.
- Home, Calendar y Stats comparten ubicación y lenguaje del espacio activo.

Arquitectura visual:

1. Identidad: `Gatonomía` + gatito.
2. Contexto: `Nosotros ▾` como píldora textual.
3. Navegación primaria: BottomNav.
4. Contenido: totals, recents, stats, calendar.

Arquitectura conceptual:

```ts
type SpaceKind = 'private' | 'household' | 'group' | 'trip'

type Space = {
  id: string
  name: string
  kind: SpaceKind
  memberCount?: number
  isPrivate?: boolean
}
```

No hace falta implementar este tipo ahora ni tocar backend. Puede empezar como adapter frontend:

- `personal` -> `Míos`
- `shared` -> `Nosotros`

## Recomendación alternativa mínima

Si se quiere resolver rápido sin abrir la arquitectura completa:

1. Quitar `ExpenseViewFilter` de `EditorialBrandmark`.
2. Dejar `EditorialBrandmark` como gato(s) + sync sticker si aplica.
3. Crear un componente `SpaceSwitcher` o `ExpenseContextSwitcher`.
4. Renderizarlo debajo del título de Home y debajo de headers de Calendar/Stats.
5. Mantener por ahora dos opciones: `Nosotros` y `Míos`.
6. Evitar que el componente viva dentro del dock fixed del brandmark.
7. Mantener el gato como indicador pasivo sincronizado.

Esta alternativa arregla el problema visual inmediato, preserva claridad y deja un camino para la sheet futura.

## Propuesta de navegación/scope a futuro

### Modelo mental

Gatonomía no tiene solo “personal vs compartido”. Tiene libretas o espacios de gasto.

Espacios iniciales:

- `Míos`: privado.
- `Nosotros`: compartido principal.

Espacios futuros:

- `Casa`.
- `Viaje Tayrona`.
- `Amigos`.
- `Grupo temporal`.
- `Subgrupo household`.

### Jerarquía de navegación

Nivel 1: espacio activo  
Determina qué datos se muestran.

Nivel 2: sección de app  
`Inicio`, `Calendario`, `Casa/Stats`.

Nivel 3: acciones y vistas locales  
Agregar gasto, escanear recibo, editar gasto, filtrar mes, abrir detalle.

Esto evita que BottomNav tenga que cargar con el scope.

### Persistencia

El espacio activo puede seguir persistiéndose como preferencia de usuario. En la fase actual, puede mapearse al `expenseView` existente.

## Reglas visuales para integrar el switcher

1. El control es papel; el gato es compañero.  
   Usar superficies tipo chip, porcelana o libreta para la interacción. No convertir al gato en botón principal.

2. No apilar en la esquina superior.  
   Evitar juntar safe area, title, brandmark, sync sticker y scope control.

3. El título editorial manda.  
   `Gatonomía` debe quedar limpio y legible.

4. El scope debe ser legible a 360px.  
   Los nombres pueden crecer: `Viaje Tayrona`, `Casa`, `Amigos`.

5. El estado no depende del color.  
   Debe tener texto, selected state y aria label.

6. Touch target mínimo cómodo.  
   Evitar chips diminutos como control primario.

7. Animación suave, no distractora.  
   El cambio de gatos puede tener transición cozy, pero el control no debe ralentizar la lectura.

8. Cozy, no infantil.  
   Evitar exceso de emojis en el control. Preferir copy cálido: `Mi libreta`, `Nosotros`, `Casa`, `Viaje`.

## Sugerencia concreta para implementación en este repo

Sin tocar backend:

1. Crear un componente frontend:

```tsx
SpaceSwitcher
```

o:

```tsx
ExpenseContextSwitcher
```

2. Por ahora recibe:

```ts
value: ExpenseView
onChange: (view: ExpenseView) => void
variant?: 'inline' | 'pill'
```

3. Internamente mapea:

```ts
personal -> Míos
shared -> Nosotros
```

4. Mover la UI de `ExpenseViewFilter` fuera de `EditorialBrandmark`.

5. Mantener `EditorialBrandmark` como:

- Gatitos.
- Animación.
- Pending sticker si corresponde.
- Sin control textual de scope.

6. Renderizar el switcher:

- En Home: debajo del bloque de título o como row secundaria dentro de `EditorialStage`, no dentro del `BrandmarkSlot`.
- En Calendar/Stats: debajo de `EditorialScreenHeader` o como parte de un subheader consistente.

7. Nombrar clases y componente pensando en espacio/contexto, no en toggle binario.

8. En una fase posterior, cambiar `variant="pill"` para abrir bottom sheet sin tocar los consumidores.

## Decisión recomendada

Adoptar ahora la separación brandmark/control.

Implementar primero una versión mínima del `SpaceSwitcher` desacoplado, pero diseñar su API como si fuera el futuro selector de espacios.

Luego evolucionar a `Context pill + sheet` cuando existan más espacios que `Míos` y `Nosotros`.

## Fuentes

- [Apple HIG: Navigation Bars](https://codershigh.github.io/guidelines/ios/human-interface-guidelines/ui-bars/navigation-bars/index.html)
- [Apple Developer: UISegmentedControl](https://developer.apple.com/documentation/uikit/uisegmentedcontrol)
- [Apple Developer: Adopting Liquid Glass](https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass?changes=latest_major%2Clatest_major)
- [Material Design 3: Segmented buttons](https://m3.material.io/components/segmented-buttons/overview)
- [Material Design 3: Button groups](https://m3.material.io/components/button-groups/guidelines)
- [Nielsen Norman Group: Tabs, Used Right](https://www.nngroup.com/articles/tabs-used-right/?lm=ai-sparkles-icon-problem&pt=article)
- [Nielsen Norman Group: Designing for Serial Task Switching](https://www.nngroup.com/articles/serial-task-switching/)
- [Slack Design: Re-designing Slack on Mobile](https://slack.design/articles/re-designing-slack-on-mobile/)
- [Slack Help: Switch between workspaces](https://slack.com/intl/en-gb/help/articles/1500002200741-Switch-between-workspaces)
- [Splitwise Blog: Android 5.0](https://blog.splitwise.com/2021/04/05/splitwise-for-android-v5-0/)
- [Splitwise Blog: iOS version 4](https://blog.splitwise.com/2015/06/04/announcing-splitwise-for-ios-version-4/)
- [Figma Help: Guide to the file browser](https://help.figma.com/hc/en-us/articles/14381406380183-Guide-to-the-file-browser)
