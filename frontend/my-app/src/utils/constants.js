export const ROLES = {
  OWNER: 'owner',
  EDITOR: 'editor',
  VIEWER: 'viewer'
}

export const COLORS = [
  '#f44336', '#2196f3', '#4caf50', '#ff9800', 
  '#9c27b0', '#00bcd4', '#e91e63', '#3f51b5',
  '#009688', '#ff5722', '#795548', '#607d8b'
]

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

export const DEFAULT_DOCUMENT_CONTENT = {
  ops: [{ insert: '\n' }]
}