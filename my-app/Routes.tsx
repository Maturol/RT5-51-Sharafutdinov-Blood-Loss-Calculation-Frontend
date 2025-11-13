export const ROUTES = {
  HOME: '/',
  OPERATIONS: '/operations',
  OPERATION_DETAIL: '/operations/:id',
} as const

export type RouteKeyType = keyof typeof ROUTES

export const ROUTE_LABELS: { [key in RouteKeyType]: string } = {
  HOME: 'Главная',
  OPERATIONS: 'Операции',
  OPERATION_DETAIL: 'Детали услуги',
}