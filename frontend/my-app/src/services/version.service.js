import api from './api'

class VersionService {
  async getDocumentVersions(documentId) {
    const response = await api.get(`/versions/document/${documentId}`)
    return response.data
  }

  async createVersion(documentId, comment) {
    // FIX: use params object — not string interpolation (avoids URL encoding issues)
    const response = await api.post(`/versions/document/${documentId}`, null, {
      params: comment ? { comment } : {},
    })
    return response.data
  }

  async getVersion(id) {
    const response = await api.get(`/versions/${id}`)
    return response.data
  }

  async restoreVersion(versionId, documentId) {
    // FIX: use params object instead of manual string interpolation
    const response = await api.post(`/versions/${versionId}/restore`, null, {
      params: { document_id: documentId },
    })
    return response.data
  }
}

export default new VersionService()