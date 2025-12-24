import React, { useEffect, useState } from 'react'
import { Container, Table, Button, Badge, Alert, Spinner, Form, Row, Col, Card } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { fetchBloodlosscalcs } from '../store/slices/bloodlosscalcSlice'
import { type HandlerBloodlosscalcResponse } from '../api/Api'
import { BreadCrumbs } from '../components/BreadCrumbs'

// Функция для парсинга даты в формате "DD.MM.YYYY"
const parseDateFromDDMMYYYY = (dateStr?: string): Date | null => {
  if (!dateStr) return null
  
  try {
    const parts = dateStr.split('.')
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const year = parseInt(parts[2], 10)
      return new Date(year, month, day)
    }
    return null
  } catch {
    return null
  }
}

// Функция для форматирования Date в "YYYY-MM-DD"
const formatDateToInput = (date: Date): string => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

const BloodlosscalcsPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { requests, loading, error } = useAppSelector((state) => state.bloodlosscalc)
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  
  // Состояния для фильтров
  const [dateFrom, setDateFrom] = useState<string>(formatDateToInput(new Date())) // Сегодняшняя дата по умолчанию
  const [dateTo, setDateTo] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [filteredRequests, setFilteredRequests] = useState<HandlerBloodlosscalcResponse[]>([])
  const [isFilterApplied, setIsFilterApplied] = useState(false)
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    dispatch(fetchBloodlosscalcs())
  }, [dispatch, navigate, isAuthenticated])
  
  // При загрузке заявок показываем все
  useEffect(() => {
    if (requests) {
      setFilteredRequests(requests)
      setIsFilterApplied(false)
    }
  }, [requests])
  
  // Функция для применения фильтров
  const handleApplyFilters = () => {
    if (!requests || requests.length === 0) {
      setFilteredRequests([])
      return
    }
    
    let filtered = [...requests]
    
    // Фильтрация по статусу
    if (statusFilter) {
      filtered = filtered.filter(request => request.status === statusFilter)
    }
    
    // Фильтрация по дате "от"
    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      
      filtered = filtered.filter(request => {
        const requestDate = parseDateFromDDMMYYYY(request.created_at)
        if (!requestDate) return false
        return requestDate >= fromDate
      })
    }
    
    // Фильтрация по дате "до"
    if (dateTo) {
      const toDate = new Date(dateTo)
      
      filtered = filtered.filter(request => {
        const requestDate = parseDateFromDDMMYYYY(request.created_at)
        if (!requestDate) return false
        return requestDate <= toDate
      })
    }
    
    setFilteredRequests(filtered)
    setIsFilterApplied(true)
  }
  
  // Функция для сброса всех фильтров
  const handleResetFilters = () => {
    setDateFrom(formatDateToInput(new Date())) // Сброс к сегодняшней дате
    setDateTo('')
    setStatusFilter('')
    if (requests) {
      setFilteredRequests(requests)
    }
    setIsFilterApplied(false)
  }
  
  // Проверка, есть ли активные фильтры
  const hasActiveFilters = () => {
    return dateFrom || dateTo || statusFilter
  }
  
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'черновик':
        return <Badge bg="secondary">Черновик</Badge>
      case 'сформирована':
        return <Badge bg="info">Сформирована</Badge>
      case 'завершена':
        return <Badge bg="success">Завершена</Badge>
      case 'удален':
        return <Badge bg="danger">Удалена</Badge>
      default:
        return <Badge bg="light" text="dark">{status || 'Неизвестно'}</Badge>
    }
  }
  
  if (loading) {
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
        <h1>Мои заявки</h1>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Карточка с фильтрами */}
      <Card className="mb-4">
        <Card.Body>
          <h5 className="mb-3">Фильтры заявок</h5>
          <Row className="align-items-end">
            {/* Фильтр по статусу */}
            <Col md={3} sm={6} className="mb-3">
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
                  <option value="удален">Удалена</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            {/* Фильтр по дате "от" */}
            <Col md={3} sm={6} className="mb-3">
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
            
            {/* Фильтр по дате "до" */}
            <Col md={3} sm={6} className="mb-3">
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
            
            {/* Кнопки действий */}
            <Col md={3} sm={6} className="mb-3">
              <div className="d-flex flex-column gap-2">
                <Button 
                  variant="primary" 
                  onClick={handleApplyFilters}
                  className="w-100"
                  disabled={!hasActiveFilters()}
                >
                  Применить фильтры
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={handleResetFilters}
                  className="w-100"
                  disabled={!isFilterApplied && !hasActiveFilters()}
                >
                  Сбросить фильтры
                </Button>
              </div>
            </Col>
          </Row>
          
          {/* Информация о результатах фильтрации */}
          <div className="mt-2">
            {isFilterApplied ? (
              <Alert variant="info" className="py-2 mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Найдено: <strong>{filteredRequests.length}</strong> из {requests?.length || 0}
                  </small>
                </div>
              </Alert>
            ) : (
              <div className="text-muted">
                <small>
                  Всего заявок: <strong>{requests?.length || 0}</strong>
                </small>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
      
      {!filteredRequests || filteredRequests.length === 0 ? (
        <Alert variant="info">
          {requests && requests.length > 0 && isFilterApplied
            ? 'По выбранным фильтрам заявок не найдено. Попробуйте изменить критерии поиска.'
            : 'У вас пока нет заявок. '}
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
                  <th>Рост пациента (м)</th>
                  <th>Вес пациента (кг)</th>
                  <th>Количество рассчитаных операций</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request: HandlerBloodlosscalcResponse) => (
                  <tr key={request.id}>
                    <td>{request.id || '-'}</td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td>{request.created_at || '-'}</td>
                    <td className="text-center">{request.patient_height ? request.patient_height.toFixed(2) : '-'}</td>
                    <td className="text-center">{request.patient_weight || '-'}</td>
                    <td className="text-center">{request.calculated_count || '0'}</td>
                    <td>
                      <Link to={`/bloodlosscalcs/${request.id}`}>
                        <Button variant="outline-primary" size="sm">
                          Просмотреть
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </>
      )}
    </Container>
  )
}

export default BloodlosscalcsPage