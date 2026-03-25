import React, { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useDocumentStore } from '../store/documentStore'
import DocumentList from '../components/document/DocumentList'
import CreateDocumentDialog from '../components/document/CreateDocumentDialog'

function Dashboard() {
  const { documents, isLoading, error, fetchDocuments } = useDocumentStore()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          My Documents
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          New Document
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DocumentList documents={documents} />
      )}

      <CreateDocumentDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </Container>
  )
}

export default Dashboard