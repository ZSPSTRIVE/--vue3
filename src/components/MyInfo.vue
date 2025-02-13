<template>
  <div class="my-info-container">
    <div class="header">
      <h2>我的</h2>
    </div>
    
    <div class="info-content">
      <!-- 这里可以添加用户信息卡片 -->
      <div class="user-card">
        <div class="avatar">
          <!-- 用户头像 -->
          <img src="../assets/kule.svg" alt="用户头像">
        </div>
        <div class="user-info">
          <h3>用户名</h3>
          <p>用户ID: 123456</p>
        </div>
      </div>

      <!-- 功能列表 -->
      <div class="function-list">
        <div class="function-item">
          <i class="icon-settings"></i>
          <span>设置</span>
        </div>
        <div class="function-item">
          <i class="icon-history"></i>
          <span>历史记录</span>
        </div>
        <div class="function-item">
          <i class="icon-about"></i>
          <span>关于我们</span>
        </div>
      </div>

      <!-- 添加退出登录按钮 -->
      <div class="logout-section">
        <van-button 
          type="danger" 
          block 
          @click="handleLogout"
          class="logout-btn"
        >
          退出登录
        </van-button>
      </div>
    </div>

 
  </div>
</template>
<script setup>
// 导入需要的 Vue 功能和 vant 库的 Dialog 组件
import { ref } from 'vue'
import { useRouter } from 'vue-router'  // 用于路由跳转
import { showDialog } from 'vant'  // 用于显示确认对话框

const router = useRouter()  // 获取路由实例，用于路由跳转

// 退出登录的处理函数
const handleLogout = () => {
  // 显示确认退出的对话框
  showDialog({
    title: '提示',  // 对话框标题
    message: '确定要退出登录吗？',  // 对话框提示内容
    showCancelButton: true,  // 显示取消按钮
  })
    .then(() => {
      // 用户点击确认后执行以下操作
      // 1. 删除本地存储中的 token
      localStorage.removeItem('token')
      // 2. 删除用户信息
      localStorage.removeItem('userInfo')
      // 3. 跳转到登录页面
      router.replace('/login')
    })
    .catch(() => {
      // 用户点击取消时，什么也不做
      // 不做任何操作
    })
}
</script>

<style scoped>
.my-info-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
  position: relative;
}

.header {
  padding: 15px 0;
  text-align: center;
}

.header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.info-content {
  margin-top: 20px;
}

.user-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 15px;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.user-info p {
  margin: 5px 0 0;
  font-size: 14px;
  color: #666;
}

.function-list {
  background: white;
  border-radius: 10px;
  padding: 10px 0;
  margin-bottom: 20px; /* 添加底部间距 */
}

.function-item {
  padding: 15px 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.function-item:last-child {
  border-bottom: none;
}

.function-item i {
  margin-right: 10px;
  font-size: 20px;
  color: #666;
}

.function-item span {
  font-size: 14px;
  color: #333;
}

/* 添加退出登录按钮样式 */
.logout-section {
  margin: 30px 0;
  padding: 0 20px;
}

.logout-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: white;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 6px rgba(0,0,0,0.1);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px 0;
}

.nav-item i {
  font-size: 20px;
  color: #666;
  margin-bottom: 2px;
}

.nav-item span {
  font-size: 12px;
  color: #666;
}

.nav-item.active i,
.nav-item.active span {
  color: #4CAF50;
}
</style>