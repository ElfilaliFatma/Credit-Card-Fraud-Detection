import TrainSection from '../components/TrainSection.jsx'
import PredictSection from '../components/PredictSection.jsx'
import ModelComparisonSection from '../components/ModelComparisonSection.jsx'

export default function HomePage({ trainedModels, onModelTrained }) {
  return (
    <div className="space-y-6">
      {/* Hero strip */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif' }} className="text-3xl font-bold text-white">
            Fraud Detection{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              ML Platform
            </span>
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Credit card fraud detection using state-of-the-art machine learning
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-6 text-center">
          <Stat label="Models Available" value="5" />
          <Stat label="Trained Today" value={trainedModels.length} />
          <Stat label="Dataset Size" value="10K+" />
        </div>
      </div>

      {/* Main panels */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TrainSection onModelTrained={onModelTrained} />
        <PredictSection trainedModels={trainedModels} />
      </div>

      {/* Comparison section */}
      <ModelComparisonSection models={trainedModels} />
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  )
}
