import React, { useState } from 'react'
import {
  Box, Typography, Avatar, IconButton, Menu, MenuItem,
  Button, TextField, Paper
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ReplyIcon from '@mui/icons-material/Reply'
import CheckIcon from '@mui/icons-material/Check'
import { formatDistanceToNow } from 'date-fns'
import { useCommentStore } from '../../store/commentStore'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

function CommentThread({ comment }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)

  const { user } = useAuthStore()
  const { addComment, updateComment, deleteComment, resolveComment } = useCommentStore()

  const handleMenuOpen = (e) => { e.stopPropagation(); setAnchorEl(e.currentTarget) }
  const handleMenuClose = () => setAnchorEl(null)

  const handleEdit = () => {
    handleMenuClose()
    setEditContent(comment.content)
    setIsEditing(true)
  }

  const handleEditSave = async () => {
    if (!editContent.trim()) return
    try {
      await updateComment(comment.id, { content: editContent.trim() })
      setIsEditing(false)
      toast.success('Comment updated')
    } catch {
      toast.error('Failed to update comment')
    }
  }

  const handleDelete = async () => {
    handleMenuClose()
    try {
      await deleteComment(comment.id)
      toast.success('Comment deleted')
    } catch {
      toast.error('Failed to delete comment')
    }
  }

  const handleResolve = async () => {
    handleMenuClose()
    try {
      await resolveComment(comment.id)
      toast.success('Comment resolved')
    } catch {
      toast.error('Failed to resolve comment')
    }
  }

  const handleReply = async () => {
    if (!replyContent.trim()) return
    try {
      await addComment({
        document_id: comment.document_id,
        content: replyContent.trim(),
        parent_id: comment.id,
      })
      setReplyContent('')
      setIsReplying(false)
      toast.success('Reply added')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add reply')
    }
  }

  const isOwner = user?.id === comment.user_id

  return (
    <Box sx={{ mb: 2 }}>
      <Paper variant="outlined" sx={{ p: 2, opacity: comment.resolved ? 0.6 : 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            {(comment.user_name?.[0] || comment.user_id?.[0] || 'U').toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Box>
                <Typography variant="subtitle2" component="span">
                  {comment.user_name || 'User'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  {comment.created_at
                    ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })
                    : ''}
                </Typography>
                {comment.resolved && (
                  <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                    ✓ Resolved
                  </Typography>
                )}
              </Box>
              <IconButton size="small" onClick={handleMenuOpen} aria-label="comment options">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>

            {isEditing ? (
              <Box>
                <TextField
                  fullWidth size="small" multiline rows={2}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  autoFocus
                />
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Button size="small" variant="contained" onClick={handleEditSave}>Save</Button>
                  <Button size="small" onClick={() => setIsEditing(false)}>Cancel</Button>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {comment.content}
              </Typography>
            )}

            {comment.selection?.text && (
              <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1, fontStyle: 'italic', fontSize: '0.875rem' }}>
                "{comment.selection.text}"
              </Box>
            )}

            {!isEditing && (
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                {!comment.resolved && (
                  <Button size="small" startIcon={<ReplyIcon />} onClick={() => setIsReplying(!isReplying)}>
                    Reply
                  </Button>
                )}
                {!comment.resolved && (
                  <Button size="small" startIcon={<CheckIcon />} onClick={handleResolve}>
                    Resolve
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {isOwner && <MenuItem onClick={handleEdit}>Edit</MenuItem>}
        {isOwner && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>Delete</MenuItem>
        )}
        {!comment.resolved && <MenuItem onClick={handleResolve}>Resolve</MenuItem>}
      </Menu>

      {isReplying && (
        <Box sx={{ mt: 1, ml: 6 }}>
          <TextField
            fullWidth size="small" placeholder="Write a reply…"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            multiline rows={2}
            autoFocus
          />
          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
            <Button size="small" variant="contained" onClick={handleReply}
              disabled={!replyContent.trim()}>Reply</Button>
            <Button size="small" onClick={() => setIsReplying(false)}>Cancel</Button>
          </Box>
        </Box>
      )}

      {comment.replies?.length > 0 && (
        <Box sx={{ ml: 4, mt: 1 }}>
          {comment.replies.map((reply) => (
            <CommentThread key={reply.id} comment={reply} />
          ))}
        </Box>
      )}
    </Box>
  )
}

export default CommentThread