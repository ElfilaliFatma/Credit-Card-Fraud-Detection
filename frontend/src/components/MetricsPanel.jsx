import { TrendingUp, Target, Activity, BarChart2, Clock } from 'lucide-react'

const metrics = [
  { key: 'accuracy', label: 'Accuracy', icon: Target, color: 'blue' },
  { key: 'f1_score', label: 'F1 Score', icon: TrendingUp, color: 'emerald' },
  { key: 'roc_auc', label: 'ROC AUC', icon: Activity, color: 'purple' },
  { key: 'precision', label: 'Precision', icon: BarChart2, color: 'amber' },
  { key: 'recall', label: 'Recall', icon: BarChart2, color: 'cyan' },
]

const colorMap = {
  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
}

export default function MetricsPanel({ metrics: data, trainingTime }) {
  if (!data) return null

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {metrics.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className={`metric-card border ${colorMap[color]}`}>
            <div className="flex items-center gap-1.5 mb-2">
              <Icon size={12} />
              <span className="text-xs font-medium">{label}</span>
            </div>
            <div className="text-xl font-bold font-mono" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {(data[key] * 100).toFixed(1)}
              <span className="text-sm font-normal">%</span>
            </div>
          </div>
        ))}
      </div>
      {trainingTime && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
          <Clock size={11} />
          Training time: <span className="text-slate-400 font-mono">{trainingTime}s</span>
        </div>
      )}
    </div>
  )
}
