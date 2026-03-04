import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, ResponsiveContainer, ReferenceLine
} from 'recharts'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ef4444']
const MODEL_LABELS = {
  logistic_regression: 'Logistic Reg.',
  random_forest: 'Random Forest',
  svm: 'SVM',
  knn: 'KNN',
  neural_network: 'Neural Net'
}

// ─── ROC Curve ────────────────────────────────────────────────────────────────
export function RocCurveChart({ models }) {
  if (!models?.length) return <EmptyChart label="ROC Curve" />

  const allLines = models
    .filter(m => m.metrics?.roc_curve)
    .map((m, i) => {
      const { fpr, tpr } = m.metrics.roc_curve
      return {
        key: m.model_id,
        label: MODEL_LABELS[m.model_type] || m.model_type,
        color: COLORS[i % COLORS.length],
        data: fpr.map((x, j) => ({ x: parseFloat(x.toFixed(3)), y: parseFloat(tpr[j].toFixed(3)) }))
      }
    })

  // Merge all x points for unified chart
  const xSet = new Set()
  allLines.forEach(l => l.data.forEach(p => xSet.add(p.x)))
  const xs = Array.from(xSet).sort((a, b) => a - b)

  const merged = xs.map(x => {
    const pt = { x }
    allLines.forEach(l => {
      const closest = l.data.reduce((a, b) => Math.abs(b.x - x) < Math.abs(a.x - x) ? b : a)
      pt[l.key] = closest.y
    })
    return pt
  })

  return (
    <div>
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">ROC Curve</div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={merged} margin={{ top: 5, right: 10, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="x" tick={{ fill: '#64748b', fontSize: 10 }} label={{ value: 'FPR', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 10 }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} label={{ value: 'TPR', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
          <ReferenceLine data={[{x:0,y:0},{x:1,y:1}]} strokeDasharray="4 4" stroke="#334155" />
          {allLines.map(l => (
            <Line key={l.key} type="monotone" dataKey={l.key} name={l.label}
              stroke={l.color} dot={false} strokeWidth={2} />
          ))}
          <Legend iconType="line" iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── PR Curve ─────────────────────────────────────────────────────────────────
export function PrCurveChart({ models }) {
  if (!models?.length) return <EmptyChart label="Precision-Recall Curve" />

  const allLines = models
    .filter(m => m.metrics?.pr_curve)
    .map((m, i) => ({
      key: m.model_id,
      label: MODEL_LABELS[m.model_type] || m.model_type,
      color: COLORS[i % COLORS.length],
      data: m.metrics.pr_curve.recall.map((x, j) => ({
        x: parseFloat(x.toFixed(3)),
        y: parseFloat(m.metrics.pr_curve.precision[j].toFixed(3))
      })).sort((a, b) => a.x - b.x)
    }))

  const xSet = new Set()
  allLines.forEach(l => l.data.forEach(p => xSet.add(p.x)))
  const xs = Array.from(xSet).sort((a, b) => a - b)

  const merged = xs.map(x => {
    const pt = { x }
    allLines.forEach(l => {
      const closest = l.data.reduce((a, b) => Math.abs(b.x - x) < Math.abs(a.x - x) ? b : a)
      pt[l.key] = closest.y
    })
    return pt
  })

  return (
    <div>
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Precision-Recall</div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={merged} margin={{ top: 5, right: 10, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="x" tick={{ fill: '#64748b', fontSize: 10 }} label={{ value: 'Recall', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 10 }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} label={{ value: 'Precision', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
          {allLines.map(l => (
            <Line key={l.key} type="monotone" dataKey={l.key} name={l.label}
              stroke={l.color} dot={false} strokeWidth={2} />
          ))}
          <Legend iconType="line" iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Metrics Bar Chart ────────────────────────────────────────────────────────
export function MetricsBarChart({ models }) {
  if (!models?.length) return <EmptyChart label="Metrics Comparison" />

  const data = models.map(m => ({
    name: MODEL_LABELS[m.model_type] || m.model_type,
    Accuracy: parseFloat((m.metrics.accuracy * 100).toFixed(1)),
    'F1 Score': parseFloat((m.metrics.f1_score * 100).toFixed(1)),
    'ROC AUC': parseFloat((m.metrics.roc_auc * 100).toFixed(1)),
  }))

  return (
    <div>
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Metrics Comparison</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 10, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} angle={-15} textAnchor="end" />
          <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
            formatter={(v) => `${v}%`} />
          <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
          <Bar dataKey="Accuracy" fill="#3b82f6" radius={[3,3,0,0]} />
          <Bar dataKey="F1 Score" fill="#22c55e" radius={[3,3,0,0]} />
          <Bar dataKey="ROC AUC" fill="#a855f7" radius={[3,3,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function EmptyChart({ label }) {
  return (
    <div className="flex items-center justify-center h-48 border border-dashed border-slate-700 rounded-xl">
      <span className="text-slate-600 text-sm">{label} — Train models to see charts</span>
    </div>
  )
}
