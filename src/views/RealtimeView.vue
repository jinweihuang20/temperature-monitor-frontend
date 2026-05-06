<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
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
const getRowClassName = ({ rowIndex }: { rowIndex: number }) =>
  rowIndex % 2 === 0 ? 'row-dark-a' : 'row-dark-b'

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
    <div>
      <h1 class="page-title">即時溫度監控</h1>
      <p class="page-description">資料每 3 秒自動更新。</p>
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

    <TemperatureLineChart :points="store.realtimeTrendData" title="即時溫度趨勢" :height="360" />

    <el-card shadow="never" class="panel-card">
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
</style>
