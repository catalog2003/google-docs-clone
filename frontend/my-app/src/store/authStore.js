import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import authService from '../services/auth.service'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const response = await authService.login({ email, password })
          const { access_token, user } = response
          set({ user, token: access_token, isAuthenticated: true, isLoading: false })
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: error.response?.data?.detail || 'Login failed' }
        }
      },

      register: async (userData) => {
        set({ isLoading: true })
        try {
          const response = await authService.register(userData)
          const { access_token, user } = response
          set({ user, token: access_token, isAuthenticated: true, isLoading: false })
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: error.response?.data?.detail || 'Registration failed' }
        }
      },

      logout: () => {
        authService.logout()
        set({ user: null, token: null, isAuthenticated: false })
      },

      checkAuth: async () => {
        // FIX: store already has persisted state; just verify it's still valid
        const { token } = get()
        if (!token) return
        try {
          const user = await authService.getCurrentUser()
          set({ user, isAuthenticated: true })
        } catch {
          // Token expired or invalid — clear state
          set({ user: null, token: null, isAuthenticated: false })
        }
      },
    }),
    { name: 'auth-storage' }
  )
)