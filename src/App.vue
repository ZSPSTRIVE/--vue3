<script setup>
// 导入 Vue 相关的 API 和 vue-router 用于路由控制
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

// 获取 Vue Router 实例，用于路由跳转
const router = useRouter()

// 页面挂载时检查本地存储是否存在 token
onMounted(() => {
  // 从 localStorage 获取 token
  const token = localStorage.getItem('token')
  
  // 如果 token 不存在，跳转到登录页
  if (!token) {
    router.push('/login')
  }
})
</script>

<template>
  <div class="app-container">
    <!-- 显示路由组件 -->
    <router-view></router-view>

    <!-- 页面底部导航栏 -->
    <footer v-if="$route.path !== '/login'">
      <!-- 如果当前页面路径不是 '/login'，则显示底部导航栏 -->

      <!-- 情绪页面的导航链接 -->
      <router-link to="/" class="footer-list">
        <img style="width: 26px;" src="./assets/Solid mood happy.svg" alt="">
        <span>情绪</span>
      </router-link>

      <!-- 分析页面的导航链接 -->
      <router-link to="/analysis" class="footer-list">
        <img style="width: 22px;" src="./assets/weibiaoti1.svg" alt="">
        <span>分析</span>
      </router-link>

      <!-- 我的页面的导航链接 -->
      <router-link to="/myinfo" class="footer-list">
        <img style="width: 22px;" src="./assets/wode.svg" alt="">
        <span>我的</span>
      </router-link>
    </footer>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html, body {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
}

#app {
  width: 100%;
  min-height: 100vh;
  font-size: 16px;
}

.app-container {
  padding-bottom: 55px;
}

footer {
  position: fixed;
  bottom: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  background-color: #fff;
  height: 55px;
  box-shadow: 0 -1px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;

  .footer-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    text-decoration: none;

    span {
      color: #1F160F;
      opacity: 0.5;
      font-size: 5px;

    }

    &.router-link-active {
      color: #4CAF50;
      span {
        opacity: 1;
        color: #4CAF50;
     
      }
    }
  }
}


@media screen and (min-width: 601px) {
  footer{
    width: 100%;
    height: 65px;
    font-size: 10px !important;
  a{
    color: #4CAF50;
  }
    &.router-link-active {
      color: #4CAF50;
      span {
        opacity: 1;
        color: #4CAF50;
     
      }
    }
  }
}
</style>