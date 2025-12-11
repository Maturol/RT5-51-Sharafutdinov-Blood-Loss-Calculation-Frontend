import React, { useState } from 'react'
import { Container, Form, Button, Alert, Card, Row, Col } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { registerUser, clearError } from '../store/slices/authSlice'

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationErrors, setValidationErrors] = useState<{
    username?: string
    password?: string
    confirmPassword?: string
  }>({})
  
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth)
  
  const validateForm = () => {
    const errors: typeof validationErrors = {}
    
    if (!username || username.length < 3) {
      errors.username = 'Имя пользователя должно быть не менее 3 символов'
    }
    
    if (!password || password.length < 6) {
      errors.password = 'Пароль должен быть не менее 6 символов'
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationErrors({})
    dispatch(clearError())
    
    if (!validateForm()) {
      return
    }
    
    const result = await dispatch(registerUser({ username, password }))
    
    if (registerUser.fulfilled.match(result)) {
      alert('Регистрация успешна! Теперь вы можете войти в систему.')
      navigate('/login')
    }
  }
  
  if (isAuthenticated) {
    navigate('/')
    return null
  }
  
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={7}>
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">Регистрация</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Имя пользователя</Form.Label>
                  <Form.Control
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    isInvalid={!!validationErrors.username}
                    disabled={loading}
                    placeholder="Введите имя пользователя (мин. 3 символа)"
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.username}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Пароль</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    isInvalid={!!validationErrors.password}
                    disabled={loading}
                    placeholder="Введите пароль (мин. 6 символов)"
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.password}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Подтверждение пароля</Form.Label>
                  <Form.Control
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    isInvalid={!!validationErrors.confirmPassword}
                    disabled={loading}
                    placeholder="Повторите пароль"
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                </Button>
                
                <div className="text-center">
                  <span className="text-muted">Уже есть аккаунт? </span>
                  <Link to="/login" className="ms-1">
                    Войти
                  </Link>
                </div>
              </Form>
              
              <div className="text-center mt-3">
                <Link to="/">Вернуться на главную</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default RegisterPage