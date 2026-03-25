import React from 'react'
import { createPortal } from 'react-dom'
import { Box, Tooltip } from '@mui/material'

function RemoteCursor({ user }) {
  if (!user?.cursor || !user.cursor.index) return null

  // Create cursor element
  const cursor = document.createElement('span')
  cursor.style.position = 'absolute'
  cursor.style.left = '0'
  cursor.style.top = '0'
  cursor.style.width = '2px'
  cursor.style.height = '20px'
  cursor.style.backgroundColor = user.color
  cursor.style.transition = 'all 0.1s ease'
  cursor.style.pointerEvents = 'none'

  // Add user name label
  const label = document.createElement('span')
  label.textContent = user.name
  label.style.position = 'absolute'
  label.style.left = '2px'
  label.style.top = '-18px'
  label.style.fontSize = '12px'
  label.style.padding = '2px 6px'
  label.style.borderRadius = '3px'
  label.style.backgroundColor = user.color
  label.style.color = '#fff'
  label.style.whiteSpace = 'nowrap'
  label.style.fontFamily = 'sans-serif'
  cursor.appendChild(label)

  // Position cursor
  const editor = document.querySelector('.ql-editor')
  if (editor) {
    const range = editor.querySelector(`[data-index="${user.cursor.index}"]`)
    if (range) {
      const rect = range.getBoundingClientRect()
      cursor.style.transform = `translate(${rect.left}px, ${rect.top}px)`
    }
  }

  return createPortal(cursor, document.body)
}

export default RemoteCursor