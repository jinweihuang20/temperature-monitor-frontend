<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, onMounted, reactive } from 'vue'
import { useTemperatureStore } from '../stores/temperature'
import type { AlertSettings } from '../types/temperature'

const store = useTemperatureStore()

const form = reactive<AlertSettings>({
  lowThreshold: 15,
  highThreshold: 70,
  notificationsEnabled: true,
  targetSensorIds: [],
})

const currentPreview = computed(() => {
  if (!store.realtimeData.length) return '等待即時資料中...'
  const dangerous = store.realtimeData.filter((x) => x.temperature >= form.highThreshold)
  if (dangerous.length > 0) return `目前有 ${dangerous.length} 個測點超過高溫警戒值`
  return '目前未觸發高溫警報'
})

const syncForm = () => {
  form.lowThreshold = store.alertSettings.lowThreshold
  form.highThreshold = store.alertSettings.highThreshold
  form.notificationsEnabled = store.alertSettings.notificationsEnabled
  form.targetSensorIds = [...store.alertSettings.targetSensorIds]
}

const submit = async () => {
  if (form.lowThreshold >= form.highThreshold) {
    ElMessage.error('低溫門檻必須小於高溫門檻')
    return
  }
  await store.saveAlertSettings({ ...form, targetSensorIds: [...form.targetSensorIds] })
  ElMessage.success('警戒設定已儲存')
}

onMounted(async () => {
  if (!store.sensors.length) await store.fetchSensors()
  if (!store.realtimeData.length) await store.fetchRealtimeData()
  await store.fetchAlertSettings()
  syncForm()
})
</script>

<template>
  <div class="page-container">
    <div>
      <h1 class="page-title">警戒值設定</h1>
      <p class="page-description">設定高低溫門檻、通知開關與套用測點範圍。</p>
    </div>

    <el-card shadow="never" class="panel-card">
      <el-form label-width="140px">
        <el-form-item label="低溫警戒值">
          <el-input-number v-model="form.lowThreshold" :min="-20" :max="150" />
          <span class="unit">C</span>
        </el-form-item>
        <el-form-item label="高溫警戒值">
          <el-input-number v-model="form.highThreshold" :min="-20" :max="150" />
          <span class="unit">C</span>
        </el-form-item>
        <el-form-item label="通知開關">
          <el-switch v-model="form.notificationsEnabled" />
        </el-form-item>
        <el-form-item label="套用測點">
          <el-select v-model="form.targetSensorIds" multiple collapse-tags style="width: 420px">
            <el-option
              v-for="sensor in store.sensors"
              :key="sensor.sensorId"
              :label="sensor.sensorName"
              :value="sensor.sensorId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="目前觸發預覽">
          <el-alert :title="currentPreview" type="info" :closable="false" show-icon />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="store.isSavingAlert" @click="submit">儲存設定</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.unit {
  margin-left: 8px;
  color: #9ab2d2;
}
</style>
