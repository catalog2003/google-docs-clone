import api from './api'

class PermissionService {
  async grantPermission(data) {
    const response = await api.post('/permissions/', data)
    return response.data
  }

  async revokePermission(id) {
    const response = await api.delete(`/permissions/${id}`)  // Fixed: backticks
    return response.data
  }

  async getDocumentPermissions(documentId) {
    const response = await api.get(`/permissions/document/${documentId}`)  // Fixed: backticks
    return response.data
  }

  async checkPermission(documentId, requiredRole) {
    const response = await api.get(`/permissions/check/${documentId}`, {  // Fixed: backticks
      params: { required_role: requiredRole }  // Fixed: params not parms
    })
    return response.data
  }
}

export default new PermissionService()