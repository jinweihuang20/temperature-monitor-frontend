<script setup lang="ts">
import type { ECharts } from 'echarts'
import * as echarts from 'echarts'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { TemperaturePoint } from '../../types/temperature'

const props = withDefaults(
  defineProps<{
    points: TemperaturePoint[]
    title?: string
    height?: number
  }>(),
  {
    title: 'Temperature Trend',
    height: 320,
  },
)

const chartRef = ref<HTMLDivElement>()
let chart: ECharts | null = null

const groupedSeries = computed(() => {
  const group = new Map<string, TemperaturePoint[]>()
  props.points.forEach((point) => {
    if (!group.has(point.sensorName)) {
      group.set(point.sensorName, [])
    }
    group.get(point.sensorName)!.push(point)
  })
  return Array.from(group.entries()).map(([name, rows]) => ({
    name,
    type: 'line',
    smooth: true,
    showSymbol: false,
    lineStyle: { width: 2 },
    data: rows.map((row) => [row.timestamp, row.value]),
  }))
})

const setOptions = () => {
  if (!chart) return
  chart.setOption({
    backgroundColor: 'transparent',
    title: {
      text: props.title,
      textStyle: { color: '#dce7f7', fontSize: 14 },
      left: 12,
      top: 10,
    },
    tooltip: { trigger: 'axis' },
    legend: { top: 10, right: 16, textStyle: { color: '#9db0cc' } },
    grid: { left: 20, right: 18, bottom: 18, top: 48, containLabel: true },
    xAxis: {
      type: 'time',
      axisLabel: { color: '#8ea3c1' },
      axisLine: { lineStyle: { color: '#365070' } },
      splitLine: { lineStyle: { color: 'rgba(94, 121, 157, 0.2)' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#8ea3c1', formatter: '{value} C' },
      axisLine: { lineStyle: { color: '#365070' } },
      splitLine: { lineStyle: { color: 'rgba(94, 121, 157, 0.2)' } },
    },
    series: groupedSeries.value,
  })
}

onMounted(() => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  setOptions()
  window.addEventListener('resize', handleResize)
})

watch(
  () => props.points,
  () => {
    setOptions()
  },
  { deep: true },
)

const handleResize = () => chart?.resize()

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
  chart = null
})
</script>

<template>
  <el-card shadow="never" class="panel-card chart-card">
    <div ref="chartRef" :style="{ width: '100%', height: `${height}px` }"></div>
  </el-card>
</template>

<style scoped>
.chart-card {
  width: 100%;
}
</style>
