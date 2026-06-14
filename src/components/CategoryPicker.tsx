import { CATEGORIES } from '@/lib/categories'
import { getRecentCategories } from '@/lib/preferences'
import { ExpenseChip } from '@/components/ExpenseChip'
import { cn } from '@/lib/utils'

interface CategoryPickerProps {
  showDetail: boolean
  hideDetailToggle?: boolean
  selectedCategoryId?: string | null
  onToggleDetail: () => void
  onSelect: (categoryId: string) => void
}

export function CategoryPicker({
  showDetail,
  hideDetailToggle,
  selectedCategoryId,
  onToggleDetail,
  onSelect,
}: CategoryPickerProps) {
  const recentIds = getRecentCategories()
  const recent = recentIds
    .map((id) => CATEGORIES.find((c) => c.id === id))
    .filter(Boolean) as typeof CATEGORIES
  const recentSet = new Set(recentIds)
  const rest = CATEGORIES.filter((c) => !recentSet.has(c.id))

  return (
    <div className="pb-2">
      <div className="flex items-center justify-between mb-4">
        <p className="font-display text-sm font-bold text-foreground">Categoría</p>
        {!hideDetailToggle && (
          <button
            type="button"
            onClick={onToggleDetail}
            className={cn(
              'text-xs font-bold px-3 py-1.5 rounded-full transition-all',
              showDetail
                ? 'btn-cobalt active:translate-y-px'
                : 'chip-tile text-muted-foreground'
            )}
          >
            Detalle
          </button>
        )}
      </div>

      {recent.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="label-stitch">Recientes</p>
          <div className="grid grid-cols-3 gap-2">
            {recent.map((cat) => (
              <ExpenseChip
                key={cat.id}
                emoji={cat.emoji}
                label={cat.label}
                active={selectedCategoryId != null ? selectedCategoryId === cat.id : true}
                onClick={() => onSelect(cat.id)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="label-stitch">Todas</p>
        <div className="grid grid-cols-3 gap-2">
          {rest.map((cat) => (
            <ExpenseChip
              key={cat.id}
              emoji={cat.emoji}
              label={cat.label}
              active={selectedCategoryId === cat.id}
              onClick={() => onSelect(cat.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
