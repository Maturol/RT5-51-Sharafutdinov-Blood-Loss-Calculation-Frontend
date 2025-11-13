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

const API_BASE = 'http://localhost:8080/api'

// Быстрый fallback - короткий timeout для fetch
export const getOperations = async (name = ''): Promise<OperationResult> => {
  try {
    const url = name ? `${API_BASE}/operations?title=${encodeURIComponent(name)}` : `${API_BASE}/operations`
    
    // Короткий timeout чтобы не ждать долго если бэкенд недоступен
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 200) // 1 секунда timeout
    
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)
    
    if (!response.ok) throw new Error('API недоступен')
    const data = await response.json()
    return data
  } catch (error) {
    // Мгновенный fallback на mock данные
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
    const timeoutId = setTimeout(() => controller.abort(), 200)
    
    const response = await fetch(`${API_BASE}/operations/${id}`, { signal: controller.signal })
    clearTimeout(timeoutId)
    
    if (!response.ok) throw new Error('API недоступен')
    return response.json()
  } catch (error) {
    // Мгновенный fallback на mock данные
    const { OPERATIONS_MOCK } = await import('./mock')
    const operation = OPERATIONS_MOCK.find(op => op.id === parseInt(id as string))
    if (!operation) throw new Error('Operation not found')
    return operation
  }
}