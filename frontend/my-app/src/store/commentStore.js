import { create } from 'zustand'
import commentService from '../services/comment.service'

export const useCommentStore = create((set) => ({
  comments: [],
  isLoading: false,
  error: null,

  fetchComments: async (documentId) => {
    set({ isLoading: true, error: null })
    try {
      const comments = await commentService.getDocumentComments(documentId)
      set({ comments, isLoading: false })
    } catch (error) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch comments',
        isLoading: false,
      })
    }
  },

  addComment: async (commentData) => {
    try {
      const comment = await commentService.createComment(commentData)
      // FIX: replies go under parent, not at top level
      set((state) => ({
        comments: commentData.parent_id
          ? state.comments.map((c) =>
              c.id === commentData.parent_id
                ? { ...c, replies: [...(c.replies || []), comment] }
                : c
            )
          : [comment, ...state.comments],
      }))
      return comment
    } catch (error) {
      throw error
    }
  },

  updateComment: async (id, data) => {
    try {
      const comment = await commentService.updateComment(id, data)
      set((state) => ({
        comments: state.comments.map((c) => (c.id === id ? comment : c)),
      }))
      return comment
    } catch (error) {
      throw error
    }
  },

  deleteComment: async (id) => {
    try {
      await commentService.deleteComment(id)
      // FIX: also remove from replies arrays
      set((state) => ({
        comments: state.comments
          .filter((c) => c.id !== id)
          .map((c) => ({
            ...c,
            replies: (c.replies || []).filter((r) => r.id !== id),
          })),
      }))
    } catch (error) {
      throw error
    }
  },

  resolveComment: async (id) => {
    try {
      const comment = await commentService.resolveComment(id)
      set((state) => ({
        comments: state.comments.map((c) => (c.id === id ? comment : c)),
      }))
      return comment
    } catch (error) {
      throw error
    }
  },

  clearComments: () => set({ comments: [], error: null }),
}))