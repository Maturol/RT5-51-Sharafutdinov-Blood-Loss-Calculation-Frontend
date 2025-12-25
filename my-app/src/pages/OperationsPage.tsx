import { type FC, useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Badge } from 'react-bootstrap'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { 
  fetchOperations, 
  setSearchTerm, 
  addToCart,
  clearSearch 
} from '../store/slices/operationsSlice'
import { fetchCartInfo } from '../store/slices/bloodlosscalcSlice'
import { type HandlerOperation } from '../api/Api'
import { BreadCrumbs } from '../components/BreadCrumbs'
import { useClipSearch, type SearchResult } from '../hooks/useClipSearch'

const defaultOperationImage = '/blood-loss-calc/default-operation.jpg'

export const OperationsPage: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  
  const [localSearchTerm, setLocalSearchTerm] = useState('')
  const [addingToCart, setAddingToCart] = useState<number | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Состояния для мультимодального поиска
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [showImageResults, setShowImageResults] = useState(false)
  
  const { 
    operations, 
    loading, 
    error, 
    searchTerm 
  } = useAppSelector((state) => state.operations)
  
  const { cartInfo } = useAppSelector((state) => state.bloodlosscalc)
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  
  // Использование хука для мультимодального поиска
  const {
    ready: clipReady,
    progress: clipProgress,
    searchByImage,
    resetSearch: resetClipSearch,
    searchResults,
    isSearching: isClipSearching
  } = useClipSearch(operations)

  // Состояние для отслеживания, какие операции показывать
  const [displayedOperations, setDisplayedOperations] = useState<HandlerOperation[]>([])
  const [operationSimilarities, setOperationSimilarities] = useState<Map<number, number>>(new Map())

  // Загрузка операций при монтировании
  useEffect(() => {
    dispatch(fetchOperations())
  }, [dispatch])
  
  // Загрузка информации о корзине если пользователь авторизован
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCartInfo()).then(result => {
        if (fetchCartInfo.rejected.match(result)) {
          if (result.error.message?.includes('401')) {
            console.log('Token might be invalid, clearing auth...')
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          }
        }
      })
    }
  }, [dispatch, isAuthenticated])
  
  // Синхронизация локального состояния поиска с Redux
  useEffect(() => {
    setLocalSearchTerm(searchTerm)
  }, [searchTerm])

  // Обновление отображаемых операций при изменении текстового поиска или результатов CLIP
  useEffect(() => {
    if (showImageResults && searchResults.length > 0) {
      // Фильтруем результаты - показываем только операции с сходством > 0
      const filteredResults = searchResults.filter(result => {
        const similarity = Math.max(0, result.similarity) // Гарантируем неотрицательное значение
        return similarity > 0.01 // Порог 1% для отображения
      })
      
      const operationsWithSimilarity = filteredResults.map(result => result.operation)
      setDisplayedOperations(operationsWithSimilarity)
      
      // Создаем карту сходства для каждой операции
      const similarityMap = new Map<number, number>()
      filteredResults.forEach(result => {
        const similarity = Math.max(0, result.similarity) // Гарантируем неотрицательное значение
        similarityMap.set(result.operation.id!, similarity)
      })
      setOperationSimilarities(similarityMap)
    } else {
      // Показываем обычный список операций
      setDisplayedOperations(operations)
      setOperationSimilarities(new Map())
    }
  }, [operations, searchResults, showImageResults])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(setSearchTerm(localSearchTerm))
    dispatch(fetchOperations())
    // Сбрасываем поиск по изображению при текстовом поиске
    handleClearImageSearch()
  }
  
  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value)
  }
  
  const handleClearSearch = () => {
    dispatch(clearSearch())
    setLocalSearchTerm('')
    dispatch(fetchOperations())
    // Сбрасываем поиск по изображению при очистке текстового поиска
    handleClearImageSearch()
  }
  
  const handleAddToCart = async (operationId: number) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    setAddingToCart(operationId)
    setShowSuccess(false)
    
    try {
      const result = await dispatch(addToCart({ operationId }))
      
      if (addToCart.fulfilled.match(result)) {
        await dispatch(fetchCartInfo())
        setShowSuccess(true)
        
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
  
  // Обработчик загрузки изображения для мультимодального поиска
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !clipReady) return

    // Отображение превью
    const imageUrl = URL.createObjectURL(file)
    setUploadedImage(imageUrl)
    
    try {
      await searchByImage(file)
      setShowImageResults(true)
    } catch (error) {
      console.error('Поиск по изображению не удался:', error)
      alert('Ошибка поиска по изображению. Пожалуйста, попробуйте другое изображение.')
    }
  }

  const handleClearImageSearch = () => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage)
    }
    setUploadedImage(null)
    resetClipSearch()
    setShowImageResults(false)
    setOperationSimilarities(new Map())
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Функция для получения бейджа сходства
  const getSimilarityBadge = (operationId: number) => {
    const similarity = operationSimilarities.get(operationId)
    if (similarity === undefined || similarity <= 0.01) return null // Не показываем для <= 1%
    
    const similarityPercent = Math.max(0, similarity * 100)
    
    let badgeVariant = 'secondary'
    if (similarityPercent > 70) badgeVariant = 'success'
    else if (similarityPercent > 40) badgeVariant = 'warning'
    else if (similarityPercent > 10) badgeVariant = 'info'
    
    return (
      <Badge bg={badgeVariant} className="mb-2">
        Сходство: {similarityPercent.toFixed(1)}%
      </Badge>
    )
  }

  // Функция для определения, стоит ли показывать операцию
  const shouldShowOperation = (operationId: number): boolean => {
    const similarity = operationSimilarities.get(operationId)
    // Если это режим CLIP поиска и сходство 0 или очень низкое - не показываем
    if (showImageResults && (similarity === undefined || similarity <= 0.01)) {
      return false
    }
    return true
  }

  return (
    <Container>
      <BreadCrumbs crumbs={[
        { label: 'Операции', path: '/operations' }
      ]} />
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
      
      {/* Секция мультимодального поиска */}
      <Card className="mb-4 border-primary">
        <Card.Body>
          <h5 className="mb-3">Поиск операции по изображению</h5>
          
          {!clipReady ? (
            <div className="text-center py-3">
              <div className="d-flex align-items-center justify-content-center">
                <Spinner size="sm" animation="border" className="me-2" />
                <span>Загрузка нейросети для анализа изображений... {Math.round(clipProgress)}%</span>
              </div>
              <div className="mt-2 clip-progress">
                <div 
                  className="clip-progress-bar" 
                  style={{ width: `${clipProgress}%` }}
                />
              </div>
              <small className="text-muted">
                Это может занять несколько секунд при первом использовании
              </small>
            </div>
          ) : (
            <>
              <Row className="align-items-center mb-3">
                <Col md={uploadedImage ? 4 : 12}>
                  <input 
                    type="file" 
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <Button 
                    variant="outline-primary" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isClipSearching}
                    className="w-100"
                  >
                    {isClipSearching ? (
                      <>
                        <Spinner size="sm" animation="border" className="me-2" />
                        Анализ изображения...
                      </>
                    ) : (
                      'Загрузить изображение операции'
                    )}
                  </Button>
                </Col>
                
                {uploadedImage && (
                  <>
                    <Col md={4}>
                      <div className="image-preview-container">
                        <img 
                          src={uploadedImage} 
                          alt="Загруженное изображение"
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '150px',
                            display: 'block',
                            margin: '0 auto',
                            borderRadius: '4px'
                          }}
                        />
                      </div>
                    </Col>
                    
                    <Col md={4}>
                      <Button 
                        variant="outline-danger" 
                        onClick={handleClearImageSearch}
                        className="w-100"
                      >
                        Очистить изображение
                      </Button>
                    </Col>
                  </>
                )}
              </Row>
              
              {showImageResults && displayedOperations.length === 0 && (
                <Alert variant="info" className="mt-3">
                  По вашему изображению не найдено подходящих операций.
                  Попробуйте другое изображение или воспользуйтесь текстовым поиском.
                </Alert>
              )}
            </>
          )}
        </Card.Body>
      </Card>
      
      {/* Текстовый поиск с использованием Redux */}
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
      
      {/* Заголовок для результатов */}
      {showImageResults && displayedOperations.length > 0 && (
        <Row className="mb-3">
          <Col>
            <h4 className="text-center">
              Результаты поиска по изображению
            </h4>
          </Col>
        </Row>
      )}
      
      {/* Состояние загрузки */}
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
      
      {/* Сетка операций */}
      <Row>
        <Col>
          <div className="operations-grid">
            {displayedOperations.length > 0 ? (
              displayedOperations
                .filter(operation => shouldShowOperation(operation.id!)) // Фильтруем по сходству
                .map((operation: HandlerOperation) => {
                  const similarity = operationSimilarities.get(operation.id!)
                  
                  return (
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
                        
                        {/* Бейдж сходства для результатов CLIP поиска */}
                        {similarity !== undefined && getSimilarityBadge(operation.id!)}
                        
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
                  )
                })
            ) : (
              !loading && (
                <Col xs={12} className="text-center py-5">
                  <Alert variant="info">
                    {searchTerm || showImageResults 
                      ? 'По вашему запросу ничего не найдено' 
                      : 'Операции не найдены'}
                    {searchTerm && (
                      <Button 
                        variant="link" 
                        onClick={handleClearSearch}
                        className="p-0 ms-2"
                      >
                        Очистить поиск
                      </Button>
                    )}
                    {showImageResults && (
                      <Button 
                        variant="link" 
                        onClick={handleClearImageSearch}
                        className="p-0 ms-2"
                      >
                        Очистить поиск по изображению
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