// Используем переменные окружения
const isTauri = import.meta.env.VITE_APP_MODE === 'tauri';

// Для Tauri используем прямые IP, для Browser - относительные пути через прокси
export const API_BASE_URL = isTauri 
  ? 'http://192.168.1.72:8080/api'  // Tauri - прямые запросы
  : '/api';                         // Browser - через прокси Vite

export const IMAGE_BASE_URL = isTauri 
  ? 'http://192.168.1.72:9000'      // Tauri - прямые запросы  
  : '/minio';                       // Browser - через прокси Vite