import { Clock, Trophy, Download } from 'lucide-react'
import { downloadModel } from '../api/client.js'
import MetricsPanel from '../components/MetricsPanel.jsx'
import ConfusionMatrix from '../components/ConfusionMatrix.jsx'
import { useState } from 'react'

const MODEL_ICONS = {
  logistic_regression: '📈',
  random_forest: '🌲',
  svm: '⚙️',
  knn: '📍',
  neural_network: '🧠',
}

export default function HistoryPage({ trainedModels }) {
  const [expanded, setExpanded] = useState(null)

  if (!trainedModels.length) {
    return (
      <div className="card flex items-center justify-center h-48">
        <div className="text-center">
          <Clock size={32} className="text-slate-700 mx-auto mb-3" />
          <div className="text-slate-500">No training history yet.</div>
          <div className="text-slate-600 text-sm">Train a model to see it here.</div>
        </div>
      </div>
    )
  }

  const bestId = trainedModels.reduce((b, m) => m.metrics.f1_score > (b?.metrics.f1_score || 0) ? m : b, null)?.model_id

  return (
    <div>
      <h1 style={{ fontFamily: 'Syne, sans-serif' }} className="text-2xl font-bold text-white mb-6">
        Training History
      </h1>
      <div className="space-y-3">
        {trainedModels.map(m => (
          <div key={m.model_id} className="card cursor-pointer hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between" onClick={() => setExpanded(expanded === m.model_id ? null : m.model_id)}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{MODEL_ICONS[m.model_type] || '🤖'}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white capitalize">{m.model_type.replace(/_/g, ' ')}</span>
                    {m.model_id === bestId && (
                      <span className="badge bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <Trophy size={10} /> Best
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">{m.model_id} · {new Date(m.created_at).toLocaleTimeString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden sm:grid grid-cols-3 gap-4 text-center text-xs">
                  <div>
                    <div className="text-slate-500">Accuracy</div>
                    <div className="text-blue-400 font-mono font-semibold">{(m.metrics.accuracy * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-slate-500">F1</div>
                    <div className="text-emerald-400 font-mono font-semibold">{(m.metrics.f1_score * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-slate-500">AUC</div>
                    <div className="text-purple-400 font-mono font-semibold">{(m.metrics.roc_auc * 100).toFixed(1)}%</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={downloadModel(m.model_id)} className="btn-secondary text-xs px-2.5 py-1.5"
                    onClick={e => e.stopPropagation()}>
                    <Download size={12} />
                  </a>
                  <span className="text-slate-600 text-lg">{expanded === m.model_id ? '▲' : '▼'}</span>
                </div>
              </div>
            </div>

            {expanded === m.model_id && (
              <div className="mt-5 pt-5 border-t border-slate-800 space-y-4 fade-in">
                <MetricsPanel metrics={m.metrics} trainingTime={m.training_time} />
                <ConfusionMatrix matrix={m.metrics.confusion_matrix} />
                {m.feature_importance && (
                  <div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Feature Importance (Top 10)</div>
                    <div className="space-y-1.5">
                      {Object.entries(m.feature_importance).map(([feat, imp]) => (
                        <div key={feat} className="flex items-center gap-3">
                          <div className="w-10 text-xs font-mono text-slate-500 text-right">{feat}</div>
                          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${(imp / Math.max(...Object.values(m.feature_importance))) * 100}%` }}
                            />
                          </div>
                          <div className="w-12 text-xs font-mono text-slate-400 text-right">{(imp * 100).toFixed(2)}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
