import React, { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, CircularProgress
} from '@mui/material'
import { useDocumentStore } from '../../store/documentStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

function CreateDocumentDialog({ open, onClose }) {
  const navigate = useNavigate()
  const { createDocument, isLoading } = useDocumentStore()
  const [title, setTitle] = useState('')

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a document title')
      return
    }
    try {
      const document = await createDocument(title.trim())
      toast.success('Document created successfully')
      setTitle('')
      onClose()
      navigate(`/document/${document.id}`)
    } catch {
      toast.error('Failed to create document')
    }
  }

  const handleKeyDown = (e) => {
    // FIX: allow submitting with Enter key without a form tag
    if (e.key === 'Enter' && !e.shiftKey) handleSubmit()
  }

  const handleClose = () => {
    if (!isLoading) {
      setTitle('')
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Document</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Document Title"
          type="text"
          fullWidth
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          inputProps={{ maxLength: 255 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isLoading || !title.trim()}>
          {isLoading ? <CircularProgress size={24} /> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateDocumentDialog