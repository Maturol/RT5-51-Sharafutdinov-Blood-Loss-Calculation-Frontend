import { type FC, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Container, Image } from 'react-bootstrap'
import { type Operation, getOperationById } from '../modules/itunesApi'
import { IMAGE_BASE_URL } from '../config';

const defaultOperationImage = '/blood-loss-calc/default-operation.jpg'

export const OperationDetailPage: FC = () => {
  const [operation, setOperation] = useState<Operation | null>(null)
  const { id } = useParams()

  useEffect(() => {
    if (!id) return

    getOperationById(id).then(setOperation).catch(() => {
      setOperation(null)
    })
  }, [id])

  const processImageUrl = (url: string | null) => {
    if (!url) return defaultOperationImage;
    
    if (url.includes('192.168.1.72:9000')) {
      return url;
    }
    
    if (url.includes('localhost:9000')) {
      return url.replace('localhost:9000', '192.168.1.72:9000');
    }
    
    if (url.startsWith('/')) {
      return `${IMAGE_BASE_URL}${url}`;
    }
    
    return url;
  }

  if (!operation) {
    return (
      <Container style={{ textAlign: 'center', padding: '50px' }}>
        <div>Загрузка...</div>
      </Container>
    )
  }

  return (
    <Container>
      <Link to="/operations" className="home-btn">
        <img 
          src={`${IMAGE_BASE_URL}/blood-loss-images/home-icon.png`} 
          alt="Домой" 
          onError={(e) => {
            e.currentTarget.src = defaultOperationImage;
          }}
        />
      </Link>

      <div className="horizontal-line"></div>

      <div className="operation-image-large">
        <Image
          src={processImageUrl(operation.image_url)} 
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
      </div>

      <div className="operation-description">
        <span className="operation-description-content">Описание операции: {operation.description}</span>
      </div>
    </Container>
  )
}