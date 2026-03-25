import api from './api'

class AuthService {
    async register(userData){

        const response = await api.post('/auth/register', userData)
        return response.data

    }

    async login(credentials) {
        const formData = new FormData()
        formData.append('username', credentials.email)
        formData.append('password',credentials.password)

        const response = await api.post('/auth/login', formData,{
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })

        return response.data
    }

    async getCurrentUser() {
        const response = await api.get('/auth/me')
        return response.data
    }

    logout() {
        localStorage.removeItem('auth-storage')
    }
}
export default new AuthService()