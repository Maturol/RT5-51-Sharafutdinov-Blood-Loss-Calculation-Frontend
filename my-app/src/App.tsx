import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Navbar, Nav, Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { useAppDispatch, useAppSelector } from './hooks/redux'
import { logoutUser } from './store/slices/authSlice'
import { useEffect } from 'react'
import { restoreSession } from './store/slices/authSlice'
import { fetchCartInfo, resetCart } from './store/slices/bloodlosscalcSlice'

import './App.css'
import { HomePage } from './pages/HomePage'
import { OperationsPage } from './pages/OperationsPage'
import { OperationDetailPage } from './pages/OperationDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import BloodlosscalcsPage from './pages/BloodlosscalcsPage'
import BloodlosscalcDetailPage from './pages/BloodlosscalcDetailPage'
import ProfilePage from './pages/ProfilePage'
import { ROUTES } from '../Routes'
import { clearSearch } from './store/slices/operationsSlice'

// Компонент для защищенных маршрутов
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  
  return children
}

// Главный компонент приложения с навигацией
function AppContent() {
  const dispatch = useAppDispatch()
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  useAppSelector((state) => state.bloodlosscalc)

  useEffect(() => {
    // Восстановление сессии при загрузке
    dispatch(restoreSession())
    
    if (isAuthenticated) {
      dispatch(fetchCartInfo())
    }
  }, [dispatch, isAuthenticated])

  const handleLogout = async () => {
    dispatch(resetCart())
    await dispatch(logoutUser())
    dispatch(clearSearch())
  }

  return (
    <BrowserRouter basename="/blood-loss-calc" future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand>
            <Link to={ROUTES.HOME} style={{ color: 'inherit', textDecoration: 'none' }}>
              Калькулятор кровопотери
            </Link>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as="div">
                <Link to={ROUTES.HOME} style={{ color: 'inherit', textDecoration: 'none' }}>
                  Главная
                </Link>
              </Nav.Link>
              <Nav.Link as="div">
                <Link to={ROUTES.OPERATIONS} style={{ color: 'inherit', textDecoration: 'none' }}>
                  Операции
                </Link>
              </Nav.Link>
              
              {isAuthenticated && (
                <>
                  <Nav.Link as="div">
                    <Link to="/bloodlosscalcs" style={{ color: 'inherit', textDecoration: 'none' }}>
                      Мои заявки
                    </Link>
                  </Nav.Link>
                </>
              )}
            </Nav>
            
            <Nav className="ms-auto">
              {isAuthenticated ? (
                <>     
                  {/* Имя пользователя */}
                  <Nav.Link as="div" className="me-3">
                    <Link to="/profile" style={{ color: 'inherit', textDecoration: 'none' }}>
                      <span style={{ color: 'white' }}>
                        {user?.username}
                        {user?.is_moderator && ' (Модератор)'}
                      </span>
                    </Link>
                  </Nav.Link>
                  
                  {/* Кнопка выхода - тоже как ссылка */}
                  <Nav.Link 
                    as="div"
                    onClick={handleLogout} 
                    style={{ cursor: 'pointer', color: 'white' }}
                  >
                    Выйти
                  </Nav.Link>
                </>
              ) : (
                <>
                  {/* Войти - как обычная ссылка */}
                  <Nav.Link as="div">
                    <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>
                      Войти
                    </Link>
                  </Nav.Link>
                  
                  {/* Регистрация - как обычная ссылка */}
                  <Nav.Link as="div">
                    <Link to="/register" style={{ color: 'inherit', textDecoration: 'none' }}>
                      Регистрация
                    </Link>
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        <Routes>
          {/* Публичные маршруты */}
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.OPERATIONS} element={<OperationsPage />} />
          <Route path={ROUTES.OPERATION_DETAIL} element={<OperationDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Защищенные маршруты */}
          <Route 
            path="/bloodlosscalcs" 
            element={
              <PrivateRoute>
                <BloodlosscalcsPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/bloodlosscalcs/:id" 
            element={
              <PrivateRoute>
                <BloodlosscalcDetailPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            } 
          />
          
          {/* Редирект на главную для неизвестных маршрутов */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Container>
    </BrowserRouter>
  )
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}

export default App