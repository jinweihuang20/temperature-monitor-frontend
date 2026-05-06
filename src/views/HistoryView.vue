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

    <el-row :gutter="12">
      <el-col :xs="24" :md="8"><el-statistic title="最低溫" :value="store.historyStats.min" suffix=" C" /></el-col>
      <el-col :xs="24" :md="8"><el-statistic title="平均溫" :value="store.historyStats.avg" suffix=" C" /></el-col>
      <el-col :xs="24" :md="8"><el-statistic title="最高溫" :value="store.historyStats.max" suffix=" C" /></el-col>
    </el-row>

    <TemperatureLineChart :points="store.historyData" title="歷史溫度曲線" :height="360" />

    <el-card shadow="never" class="panel-card">
      <el-table :data="filteredTableData" v-loading="store.isLoadingHistory" height="320">
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
