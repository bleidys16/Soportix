export const environment = {
  production: true,
  apiUrl: (import.meta as any).env?.NG_API_URL || 'http://localhost:8000/api'
};