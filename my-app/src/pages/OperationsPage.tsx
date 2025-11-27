import { type FC, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap'
import { type Operation, getOperations, getCartInfo, type CartInfo } from '../modules/itunesApi'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { setSearchTerm } from '../store/slices/filtersSlice'
import { IMAGE_BASE_URL } from '../config';

const defaultOperationImage = '/blood-loss-calc/default-operation.jpg'

const processImageUrl = (url: string | null) => {
  if (!url) return defaultOperationImage;
  
  if (url.includes('localhost:9000')) {
    return url.replace('localhost:9000', '192.168.1.72:9000');
  }
  
  if (url.includes('192.168.1.72:9000')) {
    return url;
  }
  
  return url;
}

export const OperationsPage: FC = () => {
  const [operations, setOperations] = useState<Operation[]>([])
  const [cartInfo, setCartInfo] = useState<CartInfo>({ current_request_id: 0, service_count: 0 })
  
  const dispatch = useAppDispatch()
  const { searchTerm } = useAppSelector((state) => state.filters) 

  useEffect(() => {
    loadOperations()
    loadCartInfo()
  }, [])

  const loadOperations = async () => {
    const response = await getOperations(searchTerm)
    setOperations(response.operations)
  }

  const loadCartInfo = async () => {
    const info = await getCartInfo()
    setCartInfo(info)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadOperations()
  }

  const handleSearchTermChange = (value: string) => {
    dispatch(setSearchTerm(value))
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
              <img 
                src={`${IMAGE_BASE_URL}/blood-loss-images/bloodlosscalc-image.png`}
                alt="Заявка" 
                onError={(e) => {
                  e.currentTarget.src = defaultOperationImage
                }}
              />
            </div>
            <div className="bloodlosscalc-info">
              <p>Услуг: {cartInfo.service_count}</p>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
            <div className="operations-grid">
              {operations.map((operation) => (
                <Card key={operation.id} className="operation-card">
                  <div className="operation-image">
                    <Card.Img 
                      variant="top"
                      src={processImageUrl(operation.image_url)}
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
        </Col>
      </Row>
    </Container>
  )
}