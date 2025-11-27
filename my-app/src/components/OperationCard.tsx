import { type FC } from 'react'
import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { type Operation } from '../modules/itunesApi'
import './OperationCard.css'
import { IMAGE_BASE_URL } from '../config';

interface Props {
  operation: Operation
  onImageClick?: () => void
}

const processImageUrl = (url: string | null): string => {
  const defaultOperationImage = '/src/assets/default-operation.jpg';
  
  if (!url) return defaultOperationImage;
  
  if (url.includes('192.168.1.72:9000') || url.includes('localhost:9000')) {
    return url;
  }
  
  if (url.startsWith('/')) {
    return `${IMAGE_BASE_URL}${url}`;
  }
  
  if (url.startsWith('http')) {
    return url;
  }
  
  return defaultOperationImage;
}

export const OperationCard: FC<Props> = ({ operation, onImageClick }) => {
  return (
    <Card className="operation-card">
      <Card.Img 
        className="cardImage" 
        variant="top" 
        src={processImageUrl(operation.image_url)}
        height={200}
        onClick={onImageClick}
        onError={(e) => {
          e.currentTarget.src = '/src/assets/default-operation.jpg';
        }}
      />
      <Card.Body>
        <div className="textStyle">
          <Card.Title>{operation.title}</Card.Title>
        </div>
        <div className="textStyle">
          <Card.Text>
            Коэффициент: {operation.blood_loss_coeff}
            <br />
            Средний объем: {operation.avg_blood_loss} мл
          </Card.Text>
        </div>
        <div className="cardActions">
          <Link 
            to={`/operations/${operation.id}`}
            className="btn btn-primary btn-sm w-100"
          >
            Подробнее
          </Link>
        </div>
      </Card.Body>
    </Card>
  )
}