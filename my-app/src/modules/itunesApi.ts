const isTauri = (): boolean => {
  return true // Для Tauri
}

const getAPIBase = (): string => {
  if (isTauri()) {
    return 'http://10.147.17.105:8080/api'
  }
  return '/api'
}

const API_BASE = getAPIBase()
const DEFAULT_IMAGE = '/default-operation.jpg'

export interface Operation {
  id: number
  title: string
  description: string
  status: string
  image_url: string | null
  blood_loss_coeff: number
  avg_blood_loss: number
}

export interface OperationResult {
  operations: Operation[]
}

export interface CartInfo {
  current_request_id: number
  service_count: number
}

// Простая проверка доступности бэкенда
const checkBackendAvailable = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/operations`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000)
    })
    return response.ok
  } catch (error) {
    return false
  }
}

// URL для иконок с бэкенда
const getBackendImageUrl = (imageName: 'homeIcon' | 'cartIcon'): string => {
  const filename = imageName === 'homeIcon' ? 'home-icon.png' : 'bloodlosscalc-image.png'
  return `http://10.147.17.105:9000/blood-loss-images/${filename}`
}

// Получение URL иконки с проверкой доступности
export const getImageUrl = async (imageName: 'homeIcon' | 'cartIcon'): Promise<string> => {
  const backendAvailable = await checkBackendAvailable()
  
  if (backendAvailable) {
    const url = getBackendImageUrl(imageName)
    
    // Дополнительно проверяем доступность самой иконки
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(1000) 
      })
      if (response.ok) {
        return url
      }
    } catch (error) {
      // Иконка недоступна
    }
  }
  
  return '' // Пустая строка для пустой иконки
}

const transformBackendOperation = (backendOp: any): Operation => {
  // Преобразуем URL изображения
  let imageUrl = backendOp.ImageURL || backendOp.image_url || '';
  
  if (imageUrl) {
    // Заменяем localhost:3000 на правильный адрес для Tauri
    if (imageUrl.includes('https://localhost:3000/minio')) {
      imageUrl = imageUrl.replace('https://localhost:3000/minio', 'http://10.147.17.105:9000');
    }
    // Также заменяем http://localhost если есть
    else if (imageUrl.includes('http://localhost')) {
      imageUrl = imageUrl.replace('http://localhost', 'http://10.147.17.105');
    }
  }
  
  return {
    id: backendOp.ID || backendOp.id,
    title: backendOp.Title || backendOp.title,
    description: backendOp.Description || backendOp.description,
    status: backendOp.Status || backendOp.status,
    image_url: imageUrl || DEFAULT_IMAGE,
    blood_loss_coeff: backendOp.BloodLossCoeff || backendOp.blood_loss_coeff,
    avg_blood_loss: backendOp.AvgBloodLoss || backendOp.avg_blood_loss
  }
}

export const getOperations = async (name = ''): Promise<OperationResult> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)
    
    const url = name 
      ? `${API_BASE}/operations?title=${encodeURIComponent(name)}`
      : `${API_BASE}/operations`
    
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)
    
    if (response.ok) {
      const backendData = await response.json()
      const operations = backendData.operations || backendData
      const transformedOperations = Array.isArray(operations) 
        ? operations.map(transformBackendOperation)
        : []
      return { operations: transformedOperations }
    }
    
    throw new Error('API error')
  } catch (error) {
    // Используем mock данные
    const { OPERATIONS_MOCK } = await import('./mock')
    const filteredOperations = OPERATIONS_MOCK.filter(op =>
      op.title.toLowerCase().includes(name.toLowerCase())
    )
    return { operations: filteredOperations }
  }
}

export const getOperationById = async (id: number | string): Promise<Operation> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)
    
    const response = await fetch(`${API_BASE}/operations/${id}`, { signal: controller.signal })
    clearTimeout(timeoutId)
    
    if (response.ok) {
      const backendOp = await response.json()
      return transformBackendOperation(backendOp)
    }
    
    throw new Error('API error')
  } catch (error) {
    const { OPERATIONS_MOCK } = await import('./mock')
    const operation = OPERATIONS_MOCK.find(op => op.id === parseInt(id as string))
    if (!operation) throw new Error('Operation not found')
    return operation
  }
}

export const getCartInfo = async (): Promise<CartInfo> => {
  try {
    const response = await fetch(`${API_BASE}/operationcart`, { 
      signal: AbortSignal.timeout(2000) 
    })
    
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    // ignore
  }
  
  return { current_request_id: 0, service_count: 0 }
}