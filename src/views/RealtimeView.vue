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
const pageAlertLevel = computed<'normal' | 'warning' | 'danger'>(() => {
  if (store.realtimeData.some((item) => item.status === 'danger')) return 'danger'
  if (store.realtimeData.some((item) => item.status === 'warning')) return 'warning'
  return 'normal'
})
const pageAlertText = computed(() => {
  if (pageAlertLevel.value === 'danger') return '高溫危險：有測點已達危險狀態，請立即檢查設備。'
  if (pageAlertLevel.value === 'warning') return '溫度警告：有測點接近警戒值，請留意趨勢變化。'
  return '所有測點目前皆在正常範圍。'
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
  <div class="page-container" :class="`page-alert-${pageAlertLevel}`">
    <div class="page-head">
      <h1 class="page-title">即時溫度監控</h1>
      <p class="page-description">資料每 3 秒自動更新。</p>
    </div>
    <div class="alert-slot">
      <el-alert
        v-if="pageAlertLevel !== 'normal'"
        :title="pageAlertText"
        :type="pageAlertLevel === 'danger' ? 'error' : pageAlertLevel === 'warning' ? 'warning' : 'success'"
        effect="dark"
        :closable="false"
        show-icon
        class="realtime-alert"
      />
    </div>

    <el-row :gutter="12">
      <el-col :xs="24" :md="8">
        <KpiCard title="目前最高溫" :value="store.latestMaxTemperature.toFixed(1)" unit="C" trend="近 1 分鐘" />
      </el-col>
      <el-col :xs="24" :md="8">
        <KpiCard title="平均溫度" :value="store.latestAverageTemperature.toFixed(1)" unit="C" trend="全測點平均" />
      </el-col>
      <el-col :xs="24" :md="8">
        <KpiCard title="警示測點數" :value="store.warningCount" unit="個" trend="Warning + Danger" />
      </el-col>
    </el-row>

    <TemperatureLineChart
      :points="store.realtimeTrendData"
      title="即時溫度趨勢"
      :height="360"
      :class="`chart-alert-${pageAlertLevel}`"
    />

    <el-card shadow="never" class="panel-card realtime-status-card" :class="`status-alert-${pageAlertLevel}`">
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

.realtime-alert {
  border-radius: 12px;
}

.alert-slot {
  min-height: 70px;
}

.realtime-alert:deep(.el-alert) {
  border: 2px solid transparent;
  box-sizing: border-box;
}

.realtime-status-card {
  border: 2px solid transparent;
  box-sizing: border-box;
}

.page-container :deep(.chart-card) {
  border: 2px solid transparent;
  box-sizing: border-box;
}

.realtime-alert:deep(.el-alert__title) {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 0.3px;
  line-height: 1.45;
}

.realtime-alert:deep(.el-alert__icon) {
  font-size: 22px;
}

.page-alert-warning .page-head {
  border-color: rgba(245, 158, 11, 0.7);
  background: rgba(245, 158, 11, 0.12);
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.25), 0 0 24px rgba(245, 158, 11, 0.38);
}

.page-alert-danger .page-head {
  border-color: rgba(239, 68, 68, 0.75);
  background: rgba(239, 68, 68, 0.12);
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.28), 0 0 30px rgba(239, 68, 68, 0.45);
}

.page-alert-warning .page-title {
  color: #ffd27c;
  font-size: 36px;
  font-weight: 900;
}

.page-alert-danger .page-title {
  color: #ff8f8f;
  font-size: 40px;
  font-weight: 900;
  text-shadow: 0 0 14px rgba(239, 68, 68, 0.45);
}

.page-alert-warning .page-description,
.page-alert-danger .page-description {
  font-size: 17px;
  font-weight: 700;
  color: #ffe6bb;
}

.page-alert-danger .realtime-alert {
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.32), 0 0 26px rgba(239, 68, 68, 0.4);
}

.page-alert-warning .realtime-alert {
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.3), 0 0 22px rgba(245, 158, 11, 0.32);
}

.page-alert-warning :deep(.chart-alert-warning .chart-card) {
  border-color: rgba(245, 158, 11, 0.5);
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.2), 0 0 20px rgba(245, 158, 11, 0.25);
}

.page-alert-danger :deep(.chart-alert-danger .chart-card) {
  border-color: rgba(239, 68, 68, 0.58);
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.24), 0 0 24px rgba(239, 68, 68, 0.35);
  animation: dangerPulse 1.8s ease-in-out infinite;
}

.status-alert-warning {
  border-color: rgba(245, 158, 11, 0.45);
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.22), 0 0 18px rgba(245, 158, 11, 0.2);
}

.status-alert-danger {
  border-color: rgba(239, 68, 68, 0.55);
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.24), 0 0 24px rgba(239, 68, 68, 0.3);
  animation: dangerPulse 1.8s ease-in-out infinite;
}

.status-alert-warning :deep(th.el-table__cell) {
  background: rgba(87, 60, 16, 0.92);
  color: #ffdca1;
}

.status-alert-danger :deep(th.el-table__cell) {
  background: rgba(95, 33, 33, 0.9);
  color: #ffd2d2;
}

.status-alert-warning :deep(.el-table__row:hover > td.el-table__cell) {
  background: rgba(110, 78, 20, 0.88) !important;
}

.status-alert-danger :deep(.el-table__row:hover > td.el-table__cell) {
  background: rgba(113, 37, 37, 0.86) !important;
}

.page-alert-danger .page-head,
.page-alert-danger .realtime-alert {
  animation: dangerPulse 1.8s ease-in-out infinite;
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
