import { useState, useRef } from 'react'
import { Brain, Play, Upload, Settings, ChevronDown, ChevronUp, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { startTraining, waitForJob, downloadModel } from '../api/client.js'
import MetricsPanel from './MetricsPanel.jsx'
import ConfusionMatrix from './ConfusionMatrix.jsx'
import Spinner from './Spinner.jsx'

const MODEL_OPTIONS = [
  { value: 'logistic_regression', label: 'Logistic Regression', icon: '📈' },
  { value: 'random_forest', label: 'Random Forest', icon: '🌲' },
  { value: 'svm', label: 'SVM', icon: '⚙️' },
  { value: 'knn', label: 'KNN', icon: '📍' },
  { value: 'neural_network', label: 'Neural Network', icon: '🧠' },
]

const DEFAULT_HYPERPARAMS = {
  lr_C: 1.0, lr_max_iter: 100,
  rf_n_estimators: 100, rf_max_depth: '',
  svm_C: 1.0, svm_kernel: 'rbf',
  knn_n_neighbors: 5,
  nn_hidden_layers: [64, 32], nn_learning_rate: 0.001, nn_epochs: 50,
  test_size: 0.2, use_smote: true, random_state: 42
}

export default function TrainSection({ onModelTrained }) {
  const [selectedModel, setSelectedModel] = useState('')
  const [hyperparams, setHyperparams] = useState(DEFAULT_HYPERPARAMS)
  const [showHyperparams, setShowHyperparams] = useState(false)
  const [training, setTraining] = useState(false)
  const [result, setResult] = useState(null)
  const [progress, setProgress] = useState('')
  const fileRef = useRef()

  const handleHyperparam = (key, value) => {
    setHyperparams(prev => ({ ...prev, [key]: value }))
  }

  const handleTrain = async () => {
    if (!selectedModel) { toast.error('Please select a model'); return }
    setTraining(true)
    setResult(null)
    setProgress('Starting training...')

    try {
      const hp = { ...hyperparams }
      if (hp.rf_max_depth === '' || hp.rf_max_depth === null) hp.rf_max_depth = null
      else hp.rf_max_depth = Number(hp.rf_max_depth)

      const job = await startTraining(selectedModel, hp)
      setProgress('Training in progress...')

      const finalJob = await waitForJob(job.job_id, (j) => {
        if (j.status === 'running') setProgress('Training in progress...')
      })

      const res = finalJob.result
      setResult(res)
      onModelTrained?.(res)
      toast.success(`${res.model_type.replace(/_/g, ' ')} trained! Accuracy: ${(res.metrics.accuracy * 100).toFixed(1)}%`)
    } catch (e) {
      toast.error(`Training failed: ${e.message}`)
    } finally {
      setTraining(false)
      setProgress('')
    }
  }

  return (
    <div className="card fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-blue-600/20 rounded-lg flex items-center justify-center border border-blue-600/30">
          <Brain size={18} className="text-blue-400" />
        </div>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif' }} className="text-lg font-bold text-white">
            Train Model
          </h2>
          <p className="text-xs text-slate-500">Configure and train your fraud detector</p>
        </div>
      </div>

      {/* Model Selection */}
      <div className="mb-4">
        <label className="label">Select Model</label>
        <select
          className="select"
          value={selectedModel}
          onChange={e => setSelectedModel(e.target.value)}
        >
          <option value="">Choose a model...</option>
          {MODEL_OPTIONS.map(m => (
            <option key={m.value} value={m.value}>{m.icon} {m.label}</option>
          ))}
        </select>
      </div>

      {/* Hyperparameters Toggle */}
      <div className="mb-4">
        <button
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          onClick={() => setShowHyperparams(v => !v)}
        >
          <Settings size={14} />
          Hyperparameters
          {showHyperparams ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showHyperparams && (
          <div className="mt-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700 grid grid-cols-2 gap-3 fade-in">
            <HyperInput label="Test Size" value={hyperparams.test_size} min={0.1} max={0.4} step={0.05}
              onChange={v => handleHyperparam('test_size', parseFloat(v))} type="number" />
            <div className="flex items-center gap-2">
              <label className="label mb-0 cursor-pointer flex items-center gap-2">
                <input type="checkbox" checked={hyperparams.use_smote}
                  onChange={e => handleHyperparam('use_smote', e.target.checked)}
                  className="accent-blue-500" />
                Use SMOTE
              </label>
            </div>

            {selectedModel === 'logistic_regression' && <>
              <HyperInput label="C (Regularization)" value={hyperparams.lr_C} min={0.01} max={100} step={0.1}
                onChange={v => handleHyperparam('lr_C', parseFloat(v))} type="number" />
              <HyperInput label="Max Iterations" value={hyperparams.lr_max_iter} min={50} max={1000} step={50}
                onChange={v => handleHyperparam('lr_max_iter', parseInt(v))} type="number" />
            </>}

            {selectedModel === 'random_forest' && <>
              <HyperInput label="N Estimators" value={hyperparams.rf_n_estimators} min={10} max={500} step={10}
                onChange={v => handleHyperparam('rf_n_estimators', parseInt(v))} type="number" />
              <HyperInput label="Max Depth (empty=None)" value={hyperparams.rf_max_depth}
                onChange={v => handleHyperparam('rf_max_depth', v)} type="text" placeholder="None" />
            </>}

            {selectedModel === 'svm' && <>
              <HyperInput label="C (Regularization)" value={hyperparams.svm_C} min={0.01} max={100} step={0.1}
                onChange={v => handleHyperparam('svm_C', parseFloat(v))} type="number" />
              <div>
                <label className="label">Kernel</label>
                <select className="select" value={hyperparams.svm_kernel}
                  onChange={e => handleHyperparam('svm_kernel', e.target.value)}>
                  {['rbf','linear','poly','sigmoid'].map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
            </>}

            {selectedModel === 'knn' && (
              <HyperInput label="N Neighbors" value={hyperparams.knn_n_neighbors} min={1} max={50}
                onChange={v => handleHyperparam('knn_n_neighbors', parseInt(v))} type="number" />
            )}

            {selectedModel === 'neural_network' && <>
              <HyperInput label="Learning Rate" value={hyperparams.nn_learning_rate} min={0.0001} max={0.1} step={0.0001}
                onChange={v => handleHyperparam('nn_learning_rate', parseFloat(v))} type="number" />
              <HyperInput label="Epochs" value={hyperparams.nn_epochs} min={10} max={500} step={10}
                onChange={v => handleHyperparam('nn_epochs', parseInt(v))} type="number" />
            </>}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          className="btn-primary flex-1"
          onClick={handleTrain}
          disabled={training || !selectedModel}
        >
          {training ? <Spinner /> : <Play size={16} />}
          {training ? progress || 'Training...' : 'Train Model'}
        </button>
        <button
          className="btn-secondary"
          onClick={() => fileRef.current?.click()}
          title="Upload dataset CSV"
        >
          <Upload size={16} />
          <span className="hidden sm:inline">Upload CSV</span>
        </button>
        <input ref={fileRef} type="file" accept=".csv" className="hidden"
          onChange={async (e) => {
            const f = e.target.files[0]
            if (!f || !selectedModel) { toast.error('Select a model first'); return }
            const { trainWithUpload, waitForJob } = await import('../api/client.js')
            setTraining(true)
            try {
              const hp = { ...hyperparams }
              if (hp.rf_max_depth === '') hp.rf_max_depth = null
              const job = await trainWithUpload(f, selectedModel, hp)
              const done = await waitForJob(job.job_id, () => {})
              setResult(done.result)
              onModelTrained?.(done.result)
              toast.success('Training complete!')
            } catch (err) { toast.error(err.message) } finally { setTraining(false) }
            e.target.value = ''
          }}
        />
      </div>

      {/* Results */}
      {result && (
        <div className="mt-6 fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-300">
              Results — <span className="text-blue-400">{result.model_type.replace(/_/g,' ')}</span>
            </span>
            <a href={downloadModel(result.model_id)}
              className="btn-secondary text-xs px-3 py-1.5">
              <Download size={12} /> Download Model
            </a>
          </div>
          <MetricsPanel metrics={result.metrics} trainingTime={result.training_time} />
          <div className="mt-4">
            <ConfusionMatrix matrix={result.metrics.confusion_matrix} />
          </div>
        </div>
      )}
    </div>
  )
}

function HyperInput({ label, value, onChange, type, min, max, step, placeholder }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        className="input"
        type={type}
        value={value}
        min={min} max={max} step={step}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}
