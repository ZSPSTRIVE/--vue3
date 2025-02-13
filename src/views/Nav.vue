<template>
  <!-- 顶部导航 -->
  <nav class="top-nav">
    <div class="nav-content">
      <div class="logo">
        <img src="../assets/loo.png" alt="logo">
      </div>
      <div class="more">
        <img src="../assets/gengduo_1.svg" alt="more">
      </div>
    </div>
  </nav>



</template>

<script setup>
// 导入 Vue 相关的 API 和 vue-router 用于路由控制
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// 获取 Vue Router 实例，用于路由跳转
const router = useRouter()
// 获取当前的路由信息
const route = useRoute()

// 计算当前路由路径
const currentPath = computed(() => route.path)

// 定义导航项数据
const navItems = [
  { path: '/mood', text: '心情', icon: 'icon-mood' },  // 心情导航
  { path: '/analysis', text: '分析', icon: 'icon-analysis' },  // 分析导航
  { path: '/my', text: '我的', icon: 'icon-my' }  // 我的导航
]

// 路由跳转函数
const navigate = (path) => {
  router.push(path)  // 跳转到指定路径
}
</script>
<style scoped lang="less">
/* 移动端样式 */

@media screen and (max-width: 600px) {
  .nav-content {
    height: 55px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .logo{
    img{
    width: 100px;
  }
  }

}
}

// pc
@media screen and (min-width: 601px) {
  .nav-content {
    width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .logo{
    img{
    width: 150px;
  }
  }

}
}

</style>