import {
  MENU_SCHEDULES,
  MENU_TIMEZONE,
  STORE_HOURS,
} from '../../data/menu'
import type { Product } from '../../domain/menu'

export type Availability = {
  available: boolean
  message: string
  scheduleLabel: string
}

export type ProductWithAvailability = {
  product: Product
  availability: Availability
}

const weekdayIndexes: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

const getStoreDateParts = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: MENU_TIMEZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0)
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0)
  const weekday = parts.find((part) => part.type === 'weekday')?.value ?? 'Sun'

  return {
    minutes: hour * 60 + minute,
    weekday: weekdayIndexes[weekday] ?? 0,
  }
}

const nextDayLabel = (weekday: number) =>
  weekday === 6 ? 'segunda' : 'amanhã'

export const getStoreAvailability = (date = new Date()): Availability => {
  const { minutes, weekday } = getStoreDateParts(date)
  const openMinutes = STORE_HOURS.openHour * 60
  const closeMinutes = STORE_HOURS.closeHour * 60
  const isClosedWeekday = STORE_HOURS.closedWeekdays.some(
    (closedWeekday) => closedWeekday === weekday,
  )

  if (isClosedWeekday) {
    return {
      available: false,
      message: `Loja fechada aos domingos • abre segunda às ${STORE_HOURS.openHour}h`,
      scheduleLabel: 'Fechado aos domingos',
    }
  }

  if (minutes < openMinutes) {
    return {
      available: false,
      message: `Loja fechada • abre hoje às ${STORE_HOURS.openHour}h`,
      scheduleLabel: `Abre às ${STORE_HOURS.openHour}h`,
    }
  }

  if (minutes >= closeMinutes) {
    return {
      available: false,
      message: `Loja fechada • abre ${nextDayLabel(weekday)} às ${STORE_HOURS.openHour}h`,
      scheduleLabel: `Abre ${nextDayLabel(weekday)} às ${STORE_HOURS.openHour}h`,
    }
  }

  return {
    available: true,
    message: '',
    scheduleLabel: `Loja aberta até as ${STORE_HOURS.closeHour}h`,
  }
}

export const getProductAvailability = (
  product: Product,
  date = new Date(),
): Availability => {
  const storeAvailability = getStoreAvailability(date)
  if (!storeAvailability.available) {
    return storeAvailability
  }

  const schedule = MENU_SCHEDULES[product.scheduleId]
  if (!schedule) {
    return {
      available: false,
      message: 'Horário de disponibilidade a confirmar',
      scheduleLabel: 'Horário a confirmar',
    }
  }

  const { minutes: currentMinutes, weekday } = getStoreDateParts(date)
  const startMinutes = schedule.startHour * 60
  const endMinutes = schedule.endHour * 60
  const available =
    startMinutes < endMinutes
      ? currentMinutes >= startMinutes && currentMinutes < endMinutes
      : currentMinutes >= startMinutes || currentMinutes < endMinutes

  if (available) {
    return {
      available: true,
      message: '',
      scheduleLabel: `Disponível até as ${schedule.endHour}h`,
    }
  }

  if (product.scheduleId === 'night') {
    return {
      available: false,
      message:
        currentMinutes < startMinutes
          ? `Disponível no período da noite • a partir das ${schedule.startHour}h`
          : `Volta ${nextDayLabel(weekday)} às ${schedule.startHour}h`,
      scheduleLabel: schedule.label,
    }
  }

  return {
    available: false,
    message:
      currentMinutes < startMinutes
        ? `Disponível a partir das ${schedule.startHour}h`
        : `Volta ${nextDayLabel(weekday)} às ${schedule.startHour}h`,
    scheduleLabel: schedule.label,
  }
}

export const orderProductsByAvailability = (
  products: readonly Product[],
  date = new Date(),
): ProductWithAvailability[] =>
  products
    .map((product, order) => ({
      product,
      order,
      availability: getProductAvailability(product, date),
    }))
    .sort(
      (first, second) =>
        Number(second.availability.available) -
          Number(first.availability.available) ||
        first.order - second.order,
    )
    .map(({ product, availability }) => ({ product, availability }))
