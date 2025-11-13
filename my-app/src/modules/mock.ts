import { type Operation } from './itunesApi'

export const OPERATIONS_MOCK: Operation[] = [
  {
    id: 1,
    title: "Кесарево сечение",
    description: "Операция родоразрешения путем извлечения плода через разрез на матке",
    status: "active",
    image_url: "cesarean.jpg",
    blood_loss_coeff: 0.12,
    avg_blood_loss: 500
  },
  {
    id: 2,
    title: "Эндопротезирование бедра", 
    description: "Замена поврежденных частей тазобедренного сустава на искусственные имплантаты",
    status: "active",
    image_url: "hip_replacement.jpg",
    blood_loss_coeff: 0.22,
    avg_blood_loss: 800
  },
  {
    id: 3,
    title: "Спондилодез",
    description: "Операция по сращению позвонков для стабилизации позвоночника", 
    status: "active",
    image_url: "spondylodesis.jpg",
    blood_loss_coeff: 0.19,
    avg_blood_loss: 600
  },
  {
    id: 4,
    title: "Аппендэктомия",
    description: "Удаление червеобразного отростка слепой кишки",
    status: "active",
    image_url: "appendectomy.jpg",
    blood_loss_coeff: 0.04,
    avg_blood_loss: 150
  }
]