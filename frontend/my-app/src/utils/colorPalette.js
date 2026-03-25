import { COLORS } from './constants'

export const getUserColor = (userId) => {
  if (!userId) return COLORS[0]
  
  // Deterministic color based on userId
  const hash = userId.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0)
  }, 0)
  
  return COLORS[hash % COLORS.length]
}

export const getRandomColor = () => {
  return COLORS[Math.floor(Math.random() * COLORS.length)]
}