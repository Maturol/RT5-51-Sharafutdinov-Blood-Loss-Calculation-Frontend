const getAPIBase = () => {
  if (import.meta.env.DEV) {
    return 'http://localhost:8080/api'
  }
  
  const serverIP = localStorage.getItem('server_ip') || '192.168.1.100'
  return `http://${serverIP}:8080/api`
}

const API_BASE = getAPIBase()
const DEFAULT_IMAGE = import.meta.env.TAURI_ENV 
  ? './default-operation.jpg' 
  : '/blood-loss-calc/default-operation.jpg'

export interface Operation {
  ID: number
  Title: string
  Description: string
  Status: string
  ImageURL: string | null
  BloodLossCoeff: number
  AvgBloodLoss: number
}

export interface CartInfo {
  current_request_id: number
  service_count: number
}

export const transformBackendOperation = (backendOp: any): any => {
  return {
    id: backendOp.ID,
    title: backendOp.Title,
    description: backendOp.Description,
    status: backendOp.Status,
    image_url: (backendOp.ImageURL && backendOp.ImageURL.startsWith('http')) 
      ? backendOp.ImageURL 
      : DEFAULT_IMAGE,
    blood_loss_coeff: backendOp.BloodLossCoeff,
    avg_blood_loss: backendOp.AvgBloodLoss
  }
}

export const getOperations = async (name = ''): Promise<{ operations: any[] }> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    
    const url = name 
      ? `${API_BASE}/operations?title=${encodeURIComponent(name)}`
      : `${API_BASE}/operations`
    
    console.log('🔍 Fetching from:', url)
    
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    })
    
    clearTimeout(timeoutId)
    
    if (response.ok) {
      const data = await response.json()
      const transformedOperations = data.operations?.map(transformBackendOperation) || []
      console.log('✅ Got', transformedOperations.length, 'operations from API')
      return { operations: transformedOperations }
    }
    
    console.warn('⚠️ API error:', response.status)
    throw new Error('API error')
  } catch (error) {
    console.error('❌ Network error, using mock:', error)
    
    const { OPERATIONS_MOCK } = await import('./mock')
    const filteredOperations = OPERATIONS_MOCK.filter(op =>
      op.title.toLowerCase().includes(name.toLowerCase())
    )
    console.log('🔄 Using', filteredOperations.length, 'mock operations')
    return { operations: filteredOperations }
  }
}

export const getCartInfo = async (): Promise<CartInfo> => {
  try {
    const response = await fetch(`${API_BASE}/operationcart`)
    
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('❌ Error fetching cart info:', error)
  }
  
  return { current_request_id: 0, service_count: 0 }
}

export const getOperationById = async (id: number | string): Promise<any> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    
    const response = await fetch(`${API_BASE}/operations/${id}`, { 
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    })
    
    clearTimeout(timeoutId)
    
    if (response.ok) {
      const backendOp = await response.json()
      return transformBackendOperation(backendOp)
    }
  } catch (error) {
    console.error('❌ Error fetching operation:', error)
  }
  
  const { OPERATIONS_MOCK } = await import('./mock')
  const operation = OPERATIONS_MOCK.find(op => op.id === parseInt(id as string))
  if (operation) return operation
  
  throw new Error('Operation not found')
}