import { create } from 'zustand'
import documentService from '../services/document.service'

export const useDocumentStore = create((set, get) => ({
  documents: [],
  currentDocument: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchDocuments: async () => {
    set({ isLoading: true, error: null })
    try {
      const documents = await documentService.getDocuments()
      set({ documents, isLoading: false })
    } catch (error) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch documents',
        isLoading: false,
      })
    }
  },

  createDocument: async (title) => {
    set({ isLoading: true, error: null })
    try {
      const document = await documentService.createDocument({ title })
      set((state) => ({ documents: [document, ...state.documents], isLoading: false }))
      return document
    } catch (error) {
      set({
        error: error.response?.data?.detail || 'Failed to create document',
        isLoading: false,
      })
      throw error
    }
  },

  getDocument: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const document = await documentService.getDocument(id)
      set({ currentDocument: document, isLoading: false })
      return document
    } catch (error) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch document',
        isLoading: false,
      })
      throw error
    }
  },

  // CRITICAL: never set isLoading here — it unmounts the Quill/Yjs editor
  updateDocument: async (id, data) => {
    set({ isSaving: true })
    try {
      const document = await documentService.updateDocument(id, data)
      set((state) => ({
        currentDocument: document,
        documents: state.documents.map((d) => (d.id === id ? document : d)),
        isSaving: false,
      }))
      return document
    } catch (error) {
      set({
        error: error.response?.data?.detail || 'Failed to update document',
        isSaving: false,
      })
      throw error
    }
  },

  deleteDocument: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await documentService.deleteDocument(id)
      set((state) => ({
        documents: state.documents.filter((d) => d.id !== id),
        // FIX: clear currentDocument if the deleted doc was open
        currentDocument: get().currentDocument?.id === id ? null : get().currentDocument,
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error.response?.data?.detail || 'Failed to delete document',
        isLoading: false,
      })
      throw error
    }
  },

  shareDocument: async (id, email, role) => {
    set({ isSaving: true, error: null })
    try {
      const result = await documentService.shareDocument(id, { user_email: email, role })
      set({ isSaving: false })
      return result
    } catch (error) {
      set({
        error: error.response?.data?.detail || 'Failed to share document',
        isSaving: false,
      })
      throw error
    }
  },

  clearCurrentDocument: () => set({ currentDocument: null, error: null }),
}))