import React, { useState, useEffect } from 'react'
import { Container, Card, Form, Button, Alert, Row, Col, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { logoutUser, updateUserProfile } from '../store/slices/authSlice'

const ProfilePage: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)
  
  // Исправленная навигация - в useEffect
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])
  
  useEffect(() => {
    if (user) {
      setUsername(user.username)
    }
  }, [user])
  
  const validateForm = () => {
    setError(null)
    
    // Проверяем только если мы в режиме редактирования
    if (isEditing) {
      const hasUsernameChanged = user && username !== user.username
      const hasPasswordChanged = !!password
      
      // Если имя изменилось - проверяем его
      if (hasUsernameChanged && username.length < 3) {
        setError('Имя пользователя должно быть не менее 3 символов')
        return false
      }
      
      // Если пароль указан - проверяем его
      if (hasPasswordChanged) {
        if (password.length < 6) {
          setError('Пароль должен быть не менее 6 символов')
          return false
        }
        
        if (password !== confirmPassword) {
          setError('Пароли не совпадают')
          return false
        }
      }
      
      // Если нет изменений вообще
      if (!hasUsernameChanged && !hasPasswordChanged) {
        return false
      }
    }
    
    return true
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      // Собираем обновления
      const updates: any = {}
      const hasUsernameChanged = user && username !== user.username
      const hasPasswordChanged = !!password
      
      if (hasUsernameChanged) {
        updates.username = username
      }
      
      if (hasPasswordChanged) {
        updates.password = password
      }
      
      
      // Отправляем запрос на обновление
      const result = await dispatch(updateUserProfile(updates))
      
      if (updateUserProfile.fulfilled.match(result)) {
        setSuccess(result.payload.message || 'Профиль успешно обновлен')
        setIsEditing(false)
        setPassword('')
        setConfirmPassword('')
      } else {
        setError(result.payload as string)
      }
      
    } catch (err: any) {
      setError(err.message || 'Ошибка при обновлении профиля')
    } finally {
      setLoading(false)
    }
  }
  
  const handleCancelEdit = () => {
    // Сбрасываем изменения
    if (user) {
      setUsername(user.username)
    }
    setPassword('')
    setConfirmPassword('')
    setError(null)
    setSuccess(null)
    setIsEditing(false)
  }
  
  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/')
  }
  
  // Если пользователь не загружен, показываем загрузку
  if (!user) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
      </Container>
    )
  }
  
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">Личный кабинет</h2>
              
              {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>
                {error}
              </Alert>}
              
              {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
                {success}
              </Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Имя пользователя</Form.Label>
                  <Form.Control
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={!isEditing || loading}
                    readOnly={!isEditing}
                    placeholder="Введите имя пользователя"
                  />
                  {isEditing && (
                    <Form.Text className="text-muted">
                      Минимум 3 символа
                    </Form.Text>
                  )}
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Роль</Form.Label>
                  <Form.Control
                    type="text"
                    value={user.is_moderator ? 'Модератор' : 'Пользователь'}
                    disabled
                    readOnly
                  />
                </Form.Group>
                
                {/* Поля для редактирования показываются только в режиме редактирования */}
                {isEditing && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Новый пароль (оставьте пустым, если не хотите менять)</Form.Label>
                      <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        placeholder="Введите новый пароль"
                      />
                      <Form.Text className="text-muted">
                        Минимум 6 символов
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label>Подтверждение пароля</Form.Label>
                      <Form.Control
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        placeholder="Повторите новый пароль"
                      />
                    </Form.Group>
                  </>
                )}
                
                <div className="d-flex justify-content-between">
                  {isEditing ? (
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleCancelEdit}
                        disabled={loading}
                      >
                        Отмена
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Сохранение...
                          </>
                        ) : (
                          'Сохранить изменения'
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="danger"
                        onClick={handleLogout}
                      >
                        Выйти
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => setIsEditing(true)}
                      >
                        Редактировать профиль
                      </Button>
                    </>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default ProfilePage