import { type FC, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap'
import { 
  type Operation, 
  getOperations, 
  getCartInfo, 
  type CartInfo,
  getImageUrl
} from '../modules/itunesApi'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { setSearchTerm } from '../store/slices/filtersSlice'

const DEFAULT_OPERATION_IMAGE = '/default-operation.jpg'

export const OperationsPage: FC = () => {
  const [operations, setOperations] = useState<Operation[]>([])
  const [cartInfo, setCartInfo] = useState<CartInfo>({ current_request_id: 0, service_count: 0 })
  const [loading, setLoading] = useState(true)
  const [cartIconUrl, setCartIconUrl] = useState<string>('')
  
  const dispatch = useAppDispatch()
  const { searchTerm } = useAppSelector((state) => state.filters)

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      // Загружаем операции
      const operationsResponse = await getOperations(searchTerm)
      setOperations(operationsResponse.operations)
      
      // Загружаем инфо корзины
      const cartInfoResponse = await getCartInfo()
      setCartInfo(cartInfoResponse)
      
      // Загружаем иконку корзины
      const iconUrl = await getImageUrl('cartIcon')
      setCartIconUrl(iconUrl)
    } catch (error) {
      setOperations([])
      setCartInfo({ current_request_id: 0, service_count: 0 })
      setCartIconUrl('')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadOperations()
  }

  const handleSearchTermChange = (value: string) => {
    dispatch(setSearchTerm(value))
  }

  const loadOperations = async () => {
    try {
      const response = await getOperations(searchTerm)
      setOperations(response.operations)
    } catch (error) {
      setOperations([])
    }
  }

  if (loading) {
    return (
      <Container>
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <p className="mt-3">Загрузка операций...</p>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1 className="text-center">Хирургические операции</h1>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Form onSubmit={handleSearch} className="search-form">
            <Form.Control 
              type="text" 
              placeholder="Поиск операций..." 
              value={searchTerm}
              onChange={(e) => handleSearchTermChange(e.target.value)}
            />
            <Button type="submit" variant="primary">
              Поиск
            </Button>
          </Form>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col className="text-center">
          <div 
            className="bloodlosscalc-card" 
            style={{ 
              opacity: cartInfo.service_count > 0 ? 1 : 0.5, 
              cursor: cartInfo.service_count > 0 ? 'pointer' : 'not-allowed',
              display: 'inline-block' 
            }}
          >
            <div className="bloodlosscalc-image">
              {cartIconUrl ? (
                <img 
                  src={cartIconUrl}
                  alt="Заявка"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain'
                  }}
                  onError={() => setCartIconUrl('')}
                />
              ) : (
                <div style={{
                  width: '100px',
                  height: '108px',
                  margin: '11px auto 0 auto',
                  border: '1px solid #112E51',
                  backgroundColor: 'transparent'
                }}>
                  {/* Пусто - нет изображения */}
                </div>
              )}
            </div>
            <div className="bloodlosscalc-info">
              <p>Услуг: {cartInfo.service_count}</p>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          {operations.length === 0 ? (
            <div className="text-center p-5">
              <p className="lead">Операции не найдены</p>
              <p>Попробуйте изменить поисковый запрос</p>
            </div>
          ) : (
            <div className="operations-grid">
              {operations.map((operation) => (
                <Card key={operation.id} className="operation-card">
                  <div className="operation-image">
                    <Card.Img 
                      variant="top"
                      src={operation.image_url || DEFAULT_OPERATION_IMAGE}
                      alt={operation.title}
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_OPERATION_IMAGE
                      }}
                      style={{ height: '268px', objectFit: 'cover' }}
                    />
                  </div>
                  <Card.Body className="operation-content">
                    <Card.Title>{operation.title}</Card.Title>
                    <Card.Text className="coefficient">
                      Коэффициент кровопотери: {operation.blood_loss_coeff}
                      <br />
                      Средний объем: {operation.avg_blood_loss} мл
                    </Card.Text>
                    <div className="operation-actions">
                      <Link to={`/operations/${operation.id}`}>
                        <Button variant="outline-primary">Подробнее</Button>
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  )
}