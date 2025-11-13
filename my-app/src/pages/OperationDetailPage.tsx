import { type FC, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Container, Image } from 'react-bootstrap'
import { type Operation, getOperationById } from '../modules/itunesApi'
const defaultOperationImage = '/default-operation.jpg'

export const OperationDetailPage: FC = () => {
  const [operation, setOperation] = useState<Operation | null>(null)
  const { id } = useParams()

  useEffect(() => {
    if (!id) return

    getOperationById(id).then(setOperation).catch(() => {
      setOperation(null)
    })
  }, [id])

  if (!operation) {
    return (
      <Container style={{ textAlign: 'center', padding: '50px' }}>
        <div>Операция не найдена</div>
      </Container>
    )
  }

  return (
    <Container>
      <Link to="/operations" className="home-btn">
        <img src="http://localhost:9000/blood-loss-images/home-icon.png" alt="Домой" />
      </Link>

      <div className="horizontal-line"></div>

      <div className="operation-image-large">
        <Image
          src={operation.image_url || defaultOperationImage} 
          alt={operation.title}
          fluid
          onError={(e) => {
            e.currentTarget.src = defaultOperationImage
          }}
        />
      </div>

      <div className="operation-info">
        <h2>{operation.title}</h2>
      </div>

      <div className="operation-stats">
        <p className="operation-stat">Коэффициент кровопотери: {operation.blood_loss_coeff}</p>
        <p className="operation-stat">Средний объем кровопотери: {operation.avg_blood_loss} мл</p>
        <p className="operation-stat">Статус: {operation.status}</p>
      </div>

      <div className="operation-description">
        <span className="operation-description-content">Описание операции: {operation.description}</span>
      </div>
    </Container>
  )
}