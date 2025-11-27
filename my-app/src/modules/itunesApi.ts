import { API_BASE_URL } from '../config';

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

interface BackendOperation {
  ID: number
  Title: string
  Description: string
  Status: string
  ImageURL: string | null
  BloodLossCoeff: number
  AvgBloodLoss: number
}

interface BackendOperationResult {
  operations: BackendOperation[]
}

const transformBackendOperation = (backendOp: BackendOperation): Operation => {
  return {
    id: backendOp.ID,
    title: backendOp.Title,
    description: backendOp.Description,
    status: backendOp.Status,
    image_url: backendOp.ImageURL,
    blood_loss_coeff: backendOp.BloodLossCoeff,
    avg_blood_loss: backendOp.AvgBloodLoss
  }
}

export const getOperations = async (name = ''): Promise<OperationResult> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 500)
    
    const url = name 
      ? `${API_BASE_URL}/operations?title=${encodeURIComponent(name)}`
      : `${API_BASE_URL}/operations`;
    
    
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      }
    })
    clearTimeout(timeoutId)
    
    if (response.ok) {
      const backendData: BackendOperationResult = await response.json()
      const transformedOperations = backendData.operations.map(transformBackendOperation)
      return { operations: transformedOperations }
    }
  } catch (error) {
    console.error('API error:', error)
    // Игнорируем ошибки, используем mock
  }
  
  // Fallback на mock данные
  const { OPERATIONS_MOCK } = await import('./mock')
  const filteredOperations = OPERATIONS_MOCK.filter(op =>
    op.title.toLowerCase().includes(name.toLowerCase())
  )
  return { operations: filteredOperations }
}

export const getOperationById = async (id: number | string): Promise<Operation> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(`${API_BASE_URL}/operations/${id}`, { 
      signal: controller.signal 
    })
    clearTimeout(timeoutId)
    
    if (response.ok) {
      const backendOp: BackendOperation = await response.json()
      return transformBackendOperation(backendOp)
    }
  } catch (error) {
    console.error('API error:', error)
    // Игнорируем ошибки, используем mock
  }
  
  const { OPERATIONS_MOCK } = await import('./mock')
  const operation = OPERATIONS_MOCK.find(op => op.id === parseInt(id as string))
  if (!operation) throw new Error('Operation not found')
  return operation
}

export interface CartInfo {
  current_request_id: number
  service_count: number
}

export const getCartInfo = async (): Promise<CartInfo> => {
  try {
    const response = await fetch(`${API_BASE_URL}/operationcart`, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Error fetching cart info:', error)
  }
  
  // Fallback если бэкенд недоступен
  return { current_request_id: 0, service_count: 0 }
}