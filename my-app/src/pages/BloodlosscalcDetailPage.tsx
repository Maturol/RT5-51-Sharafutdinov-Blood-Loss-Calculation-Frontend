import React, { useEffect, useState } from 'react'
import { Container, Card, Button, Row, Col, Form, Alert, Badge, Modal, Spinner } from 'react-bootstrap'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import {
  fetchBloodlosscalcById,
  formBloodlosscalc,
  deleteBloodlosscalc,
  removeOperationFromBloodlosscalc,
  updateOperationInBloodlosscalc,
  removeOperationLocally,
} from '../store/slices/bloodlosscalcSlice'
import { type HandlerBLItem } from '../api/Api'

const BloodlosscalcDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  
  const { currentRequestDetail, loading, error } = useAppSelector((state) => state.bloodlosscalc)
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  
  const [patientHeight, setPatientHeight] = useState<number | undefined>()
  const [patientWeight, setPatientWeight] = useState<number | undefined>()
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null)
  const [editingOperation, setEditingOperation] = useState<number | null>(null)
  const [operationData, setOperationData] = useState<{
    hb_before?: number
    hb_after?: number
    surgery_duration?: number
  }>({})
  
  // Добавляем состояния для сохранения данных пациента
  const [isSavingPatientData, setIsSavingPatientData] = useState(false)
  const [savePatientError, setSavePatientError] = useState<string | null>(null)
  const [savePatientSuccess, setSavePatientSuccess] = useState(false)
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    if (id) {
      dispatch(fetchBloodlosscalcById(parseInt(id)))
    }
  }, [dispatch, navigate, id, isAuthenticated])
  
  useEffect(() => {
    if (currentRequestDetail) {
      setPatientHeight(currentRequestDetail.patient_height)
      setPatientWeight(currentRequestDetail.patient_weight)
    }
  }, [currentRequestDetail])
  
  // Функция для сохранения данных пациента
  const handleSavePatientData = async () => {
  if (!id) return
  
  setIsSavingPatientData(true)
  setSavePatientError(null)
  setSavePatientSuccess(false)
  
  try {
    // Используем правильный endpoint для обновления заявки
    
    setSavePatientSuccess(true)
    
    // Обновляем данные заявки
    dispatch(fetchBloodlosscalcById(parseInt(id)))
    
  } catch (error: any) {
    console.error('Ошибка сохранения:', error)
    setSavePatientError(error.response?.data?.description || 'Ошибка сохранения данных пациента')
  } finally {
    setIsSavingPatientData(false)
  }
}
  
  const handleFormRequest = async () => {
    if (id) {
      // Проверяем, что рост и вес указаны
      if (!patientHeight || !patientWeight) {
        alert('Пожалуйста, укажите рост и вес пациента перед формированием заявки')
        return
      }
      
      await dispatch(formBloodlosscalc(parseInt(id)))
      dispatch(fetchBloodlosscalcById(parseInt(id)))
    }
  }
  
  const handleDeleteRequest = async () => {
    if (id && window.confirm('Вы уверены, что хотите удалить эту заявку?')) {
      await dispatch(deleteBloodlosscalc(parseInt(id)))
      navigate('/bloodlosscalcs')
    }
  }
  
  const handleRemoveOperation = async (operationIndex: number) => {
    if (!id || !currentRequestDetail?.items?.[operationIndex]) return
    const item = currentRequestDetail.items[operationIndex]
    if (!item.operation_id) {
      console.error('Не удалось получить ID операции')
      return
    }
    
    try {
      await dispatch(
        removeOperationFromBloodlosscalc({
          bloodlosscalcId: parseInt(id),
          operationId: item.operation_id,
        })
      )
      
      // Локальное обновление для мгновенного отображения
      dispatch(removeOperationLocally(operationIndex))
      
      setShowDeleteModal(null)
      
    } catch (error) {
      console.error('Ошибка при удалении операции:', error)
    }
  }
  
  const handleUpdateOperation = async (operationIndex: number) => {
    if (!id || !currentRequestDetail?.items?.[operationIndex]) return
    
    const item = currentRequestDetail.items[operationIndex]
    
    try {
      await dispatch(
        updateOperationInBloodlosscalc({
          bloodlosscalcId: parseInt(id),
          operationId: item.operation_id!,
          data: operationData,
        })
      )
      
      setEditingOperation(null)
      setOperationData({})
      
      // Обновляем данные заявки
      dispatch(fetchBloodlosscalcById(parseInt(id)))
      
    } catch (error) {
      console.error('Ошибка при обновлении операции:', error)
    }
  }
  
  const startEditOperation = (operationIndex: number, operation: HandlerBLItem) => {
    setEditingOperation(operationIndex)
    setOperationData({
      hb_before: operation.hb_before || undefined,
      hb_after: operation.hb_after || undefined,
      surgery_duration: operation.surgery_duration || undefined,
    })
  }

  
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'черновик':
        return <Badge bg="secondary">Черновик</Badge>
      case 'сформирована':
        return <Badge bg="info">Сформирована</Badge>
      case 'завершена':
        return <Badge bg="success">Завершена</Badge>
      case 'удален':
        return <Badge bg="danger">Удалена</Badge>
      default:
        return <Badge bg="light" text="dark">{status || 'Неизвестно'}</Badge>
    }
  }
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <p className="mt-2">Загрузка заявки...</p>
      </Container>
    )
  }
  
  if (!currentRequestDetail) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Заявка не найдена</Alert>
        <Link to="/bloodlosscalcs">
          <Button variant="outline-primary">Вернуться к списку заявок</Button>
        </Link>
      </Container>
    )
  }
  
  const isDraft = currentRequestDetail.status === 'черновик'
  const isCompleted = currentRequestDetail.status === 'завершена'
  
  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Заявка #{currentRequestDetail.id || 'N/A'} {getStatusBadge(currentRequestDetail.status)}</h1>
        <div>
          <Link to="/bloodlosscalcs" className="me-2">
            <Button variant="outline-secondary">Назад</Button>
          </Link>
          {isDraft && (
            <Button variant="danger" onClick={handleDeleteRequest}>
              Удалить заявку
            </Button>
          )}
        </div>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <p><strong>Дата создания:</strong> {currentRequestDetail.created_at || 'Не указана'}</p>
              <p><strong>Создатель:</strong> {currentRequestDetail.creator || 'Не указан'}</p>
              {currentRequestDetail.moderator && (
                <p><strong>Модератор:</strong> {currentRequestDetail.moderator}</p>
              )}
              {currentRequestDetail.formed_at && (
                <p><strong>Дата формирования:</strong> {currentRequestDetail.formed_at}</p>
              )}
              {currentRequestDetail.completed_at && (
                <p><strong>Дата завершения:</strong> {currentRequestDetail.completed_at}</p>
              )}
            </Col>
            <Col md={6}>
              <Form>
                {/* Сообщения об ошибках/успехе */}
                {savePatientError && (
                  <Alert variant="danger" className="mb-3" onClose={() => setSavePatientError(null)} dismissible>
                    {savePatientError}
                  </Alert>
                )}
                
                {savePatientSuccess && (
                  <Alert variant="success" className="mb-3" onClose={() => setSavePatientSuccess(false)} dismissible>
                    Данные пациента сохранены!
                  </Alert>
                )}
                
                <Form.Group className="mb-3">
                  <Form.Label>Рост пациента (м)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={patientHeight || ''}
                    onChange={(e) => {
                      setPatientHeight(parseFloat(e.target.value) || undefined)
                      setSavePatientSuccess(false) // Сбрасываем сообщение об успехе при изменении
                    }}
                    disabled={!isDraft || isSavingPatientData}
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Вес пациента (кг)</Form.Label>
                  <Form.Control
                    type="number"
                    value={patientWeight || ''}
                    onChange={(e) => {
                      setPatientWeight(parseInt(e.target.value) || undefined)
                      setSavePatientSuccess(false) // Сбрасываем сообщение об успехе при изменении
                    }}
                    disabled={!isDraft || isSavingPatientData}
                  />
                </Form.Group>
                
                {isDraft && (
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    {/* Кнопка сохранения данных пациента */}
                    <Button 
                      variant="primary" 
                      onClick={handleSavePatientData}
                      disabled={isSavingPatientData || (!patientHeight && !patientWeight)}
                      className="me-2"
                    >
                      {isSavingPatientData ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Сохранение...
                        </>
                      ) : (
                        'Сохранить данные пациента'
                      )}
                    </Button>
                    
                    {/* Кнопка формирования заявки */}
                    <Button 
                      variant="success" 
                      onClick={handleFormRequest}
                      disabled={
                        !patientHeight || 
                        !patientWeight || 
                        !currentRequestDetail.items?.length
                      }
                      title={
                        !patientHeight || !patientWeight 
                          ? "Укажите рост и вес пациента" 
                          : !savePatientSuccess
                          ? "Сначала сохраните данные пациента"
                          : !currentRequestDetail.items?.length 
                          ? "Добавьте хотя бы одну операцию"
                          : "Сформировать заявку"
                      }
                    >
                      Сформировать заявку
                    </Button>
                  </div>
                )}
              </Form>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      <h3>Операции в заявке ({currentRequestDetail.items?.length || 0})</h3>
      
      {!currentRequestDetail.items || currentRequestDetail.items.length === 0 ? (
        <Alert variant="info">
          В заявке пока нет операций.{' '}
          <Link to="/operations">Перейти к списку операций</Link>
        </Alert>
      ) : (
        <Row>
          {currentRequestDetail.items.map((item: HandlerBLItem, index: number) => {
            // Вспомогательная функция для отображения параметров
            const renderParam = (label: string, value: any, unit: string = '') => {
              if (value === null || value === undefined || value === '') {
                return <p className="mb-1"><strong>{label}:</strong> <span className="text-muted">не указан</span></p>
              }
              return <p className="mb-1"><strong>{label}:</strong> {value}{unit}</p>
            }
            
            return (
              <Col md={6} key={index} className="mb-3">
                <Card className="h-100">
                  <Card.Body>
                    <div className="d-flex flex-column h-100">
                      <div className="d-flex mb-3">
                        {item.operation_image && (
                          <img
                            src={item.operation_image}
                            alt={item.operation_title || 'Операция'}
                            style={{ 
                              width: '100px', 
                              height: '100px', 
                              objectFit: 'cover', 
                              marginRight: '15px',
                              flexShrink: 0
                            }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <h5 className="mb-3">{item.operation_title || 'Без названия'}</h5>
                          
                          {/* Отображаем ВСЕ параметры с "не указан" для пустых */}
                          {renderParam('Коэффициент кровопотери', item.blood_loss_coeff)}
                          {renderParam('Средний объем', item.avg_blood_loss, ' мл')}
                          {renderParam('Hb до операции', item.hb_before, ' г/л')}
                          {renderParam('Hb после операции', item.hb_after, ' г/л')}
                          {renderParam('Длительность операции', item.surgery_duration, ' ч')}
                          
                          {/* Показываем результат кровопотери только для завершенных заявок отдельным блоком */}
                          {item.total_blood_loss && isCompleted && (
                            <div className="mt-2 p-2 bg-success bg-opacity-10 rounded">
                              <p className="mb-0">
                                <strong>Результат расчета кровопотери:</strong>{' '}
                                <span className="text-success fw-bold">{item.total_blood_loss} мл</span>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Редактируемые поля только для черновиков */}
                      {isDraft && (
                        editingOperation === index ? (
                          <div className="mt-auto pt-3 border-top">
                            <h6 className="fs-6 mb-2">Редактирование параметров:</h6>
                            
                            <div className="row g-2 mb-2">
                              <div className="col-12 col-sm-4">
                                <Form.Group>
                                  <Form.Label className="small mb-1">Hb до (г/л)</Form.Label>
                                  <Form.Control
                                    size="sm"
                                    type="number"
                                    min="0"
                                    max="250"
                                    value={operationData.hb_before || ''}
                                    onChange={(e) => setOperationData({
                                      ...operationData, 
                                      hb_before: e.target.value ? parseInt(e.target.value) : undefined
                                    })}
                                  />
                                </Form.Group>
                              </div>
                              
                              <div className="col-12 col-sm-4">
                                <Form.Group>
                                  <Form.Label className="small mb-1">Hb после (г/л)</Form.Label>
                                  <Form.Control
                                    size="sm"
                                    type="number"
                                    min="0"
                                    max="250"
                                    value={operationData.hb_after || ''}
                                    onChange={(e) => setOperationData({
                                      ...operationData, 
                                      hb_after: e.target.value ? parseInt(e.target.value) : undefined
                                    })}
                                  />
                                </Form.Group>
                              </div>
                              
                              <div className="col-12 col-sm-4">
                                <Form.Group>
                                  <Form.Label className="small mb-1">Длительность (ч)</Form.Label>
                                  <Form.Control
                                    size="sm"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="24"
                                    value={operationData.surgery_duration || ''}
                                    onChange={(e) => setOperationData({
                                      ...operationData, 
                                      surgery_duration: e.target.value ? parseFloat(e.target.value) : undefined
                                    })}
                                  />
                                </Form.Group>
                              </div>
                            </div>
                            
                            <div className="d-flex gap-2 mt-2">
                              <Button 
                                size="sm" 
                                variant="success" 
                                onClick={() => handleUpdateOperation(index)}
                                className="flex-fill"
                              >
                                Сохранить
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline-secondary" 
                                onClick={() => {
                                  setEditingOperation(null)
                                  setOperationData({})
                                }}
                                className="flex-fill"
                              >
                                Отмена
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // Кнопки редактирования/удаления для черновика
                          <div className="mt-auto pt-3 border-top">
                            <div className="d-flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline-primary" 
                                onClick={() => startEditOperation(index, item)}
                                className="flex-fill"
                              >
                                <i className="bi bi-pencil me-1"></i> Редактировать
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline-danger" 
                                onClick={() => setShowDeleteModal(index)}
                                className="flex-fill"
                              >
                                <i className="bi bi-trash me-1"></i> Удалить
                              </Button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            )
          })}
        </Row>
      )}
      
      {/* Модальное окно подтверждения удаления операции */}
      <Modal show={showDeleteModal !== null} onHide={() => setShowDeleteModal(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Подтверждение удаления</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Вы уверены, что хотите удалить эту операцию из заявки?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(null)}>
            Отмена
          </Button>
          <Button variant="danger" onClick={() => handleRemoveOperation(showDeleteModal!)}>
            Удалить
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default BloodlosscalcDetailPage