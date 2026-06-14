import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

const COLORS = ['#3d5a80', '#4a6fa5', '#c4725a', '#a85a44', '#b8c4b0', '#e8cfc4', '#2a4060', '#b8a898']

export interface ChartRow {
  id: string
  label: string
  emoji: string
  amount: number
}

interface CategoryDonutChartProps {
  rows: ChartRow[]
}

export default function CategoryDonutChart({ rows }: CategoryDonutChartProps) {
  const data = rows.map((r) => ({
    name: `${r.emoji} ${r.label}`,
    value: r.amount,
  }))

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="52%"
            outerRadius="78%"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
