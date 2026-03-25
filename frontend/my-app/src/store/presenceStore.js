import { create } from 'zustand'

export const usePresenceStore = create((set) => ({
  users: {},
  typingUsers: [],  // Use array instead of Set
  
  updatePresence: (users) => {
    set({ users })
  },
  
  updateCursor: (userId, cursor) => {
    set((state) => ({
      users: {
        ...state.users,
        [userId]: {
          ...state.users[userId],
          cursor
        }
      }
    }))
  },
  
  addUser: (user) => {
    set((state) => ({
      users: {
        ...state.users,
        [user.user_id]: user
      }
    }))
  },
  
  removeUser: (userId) => {
    set((state) => {
      const newUsers = { ...state.users }
      delete newUsers[userId]
      return { users: newUsers }
    })
  },
  
  setTyping: (userId, isTyping) => {
    set((state) => ({
      typingUsers: isTyping
        ? [...new Set([...state.typingUsers, userId])]  // Add unique
        : state.typingUsers.filter(id => id !== userId)  // Remove
    }))
  },
  
  clearPresence: () => {
    set({ users: {}, typingUsers: [] })
  }
}))