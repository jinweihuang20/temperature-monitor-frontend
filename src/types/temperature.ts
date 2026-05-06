export type SensorStatus = 'normal' | 'warning' | 'danger'

export interface TemperaturePoint {
  timestamp: string
  sensorId: string
  sensorName: string
  value: number
}

export interface SensorRealtimeData {
  sensorId: string
  sensorName: string
  area: string
  temperature: number
  status: SensorStatus
  updatedAt: string
}

export interface AlertSettings {
  lowThreshold: number
  highThreshold: number
  notificationsEnabled: boolean
  targetSensorIds: string[]
}

export interface HistoryQuery {
  sensorId?: string
  startAt: string
  endAt: string
}

export interface SensorBasicInfo {
  sensorId: string
  sensorName: string
  area: string
}
