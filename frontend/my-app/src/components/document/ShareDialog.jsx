import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Box,
  Typography
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { useDocumentStore } from '../../store/documentStore'
import permissionService from '../../services/permission.service'
import toast from 'react-hot-toast'

function ShareDialog({ open, onClose, documentId }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('viewer')
  const [permissions, setPermissions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { shareDocument } = useDocumentStore()

  useEffect(() => {
    if (open && documentId) {
      fetchPermissions()
    }
  }, [open, documentId])

  const fetchPermissions = async () => {
    setIsLoading(true)
    try {
      const data = await permissionService.getDocumentPermissions(documentId)
      setPermissions(data)
    } catch (error) {
      toast.error('Failed to load permissions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    if (!email) {
      toast.error('Please enter an email address')
      return
    }

    setIsSaving(true)
    try {
      await shareDocument(documentId, email, role)
      toast.success('Document shared successfully')
      setEmail('')
      await fetchPermissions()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to share document')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRevoke = async (permissionId) => {
    if (!window.confirm('Are you sure you want to revoke this permission?')) {
      return
    }

    try {
      await permissionService.revokePermission(permissionId)
      toast.success('Permission revoked')
      await fetchPermissions()
    } catch (error) {
      toast.error('Failed to revoke permission')
    }
  }

  const getRoleChipColor = (role) => {
    switch (role) {
      case 'owner': return 'primary'
      case 'editor': return 'success'
      default: return 'default'
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share Document</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Add people
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              size="small"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ flexGrow: 1 }}
              disabled={isSaving}
            />
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={role}
                label="Role"
                onChange={(e) => setRole(e.target.value)}
                disabled={isSaving}
              >
                <MenuItem value="editor">Editor</MenuItem>
                <MenuItem value="viewer">Viewer</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleShare}
              disabled={isSaving}
            >
              {isSaving ? <CircularProgress size={24} /> : 'Share'}
            </Button>
          </Box>
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          People with access
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : permissions.length === 0 ? (
          <Alert severity="info">
            No one has access yet. Share this document to collaborate.
          </Alert>
        ) : (
          <List>
            {permissions.map((perm) => (
              <ListItem
                key={perm.id}
                secondaryAction={
                  perm.role !== 'owner' && (
                    <IconButton 
                      edge="end" 
                      onClick={() => handleRevoke(perm.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )
                }
              >
                <ListItemText
                  primary={perm.user_email || perm.user_id}
                  secondary={
                    <Chip
                      label={perm.role}
                      size="small"
                      color={getRoleChipColor(perm.role)}
                      sx={{ mt: 0.5 }}
                    />
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ShareDialog