import api from './api'

class CommentService {
  async getDocumentComments(documentId) {
    if (!documentId) {
      throw new Error('Document ID is required')
    }
    const response = await api.get(`/comments/document/${documentId}`)
    return response.data
  }

  async createComment(data) {
    if (!data.document_id) {
      throw new Error('Document ID is required')
    }
    const response = await api.post('/comments/', data)
    return response.data
  }

  async updateComment(id, data) {
    if (!id) {
      throw new Error('Comment ID is required')
    }
    const response = await api.put(`/comments/${id}`, data)
    return response.data
  }

  async deleteComment(id) {
    if (!id) {
      throw new Error('Comment ID is required')
    }
    const response = await api.delete(`/comments/${id}`)
    return response.data
  }

  async resolveComment(id) {
    if (!id) {
      throw new Error('Comment ID is required')
    }
    const response = await api.post(`/comments/${id}/resolve`)
    return response.data
  }
}

export default new CommentService()