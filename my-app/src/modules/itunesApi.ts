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

const API_BASE = 'http://localhost:8080/api'

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
    
    // Добавляем параметр поиска в URL
    const url = name 
      ? `${API_BASE}/operations?title=${encodeURIComponent(name)}`
      : `${API_BASE}/operations`
    
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)
    
    if (response.ok) {
      const backendData: BackendOperationResult = await response.json()
      const transformedOperations = backendData.operations.map(transformBackendOperation)
      return { operations: transformedOperations }
    }
  } catch (error) {
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
    const timeoutId = setTimeout(() => controller.abort(), 500)
    
    const response = await fetch(`${API_BASE}/operations/${id}`, { signal: controller.signal })
    clearTimeout(timeoutId)
    
    if (response.ok) {
      const backendOp: BackendOperation = await response.json()
      return transformBackendOperation(backendOp)
    }
  } catch (error) {
    // Игнорируем ошибки, используем mock
  }
  
  const { OPERATIONS_MOCK } = await import('./mock')
  const operation = OPERATIONS_MOCK.find(op => op.id === parseInt(id as string))
  if (!operation) throw new Error('Operation not found')
  return operation
}