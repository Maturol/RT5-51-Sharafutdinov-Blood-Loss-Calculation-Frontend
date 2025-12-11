import React, { useEffect } from 'react'
import { Container, Table, Button, Badge, Alert, Spinner } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { fetchBloodlosscalcs } from '../store/slices/bloodlosscalcSlice'
import { type HandlerBloodlosscalcResponse } from '../api/Api'

const BloodlosscalcsPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { requests, loading, error } = useAppSelector((state) => state.bloodlosscalc)
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    dispatch(fetchBloodlosscalcs())
  }, [dispatch, navigate, isAuthenticated])
  
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Мои заявки</h1>
        <Link to="/">
          <Button variant="outline-primary">На главную</Button>
        </Link>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {!requests || requests.length === 0 ? (
        <Alert variant="info">
          У вас пока нет заявок. <Link to="/operations">Перейти к операциям</Link>
        </Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Статус</th>
              <th>Дата создания</th>
              <th>Рост пациента</th>
              <th>Вес пациента</th>
              <th>Количество рассчитанных операций</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request: HandlerBloodlosscalcResponse) => (
              <tr key={request.id}>
                <td>{request.id || '-'}</td>
                <td>{getStatusBadge(request.status)}</td>
                <td>{request.created_at || '-'}</td>
                <td>{request.patient_height ? `${request.patient_height} м` : '-'}</td>
                <td>{request.patient_weight ? `${request.patient_weight} кг` : '-'}</td>
                <td>{request.calculated_count || '0'}</td>
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
      )}
    </Container>
  )
}

export default BloodlosscalcsPage