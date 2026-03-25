export const WS_MESSAGE_TYPES = {
  CURSOR_UPDATE: 'cursor_update',
  TYPING_START: 'typing_start',
  TYPING_END: 'typing_end',
  OPERATION: 'operation',
  PRESENCE: 'presence',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  ROOM_STATE: 'room_state',
  PRESENCE_UPDATE: 'presence_update'
}

export const createCursorMessage = (cursor) => ({
  type: WS_MESSAGE_TYPES.CURSOR_UPDATE,
  cursor
})

export const createTypingStartMessage = () => ({
  type: WS_MESSAGE_TYPES.TYPING_START
})

export const createTypingEndMessage = () => ({
  type: WS_MESSAGE_TYPES.TYPING_END
})