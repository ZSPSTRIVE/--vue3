<template>
  <div class="container">
    <!-- 导航组件 -->
    <Nav></Nav>

    <!-- 显示当前时间和星期 -->
    <div class="nowtime">
        <p>
            <!-- 显示当前时间和星期几 -->
            {{ currentTime }}  {{ weekends[new Date().getDay()] }}
        </p>
    </div>

    <div class="banner">
      <!-- 显示心情标题 -->
      <h2>嘿，今天心情怎么样？</h2>
      
      <!-- 过渡效果 -->
      <transition name="fade" mode="out-in">
        <!-- 显示当前心情 -->
        <p>我感觉很{{ currentMood.mood }}</p>
      </transition>

      <!-- 显示心情图片 -->
      <div class="banner-img">
        <transition name="mood-transition" mode="out-in">
          <img  
            :key="currentMood.type"   
            :src="currentMood.img"    
            :alt="currentMood.mood"   
            style="width: 95px;height: 85px;"   
          >
        </transition>   

        <!-- 点击切换心情 -->
        <img @click="changeImg" src="@/assets/Solid chevron double down sm.svg" alt="change">
      </div>

      <!-- 文字输入框，输入心情想法 -->
      <div class="moodtext">
        <van-cell-group inset>
          <van-field
            v-model="message"   
            rows="2"   
            autosize   
            type="textarea"   
            maxlength="50"   
            placeholder="这一刻的想法:"   
            show-word-limit   
          />
          <!-- 发布按钮，点击时提交心情 -->
          <van-button class="minbutton" color="skyblue" size="mini" @click="submitMood">发布</van-button>
        </van-cell-group>
      </div>

      <!-- 显示所有的心情列表 -->
      <div class="mood-list">
        <div 
          v-for="item in moodList"    
          :key="item.type"   
          class="list"
          @click="selectMood(item)"   
        > 
          <img :src="item.img" :alt="item.mood">  <!-- 显示心情的图片 -->
          <p>{{ item.mood }}</p>  <!-- 显示心情的名称 -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 导入需要的 Vue 相关功能
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { MOOD_CONFIG } from '@/constants/images'  // 导入心情配置常量
import request from '@/utils/request'  // 导入请求工具
import Nav from '@/views/Nav.vue'  // 导入导航组件
import { showToast } from 'vant'  // 导入 vant 的提示组件

// 定义心情列表数据
const moodList = ref(MOOD_CONFIG)  // 心情列表是一个响应式变量
const currentIndex = ref(0)  // 当前选中的心情索引
const message = ref('')  // 输入的心情想法
let timer = null  // 定时器，用于更新时间

// 当前心情是一个计算属性，根据当前索引获取对应的心情
const currentMood = computed(() => moodList.value[currentIndex.value])

// 时间相关：当前时间和星期数组
const currentTime = ref(new Date().toLocaleString())  // 当前时间
const weekends = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六']  // 星期几的数组

// 切换心情的函数，改变当前心情索引
const changeImg = () => {
  currentIndex.value = (currentIndex.value + 1) % moodList.value.length  // 循环切换心情
}

// 选择心情的函数，根据点击的心情更新当前心情索引
const selectMood = (mood) => {
  currentIndex.value = moodList.value.findIndex(item => item.type === mood.type)  // 找到点击的心情并设置为当前心情
}

// 提交心情记录的函数，发送心情数据到服务器
const submitMood = async () => {
  // 如果输入框为空，提示用户输入
  if (!message.value.trim()) {
    showToast('请输入想法')  // 使用 vant 的 Toast 提示
    return
  }

  try {
    // 打印将要发送的数据
    console.log('发送的数据:', {
      type: currentMood.value.mood,  // 当前心情类型
      content: message.value  // 输入的想法
    })

    // 发送 POST 请求，将数据提交到服务器
    const response = await request.post('/api/mood/record', {
      type: currentMood.value.mood,  // 心情类型
      content: message.value  // 心情内容
    })
    
    // 请求成功后打印响应，并清空输入框
    console.log('服务器响应:', response)
    showToast('记录成功')  // 显示成功提示
    message.value = ''  // 清空输入框
  } catch (error) {
    // 捕获错误并显示错误信息
    console.error('完整错误信息:', error)
    const errorMessage = error?.response?.data?.error || error?.message || '记录失败'  // 获取错误信息
    showToast(errorMessage)  // 显示错误提示
    console.error('记录心情失败:', errorMessage)  // 打印错误
  }
}

// 组件挂载后，启动一个定时器每秒更新时间
onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date().toLocaleString()  // 更新时间
  }, 1000)
})

// 组件卸载时，清除定时器
onUnmounted(() => {
  clearInterval(timer)  // 清除定时器
})
</script>


<style scoped lang="less">

// 移动端的样式

@media screen and (max-width: 600px) {

  .container{
  position: relative;
  padding: 1rem;
  margin: 0;
  height: auto;
  padding-bottom: 90px;
  max-width:475px;
  min-width: 350px;
  margin: 0 auto;
  background-color: #F7F4F2;

  .nowtime{
    width: 100%;
    height: 20px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    p{
      font-size: .875rem;
      color: #1F160F;
      font-weight: 500;
    }
  }

  .banner{
    h2{
      padding-top: 20px;
      text-align: center;
      font-size: 1.375rem;
    }
    p{
      padding-top: 20px;
      text-align: center;
      font-size: 1.125rem;
      color: #1F160F;
      font-weight: 500;
      font-family: 'Segoe UI', sans-serif;
      opacity: 0.5;
    }
    .banner-img{
      position: relative;
      width: 100%;
      height: 215px;
      justify-content: center;
      padding-top: 15px;
      display: flex;

      img:nth-child(2){
        position: absolute;
        top: 63%;
        left: 43%;
      }
    }
  }

  .mood-list{
    display: flex;
    overflow-x: auto;
    scrollbar-width: none;
    margin-top: 20px;
    width: 100%;
    height: 110px;

    &::-webkit-scrollbar {
      display: none;
    }

    .list{
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin: 10px;     
      width: 155px;
      height: 88px;
      background-color: #FFFFFF;
      
      img{
        background-color: #fff;
        width: 40px;
      }
      
      p{
        padding-top: 10px;
        margin: 0;
      }
    }
  }
}

// 动画效果
.mood-transition-enter-active,
.mood-transition-leave-active {
  transition: all 0.4s ease;
}

.mood-transition-enter-from {
  opacity: 0;
  transform: scale(0.8) rotate(-10deg);
}

.mood-transition-leave-to {
  opacity: 0;
  transform: scale(0.8) rotate(10deg);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.moodtext{
  position: relative;
  
  .minbutton{
    position: absolute;
    top: 60px;
    left: 20px;
  }
}
  
}



// pc端样式

@media screen and (min-width: 601px) {


  // 动画效果
.mood-transition-enter-active,
.mood-transition-leave-active {
  transition: all 0.4s ease;
}

.mood-transition-enter-from {
  opacity: 0;
  transform: scale(0.8) rotate(-10deg);
}

.mood-transition-leave-to {
  opacity: 0;
  transform: scale(0.8) rotate(10deg);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.moodtext{
  position: relative;
  
  .minbutton{
    position: absolute;
    top: 60px;
    left: 20px;
  }
}
  .container {
 
    min-height: 100vh;
    padding: 0;
    margin: 0;
    background-color: #F7F4F2;

    // 左侧导航样式
    :deep(.nav-container) {
      width: 200px;
      height: 100vh;
      background: #fff;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
      position: fixed;
      left: 0;
      top: 0;
      padding: 20px 0;
    }

    // 主内容区域
    .banner {
 


      h2 {
        font-size: 32px;
        text-align: center;
        margin-bottom: 30px;
        color: #333;
      }

      p {
        font-size: 24px;
        text-align: center;
        margin-bottom: 40px;
        color: #666;
      }

      // 心情图片区域
      .banner-img {
        height: 300px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        margin-bottom: 40px;

        img {
          width: 150px;
          height: 150px;
          transition: all 0.3s ease;

          &:hover {
            transform: scale(1.1);
          }
        }

        img:nth-child(2) {
          position: absolute;
          width: 40px;
          height: 40px;
          bottom: 60px;
          cursor: pointer;
          opacity: 0.7;

          &:hover {
            opacity: 1;
            transform: translateY(3px);
          }
        }
      }

      // 输入框区域
      .moodtext {
        max-width: 800px;
        margin: 0 auto;
        margin-bottom: 40px;
        position: relative;

        :deep(.van-cell-group) {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          padding: 20px;
        }

        :deep(.van-field__control) {
          min-height: 100px;
          font-size: 16px;
          padding: 10px;
        }

        .minbutton {
          position: absolute;
          right: 30px;
          bottom: 30px;
          left: auto;
          top: auto;
          padding: 8px 24px;
          font-size: 16px;
          height: auto;
          border-radius: 6px;
        }
      }

      // 心情列表
      .mood-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        padding: 0 40px;
        height: auto;
        overflow: visible;

        .list {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 120px;
          border-radius: 12px;
          transition: all 0.3s ease;
          cursor: pointer;

          &:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          }

          img {
            width: 50px;
            height: 50px;
          }

          p {
            font-size: 16px;
            margin-top: 15px;
            color: #333;
          }
        }
      }
    }


  }

  // 时间显示
  .nowtime {
    position: fixed;
    top: 20px;
    right: 40px;
    background: rgba(255, 255, 255, 0.9);
    padding: 10px 20px;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    p {
      font-size: 16px;
      color: #333;
    }
  }
}


</style>