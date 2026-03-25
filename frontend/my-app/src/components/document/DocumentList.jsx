import React from 'react'
import { Grid, Typography, Box } from '@mui/material'
import DocumentCard from './DocumentCard'

function DocumentList({ documents }) {
  if (!documents || documents.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          No documents yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Click "New Document" to create your first document
        </Typography>
      </Box>
    )
  }

  return (
    <Grid container spacing={3}>
      {documents.map((doc) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={doc.id}>
          <DocumentCard document={doc} />
        </Grid>
      ))}
    </Grid>
  )
}

export default DocumentList