<script setup lang="ts">
import { DataBoard, Expand, Histogram, Setting } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const mobileMenuOpen = ref(false)

const menus = [
  { key: '/', label: '即時監控', icon: DataBoard },
  { key: '/history', label: '歷史查詢', icon: Histogram },
  { key: '/alerts', label: '警戒值設定', icon: Setting },
]

const onMenuSelect = (index: string) => {
  void router.push(index)
  mobileMenuOpen.value = false
}
</script>

<template>
  <el-container class="main-layout">
    <el-aside width="250px" class="aside panel-card desktop-aside">
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
      <div class="mobile-topbar panel-card">
        <div class="mobile-title">IoT Monitor</div>
        <el-button circle class="hamburger-btn" @click="mobileMenuOpen = !mobileMenuOpen">
          <el-icon><Expand /></el-icon>
        </el-button>
      </div>
      <div v-if="mobileMenuOpen" class="mobile-menu-backdrop" @click="mobileMenuOpen = false"></div>
      <transition name="mobile-menu-slide">
        <div v-if="mobileMenuOpen" class="mobile-menu-panel panel-card">
          <div class="brand mobile-brand">
            <div class="brand-title">IoT Monitor</div>
            <div class="brand-subtitle">Industrial Temperature Dashboard</div>
          </div>
          <el-menu :default-active="route.path" class="menu mobile-menu" @select="onMenuSelect">
            <el-menu-item v-for="menu in menus" :key="menu.key" :index="menu.key">
              <el-icon><component :is="menu.icon" /></el-icon>
              <span>{{ menu.label }}</span>
            </el-menu-item>
          </el-menu>
        </div>
      </transition>
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
  position: relative;
}

.mobile-topbar {
  display: none;
  margin-bottom: 14px;
  padding: 10px 12px;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 61;
}

.mobile-title {
  color: #e8f1ff;
  font-weight: 700;
}

.hamburger-btn {
  background: rgba(40, 59, 86, 0.9);
  border-color: rgba(115, 148, 191, 0.5);
  color: #dce8fb;
}

.mobile-menu-panel {
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  z-index: 62;
  padding: 10px 12px 12px;
  background: linear-gradient(135deg, rgba(30, 39, 55, 0.96), rgba(18, 23, 33, 0.97));
  border: 1px solid rgba(110, 145, 188, 0.22);
  box-shadow: 0 0 0 1px rgba(117, 152, 195, 0.1), 0 10px 24px rgba(0, 0, 0, 0.35);
}

.mobile-menu-backdrop {
  position: absolute;
  inset: 0;
  z-index: 60;
  background: rgba(7, 11, 18, 0.28);
  backdrop-filter: blur(1px);
}

.mobile-brand {
  margin-bottom: 10px;
}

.mobile-menu :deep(.el-menu-item) {
  height: 44px;
  line-height: 44px;
}

.mobile-menu-slide-enter-active,
.mobile-menu-slide-leave-active {
  transition: all 0.2s ease;
}

.mobile-menu-slide-enter-from,
.mobile-menu-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 900px) {
  .main-layout {
    padding: 12px;
    gap: 10px;
  }

  .desktop-aside {
    display: none;
  }

  .mobile-topbar {
    display: flex;
  }
}
</style>
