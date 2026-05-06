<script setup lang="ts">
import { DataBoard, Histogram, Setting } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const menus = [
  { key: '/', label: '即時監控', icon: DataBoard },
  { key: '/history', label: '歷史查詢', icon: Histogram },
  { key: '/alerts', label: '警戒值設定', icon: Setting },
]

const onMenuSelect = (index: string) => {
  void router.push(index)
}
</script>

<template>
  <el-container class="main-layout">
    <el-aside width="250px" class="aside panel-card">
      <div class="brand">
        <div class="brand-title">IoT Monitor</div>
        <div class="brand-subtitle">Industrial Temperature Dashboard</div>
      </div>
      <el-menu :default-active="route.path" class="menu" @select="onMenuSelect">
        <el-menu-item v-for="menu in menus" :key="menu.key" :index="menu.key">
          <el-icon><component :is="menu.icon" /></el-icon>
          <span>{{ menu.label }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main class="main-content">
      <router-view />
    </el-main>
  </el-container>
</template>

<style scoped>
.main-layout {
  min-height: 100vh;
  padding: 18px;
  gap: 18px;
}

.aside {
  padding: 18px 14px;
}

.brand {
  padding: 8px 10px 16px;
  border-bottom: 1px solid rgba(149, 179, 210, 0.2);
  margin-bottom: 12px;
}

.brand-title {
  font-size: 20px;
  font-weight: 700;
  color: #ecf3ff;
}

.brand-subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: #94a8c6;
}

.menu {
  border-right: none;
  background: transparent;
}

.menu :deep(.el-menu-item) {
  border-radius: 10px;
  margin-bottom: 6px;
  color: #c7d3e8;
}

.menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, rgba(50, 77, 113, 0.9), rgba(31, 54, 84, 0.9));
  color: #f5f8ff;
}

.main-content {
  padding: 0;
}

@media (max-width: 900px) {
  .main-layout {
    flex-direction: column;
  }
}
</style>
