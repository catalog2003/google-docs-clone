import React, { useEffect } from 'react'
import { Box, List, Typography, Divider, CircularProgress, Alert } from '@mui/material'
import { useCommentStore } from '../../store/commentStore'
import CommentThread from './CommentThread'
import CommentInput from './CommentInput'

function CommentSidebar({ documentId }) {
  const { comments, isLoading, error, fetchComments, addComment } = useCommentStore()

  // Stable effect — only re-runs when documentId changes
  useEffect(() => {
    if (documentId) {
      fetchComments(documentId)
    }
  }, [documentId]) // fetchComments is stable (Zustand), no infinite loop

  // Only show loading spinner on initial load with no comments
  if (isLoading && comments.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )
  }

  const topLevelComments = comments.filter(c => !c.parent_id)

  const handleAddComment = async (content, selection) => {
    try {
      await addComment({ document_id: documentId, content, selection })
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  return (
    <Box>
      <CommentInput documentId={documentId} onSubmit={handleAddComment} />
      
      <Divider sx={{ my: 2 }} />
      
      {topLevelComments.length === 0 ? (
        <Typography variant="body2" color="text.secondary" align="center">
          No comments yet. Be the first to comment!
        </Typography>
      ) : (
        <List sx={{ p: 0 }}>
          {topLevelComments.map((comment) => (
            <CommentThread key={comment.id} comment={comment} />
          ))}
        </List>
      )}
    </Box>
  )
}

export default CommentSidebar