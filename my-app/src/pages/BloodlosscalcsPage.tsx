import React, { useEffect, useState } from 'react'
import { Container, Table, Button, Badge, Alert, Spinner, Form, Row, Col, Card } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { fetchBloodlosscalcs } from '../store/slices/bloodlosscalcSlice'
import { type HandlerBloodlosscalcResponse } from '../api/Api'
import { BreadCrumbs } from '../components/BreadCrumbs'

const BloodlosscalcsPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { requests, loading, error } = useAppSelector((state) => state.bloodlosscalc)
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  
  // Получаем сегодняшнюю дату в формате YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  // Все фильтры на фронтенде
  const [dateFrom, setDateFrom] = useState<string>(getTodayDate()) // Сегодняшняя дата по умолчанию
  const [dateTo, setDateTo] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [creatorFilter, setCreatorFilter] = useState<string>('')
  
  const [filteredRequests, setFilteredRequests] = useState<HandlerBloodlosscalcResponse[]>([])
  const [isFilterApplied, setIsFilterApplied] = useState<boolean>(false)
  const [allCreators, setAllCreators] = useState<string[]>([])
  
  // Состояния для управления статусами
  const [changingStatus, setChangingStatus] = useState<{ [key: number]: boolean }>({})
  const [statusError, setStatusError] = useState<string | null>(null)

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        const parts = dateString.split('.')
        if (parts.length === 3) {
          return dateString
        }
        return '-'
      }
      return date.toLocaleDateString('ru-RU')
    } catch {
      return '-'
    }
  }

  const isModerator = user?.is_moderator || false

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    const loadRequests = () => {
      dispatch(fetchBloodlosscalcs())
    }
    
    loadRequests()
    
    const intervalId = setInterval(loadRequests, 5000)
    
    return () => clearInterval(intervalId)
  }, [dispatch, navigate, isAuthenticated])
  
  useEffect(() => {
    if (requests) {
      if (isModerator) {
        const creators = Array.from(new Set(
          requests
            .filter(r => r.creator_login)
            .map(r => r.creator_login!)
        ))
        setAllCreators(creators)
      }
      
      if (isFilterApplied) {
        applyFilters(requests)
      } else {
        let initialFiltered = [...requests]
        if (!isModerator) {
          initialFiltered = initialFiltered.filter(request => 
            request.creator_login === user?.username
          )
        }
        setFilteredRequests(initialFiltered)
      }
    }
  }, [requests, isModerator, user?.username, isFilterApplied])
  
  const applyFilters = (requestsList: HandlerBloodlosscalcResponse[]) => {
    let filtered = [...requestsList]
    
    if (!isModerator) {
      filtered = filtered.filter(request => 
        request.creator_login === user?.username
      )
    }
    
    if (statusFilter) {
      filtered = filtered.filter(request => request.status === statusFilter)
    }
    
    if (isModerator && creatorFilter) {
      filtered = filtered.filter(request => 
        request.creator_login?.toLowerCase().includes(creatorFilter.toLowerCase())
      )
    }
    
    if (dateFrom) {
      filtered = filtered.filter(request => {
        if (!request.created_at) return false
        const requestDate = new Date(request.created_at)
        const fromDate = new Date(dateFrom)
        return requestDate >= fromDate
      })
    }
    
    if (dateTo) {
      filtered = filtered.filter(request => {
        if (!request.created_at) return false
        const requestDate = new Date(request.created_at)
        const toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999)
        return requestDate <= toDate
      })
    }
    
    setFilteredRequests(filtered)
    setIsFilterApplied(true)
  }
  
  const handleApplyFilters = () => {
    if (requests) {
      applyFilters(requests)
    }
  }
  
  const handleResetFilters = () => {
    // Сбрасываем на пустые значения как было раньше
    setDateFrom('')
    setDateTo('')
    setStatusFilter('')
    setCreatorFilter('')
    setIsFilterApplied(false)
    
    if (requests) {
      let initialFiltered = [...requests]
      if (!isModerator) {
        initialFiltered = initialFiltered.filter(request => 
          request.creator_login === user?.username
        )
      }
      setFilteredRequests(initialFiltered)
    }
  }
  
  // Кнопки активны если есть хоть один измененный фильтр
  const hasChangedFilters = () => {
    return dateFrom !== getTodayDate() || dateTo || statusFilter || (isModerator && creatorFilter)
  }
  
  const handleCompleteRequest = async (requestId: number) => {
    if (!window.confirm('Запустить расчет кровопотери? Это займет 5-10 секунд.')) {
      return
    }
    
    setChangingStatus(prev => ({ ...prev, [requestId]: true }))
    setStatusError(null)
    
    try {
      const response = await fetch(`http://localhost:8080/api/bloodlosscalcs/${requestId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      alert(`Расчет запущен! ${data.note}`)
      
      setTimeout(() => {
        dispatch(fetchBloodlosscalcs())
      }, 1000)
      
    } catch (error: any) {
      console.error('Ошибка запуска расчета:', error)
      setStatusError(error.message || 'Ошибка запуска расчета')
    } finally {
      setChangingStatus(prev => ({ ...prev, [requestId]: false }))
    }
  }
  
  // НОВАЯ ФУНКЦИЯ: Отклонение заявки (вместо удаления)
  const handleRejectRequest = async (requestId: number) => {
    if (!window.confirm('Вы уверены, что хотите отклонить эту заявку?')) {
      return
    }
    
    setChangingStatus(prev => ({ ...prev, [requestId]: true }))
    setStatusError(null)
    
    try {
      // Отправляем запрос на отклонение
      const response = await fetch(`http://localhost:8080/api/bloodlosscalcs/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      console.log(`Заявка отклонена модератором ID: ${data.moderator_id}`)
      
      setTimeout(() => {
        dispatch(fetchBloodlosscalcs())
      }, 1000)
      
    } catch (error: any) {
      console.error('Ошибка отклонения:', error)
      setStatusError(error.message || 'Ошибка отклонения заявки')
    } finally {
      setChangingStatus(prev => ({ ...prev, [requestId]: false }))
    }
  }
  
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'черновик':
        return <Badge bg="secondary">Черновик</Badge>
      case 'сформирована':
        return <Badge bg="info">Сформирована</Badge>
      case 'завершена':
        return <Badge bg="success">Завершена</Badge>
      case 'отклонена': // НОВЫЙ СТАТУС
        return <Badge bg="danger">Отклонена</Badge>
      case 'удален':
        return <Badge bg="dark">Удалена</Badge>
      default:
        return <Badge bg="light" text="dark">{status || 'Неизвестно'}</Badge>
    }
  }

  if (loading && !requests.length) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
        <p className="mt-2">Загрузка заявок...</p>
      </Container>
    )
  }
  
  return (
    <Container className="py-5">
      <BreadCrumbs crumbs={[
        { label: 'Заявки', path: '/bloodlosscalcs' }
      ]} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{isModerator ? 'Заявки' : 'Мои заявки'}</h1>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {statusError && <Alert variant="danger" onClose={() => setStatusError(null)} dismissible>{statusError}</Alert>}
      
      <Card className="mb-4">
        <Card.Body>
          <h5 className="mb-3">Фильтры заявок</h5>
          
          <Row className="align-items-end">
            <Col md={isModerator ? 3 : 4} sm={6} className="mb-3">
              <Form.Group>
                <Form.Label>Статус заявки</Form.Label>
                <Form.Select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Все статусы</option>
                  <option value="черновик">Черновик</option>
                  <option value="сформирована">Сформирована</option>
                  <option value="завершена">Завершена</option>
                  <option value="отклонена">Отклонена</option> {/* НОВЫЙ СТАТУС */}
                  <option value="удален">Удалена</option>
                  {/* СТАТУС "в процессе расчета" УБРАН */}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={isModerator ? 3 : 4} sm={6} className="mb-3">
              <Form.Group>
                <Form.Label>Дата создания от</Form.Label>
                <Form.Control
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  max={dateTo || undefined}
                />
              </Form.Group>
            </Col>
            
            <Col md={isModerator ? 3 : 4} sm={6} className="mb-3">
              <Form.Group>
                <Form.Label>Дата создания до</Form.Label>
                <Form.Control
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  min={dateFrom || undefined}
                />
              </Form.Group>
            </Col>
            
            {isModerator && (
              <Col md={3} sm={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Создатель</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="text"
                      placeholder="Имя создателя..."
                      value={creatorFilter}
                      onChange={(e) => setCreatorFilter(e.target.value)}
                      list="creatorSuggestions"
                    />
                    <datalist id="creatorSuggestions">
                      {allCreators.map(creator => (
                        <option key={creator} value={creator} />
                      ))}
                    </datalist>
                  </div>
                </Form.Group>
              </Col>
            )}
            
            <Col md={isModerator ? 3 : 4} sm={6} className="mb-3">
              <div className="d-flex flex-column gap-2">
                <Button 
                  variant="primary" 
                  onClick={handleApplyFilters}
                  className="w-100"
                  // Кнопка активна всегда, даже если стоит только сегодняшняя дата
                  disabled={loading}
                >
                  Применить фильтры
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={handleResetFilters}
                  className="w-100"
                  // Кнопка активна всегда
                  disabled={loading}
                >
                  Сбросить фильтры
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {!filteredRequests || filteredRequests.length === 0 ? (
        <Alert variant="info">
          {requests && requests.length > 0 && isFilterApplied
            ? 'По выбранным фильтрам заявок не найдено.'
            : 'Заявок нет.'}
          {!isFilterApplied && <Link to="/operations"> Создать заявку</Link>}
        </Alert>
      ) : (
        <>
          <div className="table-responsive">
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Статус</th>
                  <th>Дата создания</th>
                  {isModerator && <th>Создатель</th>}
                  <th>Рост пациента (м)</th>
                  <th>Вес пациента (кг)</th>
                  <th>Количество рассчитаных операций</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request: HandlerBloodlosscalcResponse) => {
                  const isChanging = changingStatus[request.id!] || false
                  
                  return (
                    <tr key={request.id}>
                      <td>{request.id || '-'}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {getStatusBadge(request.status)}
                          {/* СПИННЕР ДЛЯ "в процессе расчета" УБРАН */}
                        </div>
                      </td>
                      <td>{formatDate(request.created_at)}</td>
                      
                      {isModerator && (
                        <td>
                          {request.creator_login || '-'}
                          {request.creator_login === user?.username && (
                            <Badge bg="info" className="ms-1">Вы</Badge>
                          )}
                        </td>
                      )}
                      
                      <td className="text-center">{request.patient_height ? request.patient_height.toFixed(2) : '-'}</td>
                      <td className="text-center">{request.patient_weight || '-'}</td>
                      <td className="text-center">
                        {request.calculated_count !== undefined ? (
                          <Badge bg={request.calculated_count > 0 ? 'success' : 'secondary'}>
                            {request.calculated_count}
                          </Badge>
                        ) : '0'}
                      </td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <Link to={`/bloodlosscalcs/${request.id}`}>
                            <Button variant="outline-primary" size="sm">
                              Просмотреть
                            </Button>
                          </Link>
                          
                          {/* Кнопка завершения для модератора - только для сформированных заявок */}
                          {isModerator && request.status === 'сформирована' && (
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => handleCompleteRequest(request.id!)}
                              disabled={isChanging}
                            >
                              {isChanging ? (
                                <>
                                  <Spinner animation="border" size="sm" className="me-1" />
                                  Запуск...
                                </>
                              ) : (
                                'Завершить'
                              )}
                            </Button>
                          )}
                          
                          {/* Кнопка отклонения для модератора - для сформированных заявок (вместо удаления) */}
                          {isModerator && request.status === 'сформирована' && (
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleRejectRequest(request.id!)}
                              disabled={isChanging}
                            >
                              Отклонить
                            </Button>
                          )}
                          
                          {/* Старая кнопка удаления убрана */}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </div>
        </>
      )}
    </Container>
  )
}

export default BloodlosscalcsPage