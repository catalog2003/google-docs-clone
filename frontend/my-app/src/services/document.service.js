import api from './api'

class DocumentService {
  async getDocuments(params = {}) {
    const response = await api.get('/documents/', { params })
    return response.data
  }

  async getDocument(id) {
    if (!id) {
      throw new Error('Document ID is required')
    }
    const response = await api.get(`/documents/${id}`)
    return response.data
  }

  async createDocument(data) {
    const response = await api.post('/documents/', data)
    return response.data
  }

  async updateDocument(id, data) {
    if (!id) {
      throw new Error('Document ID is required')
    }
    const response = await api.put(`/documents/${id}`, data)
    return response.data
  }

  async deleteDocument(id) {
    if (!id) {
      throw new Error('Document ID is required')
    }
    const response = await api.delete(`/documents/${id}`)
    return response.data
  }

  async shareDocument(id, data) {
    if (!id) {
      throw new Error('Document ID is required')
    }
    const response = await api.post(`/documents/${id}/share`, data)
    return response.data
  }
}

export default new DocumentService()