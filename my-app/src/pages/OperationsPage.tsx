// OperationsPage.tsx
import { type FC, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap'
import { type Operation, getOperations, getCartInfo, type CartInfo } from '../modules/itunesApi'

// Импортируем картинку по умолчанию
const defaultOperationImage = '/default-operation.jpg'

export const OperationsPage: FC = () => {
  const [operations, setOperations] = useState<Operation[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [cartInfo, setCartInfo] = useState<CartInfo>({ current_request_id: 0, service_count: 0 })

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

  return (
    <Container>
      {/* Заголовок страницы услуг */}
      <Row className="mb-4">
        <Col>
          <h1 className="text-center">Хирургические операции</h1>
        </Col>
      </Row>

      {/* Поиск */}
      <Row className="mb-4">
        <Col>
          <Form onSubmit={handleSearch} className="search-form">
            <Form.Control 
              type="text" 
              placeholder="Поиск операций..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit" variant="primary">
              Поиск
            </Button>
          </Form>
        </Col>
      </Row>

      {/* Карточка заявки с реальными данными из API */}
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
                src="http://localhost:9000/blood-loss-images/bloodlosscalc-image.png" 
                alt="Заявка" 
              />
            </div>
            <div className="bloodlosscalc-info">
              <p>Услуг: {cartInfo.service_count}</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Список операций */}
      <Row>
        <Col>
            <div className="operations-grid">
              {operations.map((operation) => (
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