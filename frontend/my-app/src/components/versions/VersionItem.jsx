import React from 'react'
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Box,
  Typography
} from '@mui/material'
import RestoreIcon from '@mui/icons-material/Restore'
import { formatDistanceToNow } from 'date-fns'

function VersionItem({ version, isLatest, onRestore, disabled }) {
  return (
    <ListItem
      divider
      sx={{
        flexDirection: 'column',
        alignItems: 'flex-start',
        bgcolor: isLatest ? 'action.hover' : 'transparent'
      }}
    >
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2">
                Version {version.version_number}
              </Typography>
              {isLatest && (
                <Chip label="Latest" size="small" color="primary" />
              )}
            </Box>
          }
          secondary={
            <>
              <Typography variant="caption" display="block" color="text.secondary">
                {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
              </Typography>
              {version.comment && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {version.comment}
                </Typography>
              )}
            </>
          }
        />
        
        <ListItemSecondaryAction>
          <IconButton
            edge="end"
            onClick={() => onRestore(version.id)}
            disabled={disabled || isLatest}
            title={isLatest ? 'Current version' : 'Restore this version'}
          >
            <RestoreIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </Box>
    </ListItem>
  )
}

export default VersionItem