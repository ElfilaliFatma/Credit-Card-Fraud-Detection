export default function ConfusionMatrix({ matrix }) {
  if (!matrix || matrix.length !== 2) return null

  const [[tn, fp], [fn, tp]] = matrix
  const total = tn + fp + fn + tp

  const cells = [
    { label: 'TN', value: tn, sub: 'True Negative', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'FP', value: fp, sub: 'False Positive', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'FN', value: fn, sub: 'False Negative', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    { label: 'TP', value: tp, sub: 'True Positive', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  ]

  return (
    <div>
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Confusion Matrix</div>
      <div className="flex gap-3 items-center flex-wrap">
        <div className="grid grid-cols-2 gap-1.5">
          {cells.map(c => (
            <div key={c.label} className={`p-3 rounded-lg border ${c.bg} text-center min-w-[70px]`}>
              <div className={`text-lg font-bold font-mono ${c.color}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {c.value.toLocaleString()}
              </div>
              <div className="text-xs font-semibold text-slate-400 mt-0.5">{c.label}</div>
              <div className="text-xs text-slate-600">{c.sub}</div>
            </div>
          ))}
        </div>
        <div className="text-xs text-slate-600 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Predicted: No Fraud
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Predicted: Fraud
          </div>
          <div className="mt-2 text-slate-500">Total: {total.toLocaleString()}</div>
        </div>
      </div>
    </div>
  )
}
