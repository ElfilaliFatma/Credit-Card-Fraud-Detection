import { BarChart3, Download, Trash2, Trophy } from 'lucide-react'
import { RocCurveChart, PrCurveChart, MetricsBarChart } from './Charts.jsx'
import { exportCsv } from '../api/client.js'

const MODEL_ICONS = {
  logistic_regression: '📈',
  random_forest: '🌲',
  svm: '⚙️',
  knn: '📍',
  neural_network: '🧠',
}

export default function ModelComparisonSection({ models }) {
  if (!models?.length) {
    return (
      <div className="card fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-purple-600/20 rounded-lg flex items-center justify-center border border-purple-600/30">
            <BarChart3 size={18} className="text-purple-400" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif' }} className="text-lg font-bold text-white">
              Model Comparison
            </h2>
            <p className="text-xs text-slate-500">Compare all trained models side by side</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-32 border border-dashed border-slate-700 rounded-xl">
          <span className="text-slate-600 text-sm">Train models to see comparison</span>
        </div>
      </div>
    )
  }

  // Find best model by F1
  const bestModelId = models.reduce((best, m) => 
    m.metrics.f1_score > (best?.metrics.f1_score || 0) ? m : best, null
  )?.model_id

  return (
    <div className="card fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-600/20 rounded-lg flex items-center justify-center border border-purple-600/30">
            <BarChart3 size={18} className="text-purple-400" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif' }} className="text-lg font-bold text-white">
              Model Comparison
            </h2>
            <p className="text-xs text-slate-500">{models.length} model{models.length > 1 ? 's' : ''} trained</p>
          </div>
        </div>
        <a href={exportCsv()} className="btn-secondary text-xs px-3 py-1.5">
          <Download size={12} /> Export CSV
        </a>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left text-xs font-medium text-slate-500 uppercase pb-3 pr-4">Model</th>
              <th className="text-right text-xs font-medium text-slate-500 uppercase pb-3 px-3">Accuracy</th>
              <th className="text-right text-xs font-medium text-slate-500 uppercase pb-3 px-3">F1 Score</th>
              <th className="text-right text-xs font-medium text-slate-500 uppercase pb-3 px-3">ROC AUC</th>
              <th className="text-right text-xs font-medium text-slate-500 uppercase pb-3 px-3">Precision</th>
              <th className="text-right text-xs font-medium text-slate-500 uppercase pb-3 px-3">Recall</th>
              <th className="text-right text-xs font-medium text-slate-500 uppercase pb-3 pl-3">Time (s)</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m, i) => (
              <tr key={m.model_id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{MODEL_ICONS[m.model_type] || '🤖'}</span>
                    <div>
                      <div className="text-slate-200 font-medium capitalize">
                        {m.model_type.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-slate-600 font-mono">{m.model_id}</div>
                    </div>
                    {m.model_id === bestModelId && (
                      <Trophy size={12} className="text-amber-400 ml-1" />
                    )}
                  </div>
                </td>
                <MetricCell value={m.metrics.accuracy} />
                <MetricCell value={m.metrics.f1_score} highlight />
                <MetricCell value={m.metrics.roc_auc} />
                <MetricCell value={m.metrics.precision} />
                <MetricCell value={m.metrics.recall} />
                <td className="py-3 pl-3 text-right font-mono text-xs text-slate-400">
                  {m.training_time}s
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RocCurveChart models={models} />
        <PrCurveChart models={models} />
        <MetricsBarChart models={models} />
      </div>
    </div>
  )
}

function MetricCell({ value, highlight }) {
  const pct = (value * 100).toFixed(1)
  const color = value >= 0.9 ? 'text-emerald-400' : value >= 0.8 ? 'text-blue-400' : 'text-amber-400'
  return (
    <td className={`py-3 px-3 text-right font-mono text-sm font-semibold ${highlight ? color : 'text-slate-300'}`}
      style={{ fontFamily: 'JetBrains Mono, monospace' }}>
      {pct}%
    </td>
  )
}
