import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { mockTemperatureApi } from '../api/mockTemperatureApi'
import type {
  AlertSettings,
  HistoryQuery,
  SensorBasicInfo,
  SensorRealtimeData,
  TemperaturePoint,
} from '../types/temperature'

const defaultAlertSettings: AlertSettings = {
  lowThreshold: 15,
  highThreshold: 70,
  notificationsEnabled: true,
  targetSensorIds: [],
}

export const useTemperatureStore = defineStore('temperature', () => {
  const sensors = ref<SensorBasicInfo[]>([])
  const realtimeData = ref<SensorRealtimeData[]>([])
  const historyData = ref<TemperaturePoint[]>([])
  const alertSettings = ref<AlertSettings>({ ...defaultAlertSettings })
  const isLoadingRealtime = ref(false)
  const isLoadingHistory = ref(false)
  const isSavingAlert = ref(false)
  const lastRealtimeFetchAt = ref<string>('')

  const latestMaxTemperature = computed(() =>
    realtimeData.value.length ? Math.max(...realtimeData.value.map((x) => x.temperature)) : 0,
  )

  const latestAverageTemperature = computed(() =>
    realtimeData.value.length
      ? Number(
          (
            realtimeData.value.reduce((sum, item) => sum + item.temperature, 0) / realtimeData.value.length
          ).toFixed(1),
        )
      : 0,
  )

  const warningCount = computed(
    () => realtimeData.value.filter((x) => x.status === 'warning' || x.status === 'danger').length,
  )

  const historyStats = computed(() => {
    if (!historyData.value.length) {
      return { min: 0, max: 0, avg: 0 }
    }
    const values = historyData.value.map((x) => x.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const avg = values.reduce((sum, x) => sum + x, 0) / values.length
    return { min, max, avg: Number(avg.toFixed(1)) }
  })

  async function fetchSensors() {
    sensors.value = await mockTemperatureApi.getSensors()
    if (!alertSettings.value.targetSensorIds.length) {
      alertSettings.value.targetSensorIds = sensors.value.map((x) => x.sensorId)
    }
  }

  async function fetchRealtimeData() {
    isLoadingRealtime.value = true
    try {
      realtimeData.value = await mockTemperatureApi.getRealtimeData()
      lastRealtimeFetchAt.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
    } finally {
      isLoadingRealtime.value = false
    }
  }

  async function fetchHistoryData(query: HistoryQuery) {
    isLoadingHistory.value = true
    try {
      historyData.value = await mockTemperatureApi.getHistory(query)
    } finally {
      isLoadingHistory.value = false
    }
  }

  async function fetchAlertSettings() {
    alertSettings.value = await mockTemperatureApi.getAlertSettings()
  }

  async function saveAlertSettings(payload: AlertSettings) {
    isSavingAlert.value = true
    try {
      alertSettings.value = await mockTemperatureApi.saveAlertSettings(payload)
    } finally {
      isSavingAlert.value = false
    }
  }

  return {
    sensors,
    realtimeData,
    historyData,
    alertSettings,
    isLoadingRealtime,
    isLoadingHistory,
    isSavingAlert,
    lastRealtimeFetchAt,
    latestMaxTemperature,
    latestAverageTemperature,
    warningCount,
    historyStats,
    fetchSensors,
    fetchRealtimeData,
    fetchHistoryData,
    fetchAlertSettings,
    saveAlertSettings,
  }
})
