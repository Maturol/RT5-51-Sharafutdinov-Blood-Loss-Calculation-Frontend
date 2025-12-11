import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../hooks/redux'

interface PrivateRouteProps {
  children: JSX.Element
}

/**
 * Компонент для защиты маршрутов, требующих авторизации
 * Проверяет, авторизован ли пользователь, и если нет - перенаправляет на страницу логина
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  
  // Если пользователь не авторизован, перенаправляем на страницу логина
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  // Если авторизован, отображаем защищенный компонент
  return children
}

export default PrivateRoute