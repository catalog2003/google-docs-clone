import React from 'react'
import { Box, CircularProgress } from '@mui/material'

function Loading({ fullScreen = false }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...(fullScreen ? {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 9999
        } : {
          minHeight: 200
        })
      }}
    >
      <CircularProgress />
    </Box>
  )
}

export default Loading