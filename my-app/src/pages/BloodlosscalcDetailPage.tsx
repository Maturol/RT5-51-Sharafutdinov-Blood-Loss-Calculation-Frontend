import React, { useEffect, useState } from 'react'
import { Container, Card, Button, Row, Col, Form, Alert, Badge, Modal, Spinner, Table } from 'react-bootstrap'
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
import { BreadCrumbs } from '../components/BreadCrumbs'
import { api } from '../api'

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
      // ВАЖНО: Реальный вызов API!
      await api.api.bloodlosscalcsUpdate(
        parseInt(id),
        {
          patient_height: patientHeight,
          patient_weight: patientWeight
        }
      )
      
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
      case 'отклонена':
        return <Badge bg="danger">Отклонена</Badge>
      case 'удален':
        return <Badge bg="dark">Удалена</Badge>
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
    <Container fluid className="py-5 px-4">
      <BreadCrumbs crumbs={[
        { label: 'Заявки', path: '/bloodlosscalcs' },
        { label: `Заявка #${currentRequestDetail?.id || ''}` }
      ]} />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Заявка #{currentRequestDetail.id || 'N/A'} {getStatusBadge(currentRequestDetail.status)}</h1>
        <div>
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
            <Col lg={6} md={12}>
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
            <Col lg={6} md={12}>
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
      
      <h3 className="mb-3">Операции в заявке ({currentRequestDetail.items?.length || 0})</h3>
      
      {!currentRequestDetail.items || currentRequestDetail.items.length === 0 ? (
        <Alert variant="info">
          В заявке пока нет операций.{' '}
          <Link to="/operations">Перейти к списку операций</Link>
        </Alert>
      ) : (
        <Card className="mb-4">
          <Card.Body className="p-0">
            {/* Таблица на всю ширину с вертикальной прокруткой */}
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <Table striped bordered hover className="mb-0 w-100">
                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 1 }}>
                  <tr>
                    <th style={{ width: '8%' }}>Изображение</th>
                    <th style={{ width: '18%' }}>Название операции</th>
                    <th style={{ width: '10%' }}>Коэффициент кровопотери</th>
                    <th style={{ width: '12%' }}>Средний объем кровопотери</th>
                    <th style={{ width: '10%' }}>Hb до</th>
                    <th style={{ width: '10%' }}>Hb после</th>
                    <th style={{ width: '12%' }}>Длительность</th>
                    {isCompleted && (
                      <th style={{ width: '12%' }}>Кровопотеря</th>
                    )}
                    {isDraft && (
                      <th style={{ width: '16%' }}>Действия</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {currentRequestDetail.items.map((item: HandlerBLItem, index: number) => (
                    <tr key={index}>
                      <td className="align-middle text-center">
                        {item.operation_image ? (
                          <img
                            src={item.operation_image}
                            alt={item.operation_title || 'Операция'}
                            style={{ 
                              width: '60px', 
                              height: '60px', 
                              objectFit: 'cover',
                              borderRadius: '4px'
                            }}
                          />
                        ) : (
                          <div style={{ 
                            width: '60px', 
                            height: '60px', 
                            backgroundColor: '#f8f9fa',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#6c757d',
                            fontSize: '0.8rem'
                          }}>
                            Нет фото
                          </div>
                        )}
                      </td>
                      <td className="align-middle">
                        <strong>{item.operation_title || 'Без названия'}</strong>
                      </td>
                      <td className="align-middle text-center">
                        <span className="fw-bold">{item.blood_loss_coeff || '-'}</span>
                      </td>
                      <td className="align-middle text-center">
                        {item.avg_blood_loss ? `${item.avg_blood_loss} мл` : '-'}
                      </td>
                      <td className="align-middle text-center">
                        {editingOperation === index ? (
                          <Form.Control
                            size="sm"
                            type="number"
                            min="0"
                            max="250"
                            value={operationData.hb_before || ''}
                            onChange={(e) => setOperationData({
                              ...operationData, 
                              hb_before: e.currentTarget.value ? parseInt(e.currentTarget.value) : undefined
                            })}
                            className="text-center mx-auto"
                            style={{ width: '80px' }}
                          />
                        ) : (
                          item.hb_before ? `${item.hb_before} г/л` : '-'
                        )}
                      </td>
                      <td className="align-middle text-center">
                        {editingOperation === index ? (
                          <Form.Control
                            size="sm"
                            type="number"
                            min="0"
                            max="250"
                            value={operationData.hb_after || ''}
                            onChange={(e) => setOperationData({
                              ...operationData, 
                              hb_after: e.currentTarget.value ? parseInt(e.currentTarget.value) : undefined
                            })}
                            className="text-center mx-auto"
                            style={{ width: '80px' }}
                          />
                        ) : (
                          item.hb_after ? `${item.hb_after} г/л` : '-'
                        )}
                      </td>
                      <td className="align-middle text-center">
                        {editingOperation === index ? (
                          <Form.Control
                            size="sm"
                            type="number"
                            step="0.1"
                            min="0"
                            max="24"
                            value={operationData.surgery_duration || ''}
                            onChange={(e) => setOperationData({
                              ...operationData, 
                              surgery_duration: e.currentTarget.value ? parseFloat(e.currentTarget.value) : undefined
                            })}
                            className="text-center mx-auto"
                            style={{ width: '80px' }}
                          />
                        ) : (
                          item.surgery_duration ? `${item.surgery_duration} ч` : '-'
                        )}
                      </td>
                      
                      {/* Кровопотеря для завершенных заявок */}
                      {isCompleted && (
                        <td className="align-middle text-center">
                          {item.total_blood_loss ? (
                            <Badge bg="success" style={{ fontSize: '0.85em', padding: '5px 10px' }}>
                              {item.total_blood_loss} мл
                            </Badge>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      )}
                      
                      {/* Действия для черновиков */}
                      {isDraft && (
                        <td className="align-middle">
                          {editingOperation === index ? (
                            <div className="d-flex flex-column gap-1">
                              <Button 
                                size="sm" 
                                variant="success" 
                                onClick={() => handleUpdateOperation(index)}
                                className="w-100"
                              >
                                <i className="bi bi-check me-1"></i> Сохранить
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline-secondary" 
                                onClick={() => {
                                  setEditingOperation(null)
                                  setOperationData({})
                                }}
                                className="w-100"
                              >
                                <i className="bi bi-x me-1"></i> Отмена
                              </Button>
                            </div>
                          ) : (
                            <div className="d-flex gap-1 justify-content-center">
                              <Button 
                                size="sm" 
                                variant="outline-primary" 
                                onClick={() => startEditOperation(index, item)}
                                style={{ minWidth: '90px' }}
                              >
                                <i className="bi bi-pencil me-1"></i> Редактировать
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline-danger" 
                                onClick={() => setShowDeleteModal(index)}
                                style={{ minWidth: '80px' }}
                              >
                                <i className="bi bi-trash me-1"></i> Удалить
                              </Button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
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