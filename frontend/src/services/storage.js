import axios from 'axios'
import { profileSeed, projectsSeed, tasksSeed, teamSeed } from '../data/seed'

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api', timeout: 8000 })
export const isBackendEnabled = import.meta.env.VITE_USE_BACKEND === 'true'

const KEYS = { tasks: 'taskflow_tasks', projects: 'taskflow_projects', team: 'taskflow_team', profile: 'taskflow_profile', auth: 'taskflow_auth' }
const clone = (value) => JSON.parse(JSON.stringify(value))

export const storage = {
  load(key, fallback) {
    try { const value = localStorage.getItem(KEYS[key] || key); return value ? JSON.parse(value) : clone(fallback) } catch { return clone(fallback) }
  },
  save(key, value) { localStorage.setItem(KEYS[key] || key, JSON.stringify(value)); return value },
  clear() { Object.values(KEYS).forEach((key) => localStorage.removeItem(key)) },
}

export const initialData = {
  tasks: storage.load('tasks', tasksSeed), projects: storage.load('projects', projectsSeed),
  team: storage.load('team', teamSeed), profile: storage.load('profile', profileSeed),
}

export const wait = (value, ms = 280) => new Promise((resolve) => setTimeout(() => resolve(value), ms))
