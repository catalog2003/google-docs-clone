import React, { useState } from 'react'
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography
} from '@mui/material'

function CommentInput({ documentId, onSubmit }) {
  const [content, setContent] = useState('')
  const [selection, setSelection] = useState(null)

  const handleSubmit = () => {
    if (!content.trim()) return
    
    onSubmit(content.trim(), selection)
    setContent('')
    setSelection(null)
  }

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Add a comment
      </Typography>
      <TextField
        fullWidth
        size="small"
        placeholder="Write your comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        multiline
        rows={3}
        sx={{ mb: 1 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="small"
          onClick={handleSubmit}
          disabled={!content.trim()}
        >
          Comment
        </Button>
      </Box>
    </Paper>
  )
}

export default CommentInput