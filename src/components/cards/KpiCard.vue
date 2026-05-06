<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  unit?: string
  trend?: string
}>()
</script>

<template>
  <el-card shadow="never" class="panel-card kpi-card">
    <div class="title">{{ title }}</div>
    <div class="value-wrap">
      <span class="value">{{ value }}</span>
      <span v-if="unit" class="unit">{{ unit }}</span>
    </div>
    <div v-if="trend" class="trend">{{ trend }}</div>
  </el-card>
</template>

<style scoped>
.kpi-card {
  min-height: 130px;
}

.title {
  font-size: 13px;
  color: #8ea3c1;
}

.value-wrap {
  margin-top: 8px;
}

.value {
  font-size: 40px;
  font-weight: 700;
  color: #f4f7fd;
}

.unit {
  margin-left: 8px;
  color: #9ab2d2;
}

.trend {
  margin-top: 8px;
  color: #7fb5ff;
  font-size: 12px;
}
</style>
