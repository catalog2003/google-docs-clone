import { useCallback } from 'react'

export const useWebSocket = (documentId) => {
  // Yjs handles all WebSocket communication via y-websocket
  // This hook is kept for API compatibility but doesn't create additional connections
  
  const sendCursorUpdate = useCallback((cursor) => {
    // Cursor updates are handled by Yjs awareness
    console.log('Cursor update (handled by Yjs awareness):', cursor)
  }, [])

  const sendTypingStart = useCallback(() => {
    // Typing indicators are handled by Yjs awareness
    console.log('Typing start (handled by Yjs awareness)')
  }, [])

  const sendTypingEnd = useCallback(() => {
    console.log('Typing end (handled by Yjs awareness)')
  }, [])

  return {
    sendCursorUpdate,
    sendTypingStart,
    sendTypingEnd,
    isConnected: true // Yjs handles the connection
  }
}