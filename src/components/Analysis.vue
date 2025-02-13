<template>
  <!-- 分析页面容器 -->
  <div class="analysis-container">
    <!-- 导航栏组件 -->
    <Nav></Nav>
    
    <!-- 导航栏下方的心情图标区域 -->
    <div class="navbottom">
        <!-- 显示各种心情图标 -->
        <img src="../assets/Solid mood overjoyed.svg" alt="">
        <img src="../assets/Solid mood happy.svg" alt="">
        <img src="../assets/Solid mood neutral.svg" alt="">
        <img src="../assets/Solid mood sad.svg" alt="">  
        <img src="../assets/Solid mood depressed.svg" alt="">
        <img src="../assets/kule.svg" alt="">
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <div class="chart-container">
        <!-- 心情趋势图 -->
        <div ref="moodTrendChart" class="chart">
          <div v-if="loading" class="loading-tip">加载中...</div>
        </div>
        <!-- 心情分布图 -->
        <div ref="moodDistributionChart" class="chart">
          <div v-if="loading" class="loading-tip">加载中...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue' // 引入Vue的响应式API
import * as echarts from 'echarts' // 引入ECharts库，用于绘制图表
import request from '@/utils/request' // 引入封装的请求方法
import Nav from '@/views/Nav.vue' // 引入导航组件
import { showToast } from 'vant' // 引入Vant的提示框组件

// 定义响应式变量
const moodTrendChart = ref(null) // 心情趋势图的容器引用
const moodDistributionChart = ref(null) // 心情分布图的容器引用
let trendChartInstance = null // 存储心情趋势图实例
let distributionChartInstance = null // 存储心情分布图实例
const loading = ref(true) // 加载状态

// 获取当前周的日期标签
const getWeekDates = () => {
  const today = new Date() // 获取今天的日期
  const currentDay = today.getDay() // 获取今天是星期几
  const monday = new Date(today) // 以今天为基准，获取本周一的日期
  monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1))
  
  const dates = []
  // 循环获取本周每一天的日期
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i) // 获取周一开始的每一天
    const month = (date.getMonth() + 1).toString().padStart(2, '0') // 月份，格式化为两位
    const day = date.getDate().toString().padStart(2, '0') // 日期，格式化为两位
    dates.push(`${month}/${day}`) // 将日期格式化为 MM/DD 格式并存入数组
  }
  return dates
}

// 初始化心情趋势图
const initTrendChart = async () => {
  try {
    const response = await request.get('/api/mood/weekly-trend') // 请求周心情趋势数据
    const weekDates = getWeekDates() // 获取当前周的日期
    const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] // 一周的中文星期

    // 创建7天的数据数组，默认值为null
    const values = new Array(7).fill(null) // 心情值
    const contents = new Array(7).fill('') // 心情内容（想法）

    // 将返回的数据填充到对应的日期位置
    response.forEach(record => {
      const recordDate = new Date(record.date) // 获取数据的日期
      const dayIndex = recordDate.getDay() // 获取星期几
      const index = dayIndex === 0 ? 6 : dayIndex - 1 // 将星期天调整为星期六的位置
      values[index] = record.mood_value // 填充心情值
      contents[index] = record.content // 填充心情内容
    })

    if (!trendChartInstance) {
      trendChartInstance = echarts.init(moodTrendChart.value) // 初始化ECharts实例
    }

    // 配置心情趋势图
    const option = {
      title: {
        text: '本周心情变化折线图', // 图表标题
        left: 'left', // 标题位置
      },
      tooltip: {
        trigger: 'axis', // 鼠标悬停时触发显示
        formatter: function(params) {
          const index = params[0].dataIndex
          return `${weekdays[index]} (${weekDates[index]})<br/>
                  心情值：${values[index] ?? '未记录'}<br/>
                  想法：${contents[index] || '无'}` // 弹出框显示日期、心情值和内容
        }
      },
      toolbox: {
        show: true,
        feature: {
          dataView: {
            readOnly: false // 开启数据视图编辑
          },
          magicType: {
            type: ["line", "bar"] // 切换图表类型
          },
          restore: {}, // 恢复
          saveAsImage: {} // 保存为图片
        }
      },
      xAxis: {
        type: 'category',
        data: weekdays.map((day, index) => `${day}\n${weekDates[index]}`), // 设置横坐标为星期和日期
        axisLabel: { 
          interval: 0, // 每个标签都显示
          fontSize: 8, // 标签字体大小
          rotate: 45, // 旋转标签，避免重叠
        }
      },
      yAxis: {
        type: 'value',
        name: '心情值', // Y轴名称
        min: -10,
        max: 10,
        splitLine: { lineStyle: { type: 'dashed' } } // 设置Y轴为虚线
      },
      series: [{
        data: values, // 填充心情值数据
        type: 'line', // 图表类型：折线图
        connectNulls: true, // 连接空值的点
        symbolSize: 8, // 数据点大小
        lineStyle: { width: 3 } // 线条宽度
      }]
    }

    trendChartInstance.setOption(option) // 设置图表配置
  } catch (error) {
    console.error('加载周趋势失败:', error)
    showToast('加载周趋势失败') // 弹出提示框显示加载失败
  }
}

// 初始化心情分布图
const initDistributionChart = async () => {
  try {
    const response = await request.get('/api/mood/distribution') // 请求心情分布数据
    
    if (!distributionChartInstance && moodDistributionChart.value) {
      distributionChartInstance = echarts.init(moodDistributionChart.value) // 初始化ECharts实例
    }

    // 配置心情分布图
    const option = {
      title: {
        text: '心情分布统计', // 图表标题
        left: 'center' // 标题位置
      },
      tooltip: {
        trigger: 'item', // 鼠标悬停时触发显示
        formatter: '{b}: {c}次 ({d}%)' // 显示每个心情类型的次数和占比
      },
      toolbox: {
        feature: {
          dataView: {
            readOnly: false // 开启数据视图编辑
          },
          restore: {}, // 恢复
          saveAsImage: {} // 保存为图片
        }
      },
      legend: {
        orient: 'vertical', // 图例为垂直排列
        left: 'left' // 图例位置
      },
      series: [{
        type: 'pie', // 图表类型：饼图
        radius: ['40%', '70%'], // 饼图的内外半径
        avoidLabelOverlap: false, // 避免标签重叠
        itemStyle: {
          borderRadius: 10, // 每个扇形的圆角
          borderColor: '#fff', // 边框颜色
          borderWidth: 2 // 边框宽度
        },
        data: response.map(item => ({
          name: item.mood_type, // 心情类型
          value: item.count // 心情类型的出现次数
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10, // 设置阴影效果
            shadowOffsetX: 0, 
            shadowColor: 'rgba(0, 0, 0, 0.5)' // 阴影颜色
          }
        }
      }]
    }
    
    distributionChartInstance.setOption(option) // 设置图表配置
  } catch (error) {
    console.error('加载心情分布失败:', error)
    showToast('加载心情分布失败') // 弹出提示框显示加载失败
  }
}

// 初始化所有图表
const initCharts = async () => {
  try {
    loading.value = true // 设置加载状态为true
    await Promise.all([ // 并行加载多个图表
      initTrendChart(),
      initDistributionChart()
    ])
  } catch (error) {
    console.error('初始化图表失败:', error)
  } finally {
    loading.value = false // 加载完成后设置加载状态为false
  }
}

// 组件挂载后执行
onMounted(() => {
  initCharts() // 初始化所有图表
  window.addEventListener('resize', () => { // 监听窗口大小变化，重新调整图表大小
    trendChartInstance?.resize()
    distributionChartInstance?.resize()
  })
})

// 组件卸载前执行
onUnmounted(() => {
  window.removeEventListener('resize', () => { // 移除窗口大小变化监听
    trendChartInstance?.resize()
    distributionChartInstance?.resize()
  })
  trendChartInstance?.dispose() // 销毁图表实例
  distributionChartInstance?.dispose() // 销毁图表实例
})
</script>

<style scoped lang="less">

.navbottom{
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 50px;
    margin-top: 10px;
    img{
      width: 32px;
      height: 32px;
    }
  }
.analysis-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.chart-container {
  /* margin-top: 20px; */
}

.chart {
  width: 100%;
  height: 300px;
  /* background: white; */
  border-radius: 10px;
  padding: 15px;
  /* margin-bottom: 20px; */
  /* box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1); */
}

.loading-tip {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

/* PC端样式 */
@media screen and (min-width: 768px) {
  .analysis-container {
    display: flex;
    flex-direction: column;
    padding: 0;
    margin: 0;
    min-height: 100vh;
  }
  .chart-container {
 margin: 0 auto;
}

  /* 左侧导航样式 */
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

  :deep(.nav-container .logo) {
    padding: 0 20px;
    margin-bottom: 30px;
  }

  :deep(.nav-container .nav-list) {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  :deep(.nav-container .nav-item) {
    padding: 15px 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  :deep(.nav-container .nav-item:hover) {
    background: #f5f5f5;
  }

  :deep(.nav-container .nav-item.active) {
    background: #e6f7ff;
    color: #1890ff;
    border-right: 3px solid #1890ff;
  }

  /* 主内容区样式 */
  .main-content {
    flex: 1;
    margin-left: 200px;
    padding: 40px;
    background: #f5f5f5;
  }

  .chart-container {
    max-width: 1400px;
    margin: 30px auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
    gap: 30px;
    padding: 0 20px;
  }

  .chart {
    height: 400px;
    margin-bottom: 0;
    transition: all 0.3s ease;
    background: #fff;
    border-radius: 12px;
    padding: 25px;
  }

  .chart:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  /* 图表标题样式 */
  :deep(.echarts-title) {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
  }

  /* 加载状态样式 */
  .loading-tip {
    font-size: 16px;
    color: #666;
  }
}

/* 大屏幕样式优化 */
@media screen and (min-width: 1440px) {
  :deep(.nav-container) {
    width: 240px;
  }

  .main-content {
    margin-left: 240px;
    padding: 50px;
  }

  .chart-container {
    gap: 40px;
  }

  .chart {
    height: 450px;
    padding: 30px;
  }
}

/* 超大屏幕样式优化 */
@media screen and (min-width: 1920px) {
  .chart-container {
    max-width: 1800px;
  }

  .chart {
    height: 500px;
  }
}
</style>






