import React, { useEffect, useState } from 'react'
import { AvatarGroup, Avatar, Tooltip, Box } from '@mui/material'
import { useAuthStore } from '../../store/authStore'

function PresenceAvatars() {
  const { user } = useAuthStore()
  const [users, setUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState([])

  // Get Yjs provider from the window or a global context
  // This is a simplified version - in production, you'd use a context
  useEffect(() => {
    // This would normally come from a context or store
    // For now, just show nothing
  }, [])

  // Filter out current user
  const otherUsers = users.filter(u => u.id !== user?.id)

  if (otherUsers.length === 0) return null

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
      {typingUsers.length > 0 && (
        <Box
          sx={{
            fontSize: '0.875rem',
            color: 'text.secondary',
            mr: 1,
            fontStyle: 'italic'
          }}
        >
          {typingUsers.length === 1
            ? `${typingUsers[0].name} is typing...`
            : `${typingUsers.length} people typing...`}
        </Box>
      )}
      
      <AvatarGroup max={4} spacing="small">
        {otherUsers.map((u) => (
          <Tooltip key={u.id} title={u.name}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: u.color || '#1a73e8',
                border: '2px solid white'
              }}
            >
              {u.name?.[0]?.toUpperCase() || '?'}
            </Avatar>
          </Tooltip>
        ))}
      </AvatarGroup>
    </Box>
  )
}

export default PresenceAvatars