import React, { useState, useEffect } from 'react'
import {
  Box,
  List,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Divider
} from '@mui/material'
import RestoreIcon from '@mui/icons-material/Restore'
import versionService from '../../services/version.service'
import VersionItem from './VersionItem'
import toast from 'react-hot-toast'

function VersionHistory({ documentId }) {
  const [versions, setVersions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)

  useEffect(() => {
    fetchVersions()
  }, [documentId])

  const fetchVersions = async () => {
    setIsLoading(true)
    try {
      const data = await versionService.getDocumentVersions(documentId)
      setVersions(data)
    } catch (error) {
      toast.error('Failed to load versions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestore = async (versionId) => {
    if (!window.confirm('Are you sure you want to restore this version? Current changes will be lost.')) {
      return
    }

    setIsRestoring(true)
    try {
      await versionService.restoreVersion(versionId, documentId)
      toast.success('Version restored successfully')
      await fetchVersions()
    } catch (error) {
      toast.error('Failed to restore version')
    } finally {
      setIsRestoring(false)
    }
  }

  const handleCreateVersion = async () => {
    setIsRestoring(true)
    try {
      await versionService.createVersion(documentId, 'Manual save')
      toast.success('Version created successfully')
      await fetchVersions()
    } catch (error) {
      toast.error('Failed to create version')
    } finally {
      setIsRestoring(false)
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle2">
          {versions.length} versions
        </Typography>
        <Button
          size="small"
          variant="outlined"
          onClick={handleCreateVersion}
          disabled={isRestoring}
        >
          Save Now
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {versions.length === 0 ? (
        <Alert severity="info">
          No versions yet. Save your document to create versions.
        </Alert>
      ) : (
        <List>
          {versions.map((version, index) => (
            <VersionItem
              key={version.id}
              version={version}
              isLatest={index === 0}
              onRestore={handleRestore}
              disabled={isRestoring}
            />
          ))}
        </List>
      )}
    </Box>
  )
}

export default VersionHistory