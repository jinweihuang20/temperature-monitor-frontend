<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import KpiCard from '../components/cards/KpiCard.vue'
import TemperatureLineChart from '../components/charts/TemperatureLineChart.vue'
import { useTemperatureStore } from '../stores/temperature'
import type { SensorStatus } from '../types/temperature'

const store = useTemperatureStore()
let timer: number | undefined

const statusClassMap = {
  normal: 'status-normal',
  warning: 'status-warning',
  danger: 'status-danger',
}

const getStatusClass = (status: SensorStatus) => statusClassMap[status]
const getRowClassName = ({
  row,
  rowIndex,
}: {
  row: { status: SensorStatus }
  rowIndex: number
}) => {
  if (row.status === 'danger') return 'row-alert-danger'
  if (row.status === 'warning') return 'row-alert-warning'
  return rowIndex % 2 === 0 ? 'row-dark-a' : 'row-dark-b'
}
const highestTempSensorText = computed(() => {
  if (!store.realtimeData.length) return '近 1 分鐘'
  const hottest = [...store.realtimeData].sort((a, b) => b.temperature - a.temperature)[0]
  return `${hottest.sensorName} (${hottest.sensorId})`
})

onMounted(async () => {
  if (!store.sensors.length) await store.fetchSensors()
  await store.fetchRealtimeData()
  timer = window.setInterval(() => {
    void store.fetchRealtimeData()
  }, 3000)
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <div class="page-container">
    <div class="page-head">
      <h1 class="page-title">即時溫度監控</h1>
      <p class="page-description">資料每 3 秒自動更新。</p>
    </div>
    <div class="sensor-temp-grid">
      <el-card
        v-for="sensor in store.realtimeData"
        :key="sensor.sensorId"
        shadow="never"
        class="panel-card sensor-temp-card"
        :class="`sensor-temp-${sensor.status}`"
      >
        <div class="sensor-temp-title">
          <span class="status-dot" :class="getStatusClass(sensor.status)"></span>
          <span>{{ sensor.sensorName }}</span>
        </div>
        <div class="sensor-temp-value">{{ sensor.temperature.toFixed(1) }} C</div>
        <div class="sensor-temp-sub">{{ sensor.sensorId }} / {{ sensor.area }}</div>
      </el-card>
    </div>

    <el-row :gutter="12" class="aux-kpi-row">
      <el-col :xs="24" :md="8">
        <KpiCard
          title="目前最高溫"
          :value="store.latestMaxTemperature.toFixed(1)"
          unit="C"
          :trend="highestTempSensorText"
        />
      </el-col>
      <el-col :xs="24" :md="8">
        <KpiCard title="平均溫度" :value="store.latestAverageTemperature.toFixed(1)" unit="C" trend="全測點平均" />
      </el-col>
      <el-col :xs="24" :md="8">
        <KpiCard title="警示測點數" :value="store.warningCount" unit="個" trend="Warning + Danger" />
      </el-col>
    </el-row>

    <TemperatureLineChart :points="store.realtimeTrendData" title="即時溫度趨勢" :height="360" />

    <el-card shadow="never" class="panel-card realtime-status-card">
      <template #header>
        <div class="card-header">
          <span>測點即時狀態</span>
          <small>最後更新：{{ store.lastRealtimeFetchAt || '-' }}</small>
        </div>
      </template>
      <el-table :data="store.realtimeData" v-loading="store.isLoadingRealtime" class="realtime-table"
        :row-class-name="getRowClassName">
        <el-table-column prop="sensorId" label="測點 ID" width="100" />
        <el-table-column prop="sensorName" label="測點名稱" min-width="220" />
        <el-table-column prop="area" label="區域" width="120" />
        <el-table-column label="溫度" width="130">
          <template #default="{ row }">{{ row.temperature.toFixed(1) }} C</template>
        </el-table-column>
        <el-table-column label="狀態" width="120">
          <template #default="{ row }">
            <span class="status-dot" :class="getStatusClass(row.status)"></span>
            <span>{{ row.status }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.page-head {
  padding: 16px 18px;
  border-radius: 12px;
  border: 2px solid transparent;
  box-sizing: border-box;
  transition: border-color 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease;
}

.realtime-status-card {
  border: 2px solid transparent;
  box-sizing: border-box;
}

.page-container :deep(.chart-card) {
  border: 2px solid transparent;
  box-sizing: border-box;
}

.sensor-temp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
}

.sensor-temp-card {
  border: 1px solid rgba(91, 121, 162, 0.3);
  padding: 10px 12px;
}

.sensor-temp-title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #b8cae4;
  font-size: 13px;
}

.sensor-temp-value {
  margin-top: 4px;
  font-size: 32px;
  font-weight: 800;
  color: #f3f8ff;
}

.sensor-temp-sub {
  margin-top: 4px;
  font-size: 12px;
  color: #8ea4c4;
}

.sensor-temp-warning {
  border-color: rgba(245, 158, 11, 0.55);
  background: linear-gradient(135deg, rgba(99, 68, 19, 0.62), rgba(56, 37, 12, 0.56));
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.2), 0 0 16px rgba(245, 158, 11, 0.24);
}

.sensor-temp-warning .sensor-temp-value {
  color: #ffd179;
}

.sensor-temp-danger {
  border-color: rgba(239, 68, 68, 0.62);
  background: linear-gradient(135deg, rgba(108, 37, 37, 0.66), rgba(64, 20, 20, 0.56));
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.24), 0 0 20px rgba(239, 68, 68, 0.3);
  animation: dangerPulse 1.8s ease-in-out infinite;
}

.sensor-temp-danger .sensor-temp-value {
  color: #ff8d8d;
}

.aux-kpi-row :deep(.kpi-card) {
  min-height: 106px;
  border-color: rgba(86, 112, 147, 0.2);
  background: linear-gradient(135deg, rgba(18, 27, 39, 0.84), rgba(13, 20, 31, 0.84));
  box-shadow: 0 0 0 1px rgba(92, 122, 161, 0.08), 0 8px 16px rgba(0, 0, 0, 0.24);
}

.aux-kpi-row :deep(.kpi-card .title) {
  font-size: 12px;
  font-weight: 600;
  color: #87a0c1;
}

.aux-kpi-row :deep(.kpi-card .value) {
  font-size: 30px;
  color: #d8e4f6;
  text-shadow: none;
}

.aux-kpi-row :deep(.kpi-card .unit) {
  color: #8da5c5;
}

.aux-kpi-row :deep(.kpi-card .trend) {
  font-size: 11px;
  color: #6f87a8;
}

@keyframes dangerPulse {

  0%,
  100% {
    filter: brightness(1);
  }

  50% {
    filter: brightness(1.18);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.realtime-table:deep(.el-table),
.realtime-table:deep(.el-table__inner-wrapper),
.realtime-table:deep(.el-table__body-wrapper),
.realtime-table:deep(.el-table__header-wrapper) {
  background-color: rgba(13, 19, 29, 0.88);
  color: #d7e2f3;
}

.realtime-table {
  --el-table-bg-color: rgba(13, 19, 29, 0.88);
  --el-table-tr-bg-color: rgba(16, 24, 36, 0.82);
  --el-table-striped-bg-color: rgba(12, 19, 30, 0.92);
  --el-table-header-bg-color: rgba(26, 36, 52, 0.92);
  --el-table-row-hover-bg-color: rgba(34, 50, 73, 0.86);
  --el-table-border-color: rgba(84, 113, 151, 0.2);
  --el-table-text-color: #d7e2f3;
  --el-table-header-text-color: #a9bdd9;
}

.realtime-table:deep(th.el-table__cell) {
  background: rgba(26, 36, 52, 0.92);
  color: #a9bdd9;
  border-bottom: 1px solid rgba(96, 127, 165, 0.35);
}

.realtime-table:deep(td.el-table__cell) {
  background: rgba(16, 24, 36, 0.82);
  border-bottom: 1px solid rgba(84, 113, 151, 0.2);
  color: #d7e2f3;
}

.realtime-table:deep(.el-table__row:hover > td.el-table__cell) {
  background: rgba(34, 50, 73, 0.86) !important;
}

.realtime-table:deep(.row-dark-a td.el-table__cell) {
  background: rgba(10, 16, 25, 0.94) !important;
}

.realtime-table:deep(.row-dark-b td.el-table__cell) {
  background: rgba(15, 23, 35, 0.94) !important;
}

.realtime-table:deep(.row-alert-warning td.el-table__cell) {
  background: rgba(86, 63, 20, 0.9) !important;
  color: #ffe6bc;
}

.realtime-table:deep(.row-alert-danger td.el-table__cell) {
  background: rgba(99, 35, 35, 0.9) !important;
  color: #ffd3d3;
}

.realtime-table:deep(.row-alert-warning:hover > td.el-table__cell) {
  background: rgba(118, 83, 23, 0.95) !important;
}

.realtime-table:deep(.row-alert-danger:hover > td.el-table__cell) {
  background: rgba(126, 42, 42, 0.95) !important;
}
</style>
