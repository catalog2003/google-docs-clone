import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Chip
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { useDocumentStore } from '../../store/documentStore'
import toast from 'react-hot-toast'

function DocumentCard({ document }) {
  const navigate = useNavigate()
  const { deleteDocument } = useDocumentStore()
  const [anchorEl, setAnchorEl] = React.useState(null)

  const handleMenuOpen = (event) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    handleMenuClose()
    
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(document.id)
        toast.success('Document deleted successfully')
      } catch (error) {
        toast.error('Failed to delete document')
      }
    }
  }

  const handleOpen = () => {
    navigate(`/document/${document.id}`)
  }

  return (
    <Card 
      sx={{ 
        cursor: 'pointer',
        transition: 'box-shadow 0.3s',
        '&:hover': {
          boxShadow: 6
        }
      }}
      onClick={handleOpen}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h6" component="h2" noWrap sx={{ flex: 1 }}>
            {document.title}
          </Typography>
          <IconButton 
            size="small" 
            onClick={handleMenuOpen}
            aria-label="document options"
          >
            <MoreVertIcon />
          </IconButton>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Last edited {formatDistanceToNow(new Date(document.last_edited_at), { addSuffix: true })}
        </Typography>
        
        {document.is_public && (
          <Chip 
            label="Public" 
            size="small" 
            sx={{ mt: 1 }}
            color="primary"
            variant="outlined"
          />
        )}
      </CardContent>
      
      <CardActions>
        <Button size="small" onClick={(e) => { e.stopPropagation(); handleOpen(); }}>
          Open
        </Button>
      </CardActions>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          Delete
        </MenuItem>
      </Menu>
    </Card>
  )
}

export default DocumentCard