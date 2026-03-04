import { useState } from 'react'
import { Zap, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { predict } from '../api/client.js'
import Spinner from './Spinner.jsx'

// Feature names matching the dataset
const AMOUNT_TIME_FEATURES = ['Amount', 'Time']
const V_FEATURES = Array.from({ length: 28 }, (_, i) => `V${i + 1}`)

export default function PredictSection({ trainedModels }) {
  const [selectedModelId, setSelectedModelId] = useState('')
  const [features, setFeatures] = useState({
    Amount: '', Time: '',
    ...Object.fromEntries(V_FEATURES.map(k => [k, '']))
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handlePredict = async () => {
    if (!selectedModelId) { toast.error('Select a trained model first'); return }

    // Build features dict, default empty → 0
    const featureDict = {}
    for (const [k, v] of Object.entries(features)) {
      featureDict[k] = parseFloat(v) || 0.0
    }

    setLoading(true)
    setResult(null)
    try {
      const res = await predict(selectedModelId, featureDict)
      setResult(res)
    } catch (e) {
      toast.error(`Prediction failed: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fillRandom = () => {
    const isFraud = Math.random() > 0.5
    const newFeatures = {
      Amount: (isFraud ? 100 + Math.random() * 400 : Math.random() * 100).toFixed(2),
      Time: Math.floor(Math.random() * 172792),
      ...Object.fromEntries(V_FEATURES.map(k => {
        const v = parseInt(k.replace('V', ''))
        const shift = isFraud && [4,11,14,17].includes(v) ? 0.8 : (isFraud ? -0.5 : 0)
        return [k, (Math.random() * 2 - 1 + shift).toFixed(4)]
      }))
    }
    setFeatures(newFeatures)
  }

  return (
    <div className="card fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-emerald-600/20 rounded-lg flex items-center justify-center border border-emerald-600/30">
          <Zap size={18} className="text-emerald-400" />
        </div>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif' }} className="text-lg font-bold text-white">
            Predict Transaction
          </h2>
          <p className="text-xs text-slate-500">Run inference on a single transaction</p>
        </div>
      </div>

      {/* Model selector */}
      <div className="mb-4">
        <label className="label">Select Trained Model</label>
        <select className="select" value={selectedModelId} onChange={e => setSelectedModelId(e.target.value)}>
          <option value="">Choose trained model...</option>
          {trainedModels.map(m => (
            <option key={m.model_id} value={m.model_id}>
              {m.model_type.replace(/_/g, ' ')} — ID: {m.model_id} (Acc: {(m.metrics.accuracy * 100).toFixed(1)}%)
            </option>
          ))}
        </select>
      </div>

      {/* Amount & Time */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="label">Amount ($)</label>
          <input className="input" type="number" placeholder="0.00"
            value={features.Amount} onChange={e => setFeatures(p => ({ ...p, Amount: e.target.value }))} />
        </div>
        <div>
          <label className="label">Time (s)</label>
          <input className="input" type="number" placeholder="0"
            value={features.Time} onChange={e => setFeatures(p => ({ ...p, Time: e.target.value }))} />
        </div>
      </div>

      {/* V Features Grid */}
      <div className="mb-4">
        <label className="label flex items-center gap-1">
          V Features (PCA)
          <HelpCircle size={11} className="text-slate-600" />
        </label>
        <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5 max-h-44 overflow-y-auto pr-1">
          {V_FEATURES.map(vf => (
            <div key={vf}>
              <div className="text-xs text-slate-600 text-center mb-0.5">{vf}</div>
              <input
                className="input text-center px-1 py-1.5 text-xs"
                type="number" step="0.001"
                placeholder="0"
                value={features[vf]}
                onChange={e => setFeatures(p => ({ ...p, [vf]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-4">
        <button className="btn-primary flex-1" onClick={handlePredict} disabled={loading}>
          {loading ? <Spinner /> : <Zap size={15} />}
          {loading ? 'Predicting...' : 'Predict'}
        </button>
        <button className="btn-secondary" onClick={fillRandom} title="Fill with random data">
          🎲 Random
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className={`p-5 rounded-xl border fade-in ${
          result.prediction === 'Fraud'
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-emerald-500/10 border-emerald-500/30'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            {result.prediction === 'Fraud'
              ? <AlertTriangle size={24} className="text-red-400" />
              : <CheckCircle size={24} className="text-emerald-400" />
            }
            <span style={{ fontFamily: 'Syne, sans-serif' }} className={`text-2xl font-bold ${
              result.prediction === 'Fraud' ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {result.prediction}
            </span>
          </div>
          <div className="flex gap-4 text-sm">
            <div>
              <div className="text-slate-500 text-xs mb-0.5">Fraud Probability</div>
              <div className="font-semibold font-mono text-slate-200">
                {(result.probability * 100).toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-slate-500 text-xs mb-0.5">Confidence</div>
              <span className={`badge ${
                result.confidence === 'High' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                result.confidence === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                'bg-slate-600/20 text-slate-400 border border-slate-600/30'
              }`}>
                {result.confidence}
              </span>
            </div>
          </div>
          {/* Probability bar */}
          <div className="mt-3">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  result.prediction === 'Fraud' ? 'bg-red-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${result.probability * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {!result && (
        <div className="flex items-center justify-center h-24 border border-dashed border-slate-700 rounded-xl">
          <span className="text-slate-600 text-sm">Prediction result will appear here</span>
        </div>
      )}
    </div>
  )
}
