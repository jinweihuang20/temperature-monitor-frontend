<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import KpiCard from '../components/cards/KpiCard.vue'
import TemperatureLineChart from '../components/charts/TemperatureLineChart.vue'
import { useTemperatureStore } from '../stores/temperature'
import type { SensorStatus, TemperaturePoint } from '../types/temperature'

const store = useTemperatureStore()
let timer: number | undefined

const chartPoints = computed<TemperaturePoint[]>(() =>
  store.realtimeData.map((item) => ({
    timestamp: item.updatedAt,
    sensorId: item.sensorId,
    sensorName: item.sensorName,
    value: item.temperature,
  })),
)

const statusClassMap = {
  normal: 'status-normal',
  warning: 'status-warning',
  danger: 'status-danger',
}

const getStatusClass = (status: SensorStatus) => statusClassMap[status]

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
      <p class="page-description">資料每 3 秒自動更新，模擬現場感測器溫度變化。</p>
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

    <TemperatureLineChart :points="chartPoints" title="即時溫度趨勢" :height="360" />

    <el-card shadow="never" class="panel-card">
      <template #header>
        <div class="card-header">
          <span>測點即時狀態</span>
          <small>最後更新：{{ store.lastRealtimeFetchAt || '-' }}</small>
        </div>
      </template>
      <el-table :data="store.realtimeData" stripe v-loading="store.isLoadingRealtime">
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
</style>
