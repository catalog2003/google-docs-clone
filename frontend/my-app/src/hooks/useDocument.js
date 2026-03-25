import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useDocumentStore } from '../store/documentStore'

export const useDocument = (documentId) => {
  const { id } = useParams()
  const docId = documentId || id
  
  const { 
    currentDocument, 
    isLoading, 
    error,
    getDocument,
    updateDocument 
  } = useDocumentStore()

  useEffect(() => {
    if (docId) {
      getDocument(docId)
    }
  }, [docId])

  return {
    document: currentDocument,
    isLoading,
    error,
    updateDocument
  }
}

