import dayjs from 'dayjs'
import type {
  AlertSettings,
  HistoryQuery,
  SensorBasicInfo,
  SensorRealtimeData,
  SensorStatus,
  TemperaturePoint,
} from '../types/temperature'

const sensors: SensorBasicInfo[] = [
  { sensorId: 'S-101', sensorName: '鍋爐區溫度感測器', area: 'Boiler' },
  { sensorId: 'S-102', sensorName: '冷卻區溫度感測器', area: 'Cooling' },
  { sensorId: 'S-103', sensorName: '管線區溫度感測器', area: 'Pipeline' },
]

let alertSettings: AlertSettings = {
  lowThreshold: 15,
  highThreshold: 70,
  notificationsEnabled: true,
  targetSensorIds: sensors.map((sensor) => sensor.sensorId),
}

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min)

const getStatus = (value: number): SensorStatus => {
  if (value >= alertSettings.highThreshold) return 'danger'
  if (value <= alertSettings.lowThreshold || value >= alertSettings.highThreshold - 6) return 'warning'
  return 'normal'
}

export const mockTemperatureApi = {
  async getSensors(): Promise<SensorBasicInfo[]> {
    return Promise.resolve(sensors)
  },

  async getRealtimeData(): Promise<SensorRealtimeData[]> {
    const current = dayjs()
    const data = sensors.map((sensor, index) => {
      const baseline = index === 0 ? 63 : index === 1 ? 22 : 48
      const temperature = Number((baseline + randomBetween(-4, 6)).toFixed(1))
      return {
        ...sensor,
        temperature,
        status: getStatus(temperature),
        updatedAt: current.toISOString(),
      }
    })
    return Promise.resolve(data)
  },

  async getHistory(query: HistoryQuery): Promise<TemperaturePoint[]> {
    const start = dayjs(query.startAt)
    const end = dayjs(query.endAt)
    const targetSensors = query.sensorId ? sensors.filter((x) => x.sensorId === query.sensorId) : sensors

    const points: TemperaturePoint[] = []
    let cursor = start

    while (cursor.isBefore(end) || cursor.isSame(end)) {
      targetSensors.forEach((sensor, index) => {
        const hourlyBias = Math.sin(cursor.hour() / 24 * Math.PI * 2) * 3
        const baseline = index === 0 ? 62 : index === 1 ? 21 : 47
        points.push({
          timestamp: cursor.toISOString(),
          sensorId: sensor.sensorId,
          sensorName: sensor.sensorName,
          value: Number((baseline + hourlyBias + randomBetween(-2.2, 2.2)).toFixed(1)),
        })
      })
      cursor = cursor.add(1, 'hour')
    }

    return Promise.resolve(points)
  },

  async getAlertSettings(): Promise<AlertSettings> {
    return Promise.resolve({ ...alertSettings })
  },

  async saveAlertSettings(payload: AlertSettings): Promise<AlertSettings> {
    alertSettings = { ...payload }
    return Promise.resolve({ ...alertSettings })
  },
}
