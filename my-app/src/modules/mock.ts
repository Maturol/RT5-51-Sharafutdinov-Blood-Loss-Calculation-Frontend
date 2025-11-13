import { type Operation } from './itunesApi'

export const OPERATIONS_MOCK: Operation[] = [
  {
    id: 1,
    title: "Аппендэктомия",
    description: "Хирургическое удаление червеобразного отростка",
    status: "активна",
    image_url: null,
    blood_loss_coeff: 1.2,
    avg_blood_loss: 150
  },
  {
    id: 2,
    title: "Холецистэктомия",
    description: "Удаление желчного пузыря",
    status: "активна",
    image_url: null,
    blood_loss_coeff: 1.5,
    avg_blood_loss: 200
  },
  {
    id: 3,
    title: "Грыжесечение",
    description: "Операция по удалению грыжи",
    status: "активна",
    image_url: null,
    blood_loss_coeff: 1.1,
    avg_blood_loss: 120
  }
]