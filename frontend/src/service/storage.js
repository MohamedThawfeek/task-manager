import { profileSeed, projectsSeed, tasksSeed, teamSeed } from '../data/seed'

const KEYS = {
  tasks: 'taskflow_tasks',
  projects: 'taskflow_projects',
  team: 'taskflow_team',
  profile: 'taskflow_profile',
}

const clone = (value) => JSON.parse(JSON.stringify(value))

export const storage = {
  load(key, fallback) {
    try {
      const value = localStorage.getItem(KEYS[key] || key)
      return value ? JSON.parse(value) : clone(fallback)
    } catch {
      return clone(fallback)
    }
  },
  save(key, value) {
    localStorage.setItem(KEYS[key] || key, JSON.stringify(value))
    return value
  },
  clear() {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key))
  },
}

export const initialData = {
  tasks: storage.load('tasks', tasksSeed),
  projects: storage.load('projects', projectsSeed),
  profile: storage.load('profile', profileSeed),
}

export const initialTeam = storage.load('team', teamSeed)
