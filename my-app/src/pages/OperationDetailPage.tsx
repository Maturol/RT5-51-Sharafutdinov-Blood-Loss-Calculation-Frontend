import { type FC, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Container, Image } from 'react-bootstrap'
import { type Operation, getOperationById, getImageUrl } from '../modules/itunesApi'

const DEFAULT_OPERATION_IMAGE = '/default-operation.jpg'

export const OperationDetailPage: FC = () => {
  const [operation, setOperation] = useState<Operation | null>(null)
  const [loading, setLoading] = useState(true)
  const [homeIconUrl, setHomeIconUrl] = useState<string>('')
  const { id } = useParams()

  useEffect(() => {
    if (!id) return

    const loadData = async () => {
      setLoading(true)
      try {
        // Загружаем операцию
        const data = await getOperationById(id)
        setOperation(data)
        
        // Загружаем иконку дома
        const iconUrl = await getImageUrl('homeIcon')
        setHomeIconUrl(iconUrl)
      } catch (error) {
        setOperation(null)
        setHomeIconUrl('')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  if (loading) {
    return (
      <Container>
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <p className="mt-3">Загрузка операции...</p>
        </div>
      </Container>
    )
  }

  if (!operation) {
    return (
      <Container>
        <div className="text-center p-5">
          <h2>Операция не найдена</h2>
          <Link to="/operations" className="btn btn-primary mt-3">
            Вернуться к списку операций
          </Link>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      {/* Кнопка домой - на страницу операций */}
      <Link 
        to="/operations" 
        className="home-btn"
        style={{ 
          position: 'absolute',
          top: '33px',
          left: '239px',
          width: '81px',
          height: '82px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          border: homeIconUrl ? 'none' : '1px solid #112E51',
          backgroundColor: 'transparent'
        }}
      >
        {homeIconUrl ? (
          <img 
            src={homeIconUrl}
            alt="К списку операций"
            style={{ 
              width: '100%', 
              height: '100%',
              objectFit: 'contain'
            }}
            onError={() => setHomeIconUrl('')}
          />
        ) : (
          // Пустой блок если нет иконки
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Пусто */}
          </div>
        )}
      </Link>

      <div className="horizontal-line"></div>

      <div className="operation-image-large">
        <Image
          src={operation.image_url || DEFAULT_OPERATION_IMAGE}
          alt={operation.title}
          fluid
          style={{ height: '498px', objectFit: 'cover' }}
          onError={(e) => {
            e.currentTarget.src = DEFAULT_OPERATION_IMAGE
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
        <span className="operation-description-content">
          Описание операции: {operation.description}
        </span>
      </div>
    </Container>
  )
}