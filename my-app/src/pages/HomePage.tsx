import { type FC } from 'react'
import { Link } from 'react-router-dom'
import { Container, Carousel, Card, Row, Col, Button } from 'react-bootstrap'
import { ROUTES } from '../../Routes'

export const HomePage: FC = () => {
  return (
    <Container>
      {/* Карусель с информацией о системе */}
      <Carousel className="mb-5" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Carousel.Item>
          <div style={{ 
            height: '400px', 
            background: 'linear-gradient(135deg, #147662 0%, #0f5a4a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            borderRadius: '8px'
          }}>
            <div className="text-center">
              <h2>Точный расчет кровопотери</h2>
              <p className="lead">Используйте проверенные медицинские формулы для точной оценки кровопотери</p>
            </div>
          </div>
        </Carousel.Item>
        
        <Carousel.Item>
          <div style={{ 
            height: '400px', 
            background: 'linear-gradient(135deg, #112E51 0%, #0a1f36 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            borderRadius: '8px'
          }}>
            <div className="text-center">
              <h2>Профессиональный инструмент</h2>
              <p className="lead">Разработано для медицинских работников и хирургов</p>
            </div>
          </div>
        </Carousel.Item>
        
        <Carousel.Item>
          <div style={{ 
            height: '400px', 
            background: 'linear-gradient(135deg, #2c5530 0%, #1e3a24 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            borderRadius: '8px'
          }}>
            <div className="text-center">
              <h2>Удобный интерфейс</h2>
              <p className="lead">Интуитивно понятная система для быстрой работы</p>
            </div>
          </div>
        </Carousel.Item>
      </Carousel>

      {/* Информация о системе */}
      <Row className="mb-5">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-5">
              <h2 className="text-center mb-4">О системе</h2>
              <p className="text-center lead">
                Калькулятор кровопотери - это современная система для точного расчета объема 
                кровопотери при хирургических операциях. Наша система использует проверенные 
                медицинские формулы и коэффициенты для обеспечения максимальной точности расчетов.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Возможности системы */}
      <Row className="mb-5">
        <Col>
          <h2 className="text-center mb-4">Возможности системы</h2>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                  <Card.Title>Точные расчеты</Card.Title>
                  <Card.Text>
                    Использование проверенных медицинских формул и коэффициентов для точной оценки кровопотери
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
                  <Card.Title>Быстрая работа</Card.Title>
                  <Card.Text>
                    Интуитивно понятный интерфейс позволяет быстро выполнять расчеты без специального обучения
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
                  <Card.Title>Безопасность расчетов</Card.Title>
                  <Card.Text>
                    Надежная система расчетов, соответствующая медицинским стандартам и протоколам
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Кнопка перехода к услугам */}
      <Row>
        <Col className="text-center">
          <Link to={ROUTES.OPERATIONS}>
            <Button variant="primary" size="lg">
              Перейти к списку услуг
            </Button>
          </Link>
        </Col>
      </Row>
    </Container>
  )
}