import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar, Nav, Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { HomePage } from './pages/HomePage'
import { OperationsPage } from './pages/OperationsPage'
import { OperationDetailPage } from './pages/OperationDetailPage'
import { ROUTES, ROUTE_LABELS } from '../Routes'
import './App.css'

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Navbar bg="dark" variant="dark" expand="lg">
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
                    {ROUTE_LABELS.HOME}
                  </Link>
                </Nav.Link>
                <Nav.Link as="div">
                  <Link to={ROUTES.OPERATIONS} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {ROUTE_LABELS.OPERATIONS}
                  </Link>
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Routes>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.OPERATIONS} element={<OperationsPage />} />
          <Route path={ROUTES.OPERATION_DETAIL} element={<OperationDetailPage />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  )
}

export default App