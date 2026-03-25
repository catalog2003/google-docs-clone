import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, AppBar, Toolbar, Typography, IconButton,
  Drawer, Divider, CircularProgress, Alert, Button
} from '@mui/material'
import CommentIcon from '@mui/icons-material/Comment'
import HistoryIcon from '@mui/icons-material/History'
import ShareIcon from '@mui/icons-material/Share'
import SaveIcon from '@mui/icons-material/Save'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useDocumentStore } from '../store/documentStore'
import Editor from '../components/editor/Editor'
import CommentSidebar from '../components/comments/CommentSidebar'
import VersionHistory from '../components/versions/VersionHistory'
import ShareDialog from '../components/document/ShareDialog'
import PresenceAvatars from '../components/editor/PresenceAvatars'
import toast from 'react-hot-toast'

function DocumentEditor() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { currentDocument, isLoading, isSaving, error, getDocument, updateDocument, clearCurrentDocument } =
    useDocumentStore()

  const [commentDrawerOpen, setCommentDrawerOpen] = useState(false)
  const [versionDrawerOpen, setVersionDrawerOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  useEffect(() => {
    if (id) getDocument(id)
    // FIX: clear state when leaving the editor to avoid stale document showing
    return () => clearCurrentDocument()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = useCallback(async () => {
    if (!currentDocument) return
    try {
      await updateDocument(id, { content: currentDocument.content })
      toast.success('Document saved')
    } catch {
      toast.error('Failed to save document')
    }
  }, [currentDocument, id, updateDocument])

  if (isLoading && !currentDocument) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 2 }}>
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary">Loading document…</Typography>
      </Box>
    )
  }

  if (error || !currentDocument) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error || 'Document not found'}</Alert>
        {/* FIX: use navigate() instead of window.location.href */}
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AppBar position="fixed" color="default" elevation={1} sx={{ zIndex: 1200 }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>

          <Typography
            variant="body2"
            sx={{ mr: 1, color: currentDocument ? 'success.main' : 'text.secondary' }}
          >
            {currentDocument ? '● Live' : '○ Offline'}
          </Typography>

          <Typography variant="h6" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentDocument.title}
          </Typography>

          {isSaving && <CircularProgress size={20} sx={{ mr: 1 }} />}

          <IconButton onClick={handleSave} disabled={isSaving} title="Save">
            <SaveIcon />
          </IconButton>

          <PresenceAvatars />

          <IconButton onClick={() => setShareDialogOpen(true)} title="Share">
            <ShareIcon />
          </IconButton>
          <IconButton onClick={() => setVersionDrawerOpen(true)} title="Version history">
            <HistoryIcon />
          </IconButton>
          <IconButton onClick={() => setCommentDrawerOpen(true)} title="Comments">
            <CommentIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, mt: 8, height: 'calc(100vh - 64px)', overflow: 'auto', bgcolor: '#f8f9fa' }}>
        <Box sx={{ maxWidth: '1200px', mx: 'auto', p: 3, height: '100%' }}>
          <Editor
            documentId={id}
            initialContent={currentDocument.content}
            onContentChange={() => {}}
          />
        </Box>
      </Box>

      <Drawer anchor="right" open={commentDrawerOpen} onClose={() => setCommentDrawerOpen(false)}>
        <Box sx={{ width: 350, p: 2 }}>
          <Typography variant="h6" gutterBottom>Comments</Typography>
          <Divider sx={{ mb: 2 }} />
          <CommentSidebar documentId={id} />
        </Box>
      </Drawer>

      <Drawer anchor="right" open={versionDrawerOpen} onClose={() => setVersionDrawerOpen(false)}>
        <Box sx={{ width: 350, p: 2 }}>
          <Typography variant="h6" gutterBottom>Version History</Typography>
          <Divider sx={{ mb: 2 }} />
          <VersionHistory documentId={id} />
        </Box>
      </Drawer>

      <ShareDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        documentId={id}
      />
    </Box>
  )
}

export default DocumentEditor