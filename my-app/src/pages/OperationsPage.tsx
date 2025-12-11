import { type FC, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { 
  fetchOperations, 
  setSearchTerm, 
  addToCart,
  clearSearch 
} from '../store/slices/operationsSlice'
import { fetchCartInfo } from '../store/slices/bloodlosscalcSlice'
import { type HandlerOperation } from '../api/Api' // Импортируем сгенерированный тип

const defaultOperationImage = '/blood-loss-calc/default-operation.jpg'

export const OperationsPage: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  
  const [localSearchTerm, setLocalSearchTerm] = useState('')
  const [addingToCart, setAddingToCart] = useState<number | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const { 
    operations, 
    loading, 
    error, 
    searchTerm 
  } = useAppSelector((state) => state.operations)
  
  const { cartInfo } = useAppSelector((state) => state.bloodlosscalc)
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  
  // Загрузка операций при монтировании
  useEffect(() => {
    dispatch(fetchOperations())
  }, [dispatch])
  
  // Загрузка информации о корзине если пользователь авторизован
  useEffect(() => {
  if (isAuthenticated) {
    dispatch(fetchCartInfo()).then(result => {
      if (fetchCartInfo.rejected.match(result)) {
        // Если запрос упал с 401, возможно токен невалиден
        if (result.error.message?.includes('401')) {
          console.log('Token might be invalid, clearing auth...')
          // Можно очистить локальное хранилище
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          // Или диспатчить logout
          // dispatch(logoutUser())
        }
      }
    })
  }
}, [dispatch, isAuthenticated])
  
  // Синхронизация локального состояния поиска с Redux
  useEffect(() => {
    setLocalSearchTerm(searchTerm)
  }, [searchTerm])
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(setSearchTerm(localSearchTerm))
    dispatch(fetchOperations())
  }
  
  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value)
  }
  
  const handleClearSearch = () => {
    dispatch(clearSearch())
    setLocalSearchTerm('')
    dispatch(fetchOperations())
  }
  
  const handleAddToCart = async (operationId: number) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    setAddingToCart(operationId)
    setShowSuccess(false)
    
    try {
      // Используем Redux Thunk для добавления в корзину
      const result = await dispatch(addToCart({ operationId }))
      
      if (addToCart.fulfilled.match(result)) {
        // Обновляем информацию о корзине через Redux Thunk
        await dispatch(fetchCartInfo())
        setShowSuccess(true)
        
        // Скрываем сообщение об успехе через 3 секунды
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Ошибка при добавлении в заявку:', error)
    } finally {
      setAddingToCart(null)
    }
  }
  
  const handleViewCart = () => {
  if (cartInfo.current_request_id && (cartInfo.service_count || 0) > 0) {
    navigate(`/bloodlosscalcs/${cartInfo.current_request_id}`)
  } else {
    navigate('/bloodlosscalcs')
  }
}
  
  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1 className="text-center">Хирургические операции</h1>
        </Col>
      </Row>
      
      {/* Уведомления */}
      {showSuccess && (
        <Row className="mb-3">
          <Col>
            <Alert variant="success" onClose={() => setShowSuccess(false)} dismissible>
              Операция успешно добавлена в заявку!
            </Alert>
          </Col>
        </Row>
      )}
      
      {error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger">
              {error}
            </Alert>
          </Col>
        </Row>
      )}
      
      {/* Поиск с использованием Redux */}
      <Row className="mb-4">
        <Col>
          <Form onSubmit={handleSearch} className="search-form">
            <Form.Control 
              type="text" 
              placeholder="Поиск операций по названию..." 
              value={localSearchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              disabled={loading}
            />
            <Button 
              type="submit" 
              variant="primary"
              disabled={loading}
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                'Поиск'
              )}
            </Button>
            {searchTerm && (
              <Button 
                variant="outline-secondary" 
                onClick={handleClearSearch}
                className="ms-2"
                disabled={loading}
              >
                Очистить
              </Button>
            )}
          </Form>
        </Col>
      </Row>
      
      {/* Карточка корзины/заявки */}
<Row className="mb-4">
  <Col className="text-center">
    <div 
      className="bloodlosscalc-card"
      onClick={(cartInfo.service_count || 0) > 0 ? handleViewCart : undefined}
      style={{ 
        opacity: isAuthenticated && (cartInfo.service_count || 0) > 0 ? 1 : 0.5, 
        cursor: isAuthenticated && (cartInfo.service_count || 0) > 0 ? 'pointer' : 'not-allowed',
        display: 'inline-block',
        position: 'relative'
      }}
    >
      <div className="bloodlosscalc-image">
        <img 
          src="/minio/blood-loss-images/bloodlosscalc-image.png" 
          alt="Заявка" 
        />
      </div>
      <div className="bloodlosscalc-info">
        <p>Услуг: {cartInfo.service_count || 0}</p>
      </div>
    </div>
  </Col>
</Row>
      
      {/* Состояние загрузки - демонстрация Redux Thunk в действии */}
      {loading && (
        <Row className="mb-4">
          <Col className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Загрузка операций...</span>
            </Spinner>
            <p className="mt-2">Загружаем операции с сервера...</p>
          </Col>
        </Row>
      )}
      
      {/* Сетка операций с использованием сгенерированных типов */}
      <Row>
        <Col>
          <div className="operations-grid">
            {operations.length > 0 ? (
              operations.map((operation: HandlerOperation) => (
                <Card key={operation.id} className="operation-card">
                  <div className="operation-image">
                    <Card.Img 
                      variant="top"
                      src={operation.image_url || defaultOperationImage} 
                      alt={operation.title}
                      onError={(e) => {
                        e.currentTarget.src = defaultOperationImage
                      }}
                    />
                  </div>
                  <Card.Body className="operation-content">
                    <Card.Title>{operation.title}</Card.Title>
                    <Card.Text className="coefficient">
                      Коэффициент кровопотери: {operation.blood_loss_coeff}
                      <br />
                      Средний объем: {operation.avg_blood_loss} мл
                      <br />
                    </Card.Text>
                    <div className="operation-actions">
                      <Link to={`/operations/${operation.id}`}>
                        <Button variant="outline-primary" size="sm">
                          Подробнее
                        </Button>
                      </Link>
                      
                      {/* Кнопка добавления в заявку с анимацией загрузки */}
                      {addingToCart === operation.id ? (
                        <Button variant="secondary" size="sm" disabled>
                          <Spinner animation="border" size="sm" />
                        </Button>
                      ) : (
                        <Button 
                          variant="success" 
                          size="sm"
                          onClick={() => handleAddToCart(operation.id!)}
                          disabled={!isAuthenticated}
                          title={!isAuthenticated ? 'Требуется авторизация' : 
                                 operation.status !== 'active' ? 'Операция неактивна' : 
                                 'Добавить в заявку'}
                        >
                          Добавить в заявку
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              ))
            ) : (
              !loading && (
                <Col xs={12} className="text-center py-5">
                  <Alert variant="info">
                    {searchTerm ? 'По вашему запросу ничего не найдено' : 'Операции не найдены'}
                    {searchTerm && (
                      <Button 
                        variant="link" 
                        onClick={handleClearSearch}
                        className="p-0 ms-2"
                      >
                        Очистить поиск
                      </Button>
                    )}
                  </Alert>
                </Col>
              )
            )}
          </div>
        </Col>
      </Row>
    </Container>
  )
}