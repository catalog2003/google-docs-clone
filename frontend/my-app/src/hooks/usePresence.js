import { usePresenceStore } from '../store/presenceStore'

export const usePresence = () => {
  const { users, typingUsers, updateCursor, setTyping } = usePresenceStore()

  const getTypingUsers = () => {
    return Object.values(users).filter(user => 
      typingUsers.includes(user.user_id)  // Use includes instead of has
    )
  }

  return {
    users,
    typingUsers: getTypingUsers(),
    updateCursor,
    setTyping
  }
}