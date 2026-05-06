<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, onMounted, reactive, ref } from 'vue'
import TemperatureLineChart from '../components/charts/TemperatureLineChart.vue'
import { useTemperatureStore } from '../stores/temperature'

const store = useTemperatureStore()
const dateRange = ref<[Date, Date]>([dayjs().subtract(1, 'day').toDate(), dayjs().toDate()])
const filters = reactive({
  sensorId: '',
})

const filteredTableData = computed(() => {
  return store.historyData.map((item) => ({
    ...item,
    time: dayjs(item.timestamp).format('YYYY-MM-DD HH:mm'),
  }))
})

const getRowClassName = ({ rowIndex }: { rowIndex: number }) =>
  rowIndex % 2 === 0 ? 'row-dark-a' : 'row-dark-b'

const queryHistory = async () => {
  const [start, end] = dateRange.value
  await store.fetchHistoryData({
    sensorId: filters.sensorId || undefined,
    startAt: dayjs(start).toISOString(),
    endAt: dayjs(end).toISOString(),
  })
}

onMounted(async () => {
  if (!store.sensors.length) await store.fetchSensors()
  await queryHistory()
})
</script>

<template>
  <div class="page-container">
    <div>
      <h1 class="page-title">歷史資料查詢</h1>
      <p class="page-description">可依時間區間與測點過濾，檢視歷史溫度趨勢與統計。</p>
    </div>

    <el-card shadow="never" class="panel-card">
      <el-form inline>
        <el-form-item label="測點">
          <el-select v-model="filters.sensorId" placeholder="全部測點" clearable style="width: 220px">
            <el-option
              v-for="sensor in store.sensors"
              :key="sensor.sensorId"
              :label="sensor.sensorName"
              :value="sensor.sensorId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="時間範圍">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="開始時間"
            end-placeholder="結束時間"
            :clearable="false"
            format="YYYY-MM-DD HH:mm"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryHistory" :loading="store.isLoadingHistory">查詢</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="stats-grid">
      <div class="stat-col stat-cool">
        <el-statistic title="最低溫" :value="store.historyStats.min" suffix=" C" />
      </div>
      <div class="stat-col stat-neutral">
        <el-statistic title="平均溫" :value="store.historyStats.avg" suffix=" C" />
      </div>
      <div class="stat-col stat-warm">
        <el-statistic title="最高溫" :value="store.historyStats.max" suffix=" C" />
      </div>
    </div>

    <TemperatureLineChart :points="store.historyData" title="歷史溫度曲線" :height="360" />

    <el-card shadow="never" class="panel-card">
      <el-table
        :data="filteredTableData"
        v-loading="store.isLoadingHistory"
        height="320"
        class="history-table"
        :row-class-name="getRowClassName"
      >
        <el-table-column prop="time" label="時間" width="170" />
        <el-table-column prop="sensorId" label="測點 ID" width="100" />
        <el-table-column prop="sensorName" label="測點名稱" min-width="220" />
        <el-table-column label="溫度" width="120">
          <template #default="{ row }">{{ row.value.toFixed(1) }} C</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.stat-col {
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid rgba(104, 136, 177, 0.32);
  box-shadow: 0 0 0 1px rgba(104, 136, 177, 0.12);
  text-align: center;
}

.stat-col:deep(.el-statistic__head) {
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}

.stat-col:deep(.el-statistic__content) {
  font-size: 34px;
  font-weight: 800;
  justify-content: center;
}

.stat-cool {
  background: linear-gradient(135deg, rgba(22, 49, 86, 0.5), rgba(12, 28, 50, 0.45));
}

.stat-cool:deep(.el-statistic__head) {
  color: #9bd8ff;
}

.stat-cool:deep(.el-statistic__content),
.stat-cool:deep(.el-statistic__suffix) {
  color: #74c8ff;
  text-shadow: 0 0 10px rgba(71, 180, 255, 0.3);
}

.stat-neutral {
  background: linear-gradient(135deg, rgba(48, 62, 86, 0.5), rgba(25, 33, 48, 0.45));
}

.stat-neutral:deep(.el-statistic__head) {
  color: #d6e3f7;
}

.stat-neutral:deep(.el-statistic__content),
.stat-neutral:deep(.el-statistic__suffix) {
  color: #f4f7fe;
}

.stat-warm {
  background: linear-gradient(135deg, rgba(92, 29, 34, 0.55), rgba(60, 16, 20, 0.5));
}

.stat-warm:deep(.el-statistic__head) {
  color: #ffb5b5;
}

.stat-warm:deep(.el-statistic__content),
.stat-warm:deep(.el-statistic__suffix) {
  color: #ff8080;
  text-shadow: 0 0 10px rgba(255, 105, 105, 0.32);
}

.history-table {
  --el-table-bg-color: rgba(13, 19, 29, 0.88);
  --el-table-tr-bg-color: rgba(16, 24, 36, 0.82);
  --el-table-striped-bg-color: rgba(12, 19, 30, 0.92);
  --el-table-header-bg-color: rgba(26, 36, 52, 0.92);
  --el-table-row-hover-bg-color: rgba(34, 50, 73, 0.86);
  --el-table-border-color: rgba(84, 113, 151, 0.2);
  --el-table-text-color: #d7e2f3;
  --el-table-header-text-color: #a9bdd9;
}

.history-table:deep(.el-table),
.history-table:deep(.el-table__inner-wrapper),
.history-table:deep(.el-table__body-wrapper),
.history-table:deep(.el-table__header-wrapper) {
  background-color: rgba(13, 19, 29, 0.88);
  color: #d7e2f3;
}

.history-table:deep(th.el-table__cell) {
  background: rgba(26, 36, 52, 0.92);
  color: #a9bdd9;
  border-bottom: 1px solid rgba(96, 127, 165, 0.35);
}

.history-table:deep(td.el-table__cell) {
  border-bottom: 1px solid rgba(84, 113, 151, 0.2);
  color: #d7e2f3;
}

.history-table:deep(.row-dark-a td.el-table__cell) {
  background: rgba(10, 16, 25, 0.94) !important;
}

.history-table:deep(.row-dark-b td.el-table__cell) {
  background: rgba(15, 23, 35, 0.94) !important;
}

.history-table:deep(.el-table__row:hover > td.el-table__cell) {
  background: rgba(34, 50, 73, 0.86) !important;
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
