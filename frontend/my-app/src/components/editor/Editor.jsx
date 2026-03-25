import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import Quill from 'quill'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { QuillBinding } from 'y-quill'
import { useDocumentStore } from '../../store/documentStore'
import { useAuthStore } from '../../store/authStore'
import 'quill/dist/quill.snow.css'

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  ['link', 'clean'],
]

// Module-level set prevents double-init under React StrictMode
const initializedDocuments = new Set()

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'

function Editor({ documentId, initialContent, onContentChange }) {
  const containerRef = useRef(null)
  const quillRef = useRef(null)
  const providerRef = useRef(null)
  const ydocRef = useRef(null)
  const bindingRef = useRef(null)
  const saveTimerRef = useRef(null)
  const hasSeedRef = useRef(false)

  const { token, user } = useAuthStore()
  const { updateDocument } = useDocumentStore()
  const [isLoading, setIsLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState('connecting')

  // Stable refs — never trigger re-initialization
  const updateDocumentRef = useRef(updateDocument)
  const onContentChangeRef = useRef(onContentChange)
  const initialContentRef = useRef(initialContent)
  useEffect(() => { updateDocumentRef.current = updateDocument }, [updateDocument])
  useEffect(() => { onContentChangeRef.current = onContentChange }, [onContentChange])
  useEffect(() => { initialContentRef.current = initialContent }, [initialContent])

  const cleanupContainer = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
    }
  }, [])

  const deltaToText = (content) => {
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content) : content
      if (parsed?.ops) {
        return parsed.ops.reduce(
          (acc, op) => acc + (typeof op.insert === 'string' ? op.insert : ''),
          ''
        )
      }
    } catch {
      // ignore parse errors
    }
    return typeof content === 'string' ? content : ''
  }

  const seedFromDatabase = useCallback((ytext) => {
    if (hasSeedRef.current) return
    if (ytext.length > 0) {
      hasSeedRef.current = true
      return
    }
    const dbText = deltaToText(initialContentRef.current)
    if (dbText && dbText.trim()) {
      ytext.insert(0, dbText)
    }
    hasSeedRef.current = true
  }, [])

  useEffect(() => {
    if (!containerRef.current || !token || !documentId) return
    if (initializedDocuments.has(documentId)) return

    initializedDocuments.add(documentId)
    cleanupContainer()

    const ydoc = new Y.Doc()
    ydocRef.current = ydoc

    const provider = new WebsocketProvider(WS_BASE_URL, documentId, ydoc, {
      params: { token },
      connect: true,
    })
    providerRef.current = provider

    const ytext = ydoc.getText('quill')

    const editorDiv = document.createElement('div')
    editorDiv.style.height = '100%'
    containerRef.current.appendChild(editorDiv)

    const quill = new Quill(editorDiv, {
      theme: 'snow',
      modules: {
        toolbar: TOOLBAR_OPTIONS,
        history: { delay: 1000, maxStack: 100, userOnly: true },
      },
      placeholder: 'Start typing your document…',
    })
    quillRef.current = quill

    const binding = new QuillBinding(ytext, quill, provider.awareness)
    bindingRef.current = binding

    // FIX: deterministic color from user.id (not random)
    const userColor = `hsl(${(parseInt(user?.id?.slice(-4) || '0', 16) % 360)}, 70%, 60%)`
    provider.awareness.setLocalState({
      user: {
        id: user?.id,
        name: user?.username,
        color: userColor,
      },
    })

    provider.on('status', ({ status }) => setConnectionStatus(status))

    let syncFallbackTimer = null

    provider.on('sync', (synced) => {
      if (synced) {
        seedFromDatabase(ytext)
        setIsLoading(false)
        if (syncFallbackTimer) clearTimeout(syncFallbackTimer)
      }
    })

    syncFallbackTimer = setTimeout(() => {
      seedFromDatabase(ytext)
      setIsLoading(false)
    }, 4000)

    // Auto-save: debounced 2s, only for user-initiated changes
    const handleTextChange = (_delta, _old, source) => {
      if (source !== 'user') return
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        const content = quill.getContents()
        updateDocumentRef.current(documentId, { content }).catch((err) =>
          console.error('Auto-save failed:', err)
        )
        onContentChangeRef.current?.(content)
      }, 2000)
    }

    quill.on('text-change', handleTextChange)

    return () => {
      clearTimeout(syncFallbackTimer)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      quill.off('text-change', handleTextChange)
      binding.destroy()
      provider.destroy()
      ydoc.destroy()
      cleanupContainer()
      quillRef.current = null
      providerRef.current = null
      ydocRef.current = null
      bindingRef.current = null
      hasSeedRef.current = false
      initializedDocuments.delete(documentId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId, token, user?.id])

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        borderRadius: 1,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        position: 'relative',
        '& .ql-toolbar': {
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#fafafa',
          flexShrink: 0,
        },
        '& .ql-container': { border: 'none', fontSize: '16px', flex: 1, overflow: 'auto' },
        '& .ql-editor': { minHeight: '500px', padding: '20px', lineHeight: 1.6 },
        '& .ql-editor.ql-blank::before': { color: '#9e9e9e', fontStyle: 'normal' },
      }}
    >
      {isLoading && (
        <Box
          sx={{
            position: 'absolute', inset: 0, zIndex: 10,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 2, backgroundColor: '#fff',
          }}
        >
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary">
            {connectionStatus === 'connected' ? 'Syncing…' : 'Connecting…'}
          </Typography>
        </Box>
      )}

      {!isLoading && connectionStatus !== 'connected' && (
        <Box
          sx={{
            position: 'absolute', top: 8, right: 8, zIndex: 5,
            bgcolor: 'warning.light', borderRadius: 1, px: 1, py: 0.5,
          }}
        >
          <Typography variant="caption">Offline — changes saved locally</Typography>
        </Box>
      )}

      <Box
        ref={containerRef}
        sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}
      />
    </Box>
  )
}

export default Editor