/**
 * API client for Fraud Detection backend
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' }
});

// ─── Training ───────────────────────────────────────────────────────────────

export const startTraining = (modelType, hyperparameters, datasetPath = null) =>
  api.post('/train', { model_type: modelType, hyperparameters, dataset_path: datasetPath })
    .then(r => r.data);

export const pollJob = (jobId) =>
  api.get(`/train/job/${jobId}`).then(r => r.data);

export const trainWithUpload = (file, modelType, hyperparameters) => {
  const form = new FormData();
  form.append('file', file);
  form.append('model_type', modelType);
  form.append('hyperparameters', JSON.stringify(hyperparameters));
  return api.post('/train/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data);
};

export const downloadModel = (modelId) =>
  `${BASE_URL}/train/download/${modelId}`;

// ─── Prediction ──────────────────────────────────────────────────────────────

export const predict = (modelId, features) =>
  api.post('/predict', { model_id: modelId, features }).then(r => r.data);

// ─── Models ──────────────────────────────────────────────────────────────────

export const getModels = () =>
  api.get('/models').then(r => r.data);

export const getModelDetails = (modelId) =>
  api.get(`/models/${modelId}`).then(r => r.data);

// ─── Results ─────────────────────────────────────────────────────────────────

export const getResults = () =>
  api.get('/results').then(r => r.data);

export const deleteResult = (modelId) =>
  api.delete(`/results/${modelId}`).then(r => r.data);

export const exportCsv = () =>
  `${BASE_URL}/results/export/csv`;

// ─── Polling helper ──────────────────────────────────────────────────────────

export const waitForJob = (jobId, onUpdate, intervalMs = 1000) => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const job = await pollJob(jobId);
        onUpdate?.(job);
        if (job.status === 'done') {
          clearInterval(interval);
          resolve(job);
        } else if (job.status === 'error') {
          clearInterval(interval);
          reject(new Error(job.error || 'Training failed'));
        }
      } catch (e) {
        clearInterval(interval);
        reject(e);
      }
    }, intervalMs);
  });
};
