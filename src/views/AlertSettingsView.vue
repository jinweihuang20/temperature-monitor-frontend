<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useTemperatureStore } from '../stores/temperature'
import type { AlertSettings } from '../types/temperature'

const store = useTemperatureStore()
const isMobile = ref(false)

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
  const media = window.matchMedia('(max-width: 900px)')
  const updateMobile = () => {
    isMobile.value = media.matches
  }
  updateMobile()
  media.addEventListener('change', updateMobile)

  if (!store.sensors.length) await store.fetchSensors()
  if (!store.realtimeData.length) await store.fetchRealtimeData()
  await store.fetchAlertSettings()
  syncForm()

  onBeforeUnmount(() => {
    media.removeEventListener('change', updateMobile)
  })
})
</script>

<template>
  <div class="page-container alert-page">
    <div>
      <h1 class="page-title">警戒值設定</h1>
      <p class="page-description">設定高低溫門檻、通知開關與套用測點範圍。</p>
    </div>

    <el-card shadow="never" class="panel-card alert-card">
      <el-form :label-width="isMobile ? 'auto' : '140px'" :label-position="isMobile ? 'top' : 'right'" class="alert-form">
        <el-form-item label="低溫警戒值">
          <el-input-number v-model="form.lowThreshold" :min="-20" :max="150" class="threshold-input" />
          <span class="unit">C</span>
        </el-form-item>
        <el-form-item label="高溫警戒值">
          <el-input-number v-model="form.highThreshold" :min="-20" :max="150" class="threshold-input" />
          <span class="unit">C</span>
        </el-form-item>
        <el-form-item label="通知開關">
          <el-switch v-model="form.notificationsEnabled" />
        </el-form-item>
        <el-form-item label="套用測點">
          <el-select v-model="form.targetSensorIds" multiple collapse-tags class="sensor-select">
            <el-option
              v-for="sensor in store.sensors"
              :key="sensor.sensorId"
              :label="sensor.sensorName"
              :value="sensor.sensorId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="目前觸發預覽">
          <el-alert :title="currentPreview" type="info" :closable="false" show-icon class="preview-alert" />
        </el-form-item>
        <el-form-item class="submit-item">
          <el-button type="primary" :loading="store.isSavingAlert" @click="submit" class="save-btn">儲存設定</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.alert-card {
  padding: 4px;
}

.alert-form {
  max-width: 900px;
}

.alert-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.alert-form :deep(.el-form-item__label) {
  padding-right: 12px;
}

.alert-form :deep(.el-form-item__content) {
  display: flex;
  align-items: center;
  gap: 10px;
}

.threshold-input,
.sensor-select {
  width: 320px;
}

.preview-alert {
  width: 100%;
}

.submit-item {
  margin-top: 8px;
}

.save-btn {
  min-width: 132px;
  height: 40px;
  font-weight: 700;
}

.unit {
  margin-left: 8px;
  color: #9ab2d2;
}

@media (max-width: 900px) {
  .alert-page {
    gap: 12px;
  }

  .alert-card {
    padding: 2px;
    border-radius: 12px;
  }

  .alert-form :deep(.el-form-item) {
    margin-bottom: 14px;
  }

  .alert-form :deep(.el-form-item__label) {
    justify-content: flex-start;
    font-size: 13px;
    font-weight: 700;
    color: #b8c8df;
    margin-bottom: 8px;
    line-height: 1.3;
    padding-right: 0;
  }

  .alert-form :deep(.el-form-item__content) {
    width: 100%;
    gap: 8px;
  }

  .threshold-input,
  .sensor-select,
  .save-btn {
    width: 100%;
  }

  .threshold-input:deep(.el-input-number) {
    width: 100%;
  }

  .threshold-input :deep(.el-input__wrapper),
  .sensor-select :deep(.el-select__wrapper) {
    width: 100%;
  }

  .save-btn {
    height: 44px;
    font-size: 15px;
  }

  .submit-item {
    position: sticky;
    bottom: 10px;
    margin-bottom: 0;
    padding-top: 6px;
    background: linear-gradient(to top, rgba(16, 23, 33, 0.96), rgba(16, 23, 33, 0));
  }
}
</style>
