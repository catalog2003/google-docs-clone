export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePassword = (password) => {
  return password.length >= 8
}

export const validateUsername = (username) => {
  return username.length >= 3 && username.length <= 50
}

export const validateDocumentTitle = (title) => {
  return title && title.trim().length > 0 && title.length <= 255
}