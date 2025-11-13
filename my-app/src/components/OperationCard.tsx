import { type FC } from 'react'
import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { type Operation } from '../modules/itunesApi'
import './OperationCard.css'

interface Props {
  operation: Operation
  onImageClick?: () => void
}

export const OperationCard: FC<Props> = ({ operation, onImageClick }) => {
  return (
    <Card className="operation-card">
      <Card.Img 
        className="cardImage" 
        variant="top" 
        src={operation.image_url || '/src/assets/default-operation.jpg'} 
        height={200}
        onClick={onImageClick}
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