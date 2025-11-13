import './BreadCrumbs.css'
import { type FC } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../Routes'

interface Crumb {
  label: string
  path?: string
}

interface BreadCrumbsProps {
  crumbs: Crumb[]
}

export const BreadCrumbs: FC<BreadCrumbsProps> = ({ crumbs }) => {
  return (
    <ul className="breadcrumbs">
      <li>
        <Link to={ROUTES.HOME}>Главная</Link>
      </li>
      {crumbs.map((crumb, index) => (
        <li key={index} className="crumb">
          <span className="slash">/</span>
          {index === crumbs.length - 1 ? (
            <span className="active">{crumb.label}</span>
          ) : (
            <Link to={crumb.path || '#'}>{crumb.label}</Link>
          )}
        </li>
      ))}
    </ul>
  )
}