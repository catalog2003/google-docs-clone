import { useEffect, useRef } from 'react'
import { useAuthStore } from '../store/authStore'

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, login, register, logout, checkAuth } = useAuthStore()

  // FIX: use a ref to ensure checkAuth runs only once on mount (prevents double execution in StrictMode)
  const checkedRef = useRef(false)
  useEffect(() => {
    if (!checkedRef.current) {
      checkedRef.current = true
      checkAuth()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { user, isAuthenticated, isLoading, login, register, logout }
}