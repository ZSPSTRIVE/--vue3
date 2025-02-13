<template>
  <van-overlay :show="loading" />
  <div class="login-container">
    <div class="logo">
      <img src="@/assets/Solid mood happy.svg" alt="logo">
      <h2>Mood</h2>
    </div>

    <div class="form-container">
      <!-- 切换登录/注册的标签 -->
      <div class="toggle-buttons">
        <span 
          :class="{ active: !isRegister }" 
          @click="isRegister = false"
        >登录</span>
        <span 
          :class="{ active: isRegister }" 
          @click="isRegister = true"
        >注册</span>
      </div>

      <!-- 登录表单 -->
      <div v-if="!isRegister" class="form">
        <div class="input-group">
          <input 
            type="email" 
            v-model="loginForm.email" 
            placeholder="请输入邮箱"
          >
        </div>
        <div class="input-group">
          <input 
            type="password" 
            v-model="loginForm.password" 
            placeholder="请输入密码"
          >
        </div>
        <button 
          class="submit-btn" 
          @click="handleLogin"
          :disabled="loading"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <div class="forgot-password">
          <span @click="forgotPassword">忘记密码？</span>
        </div>
      </div>

      <!-- 注册表单 -->
      <div v-else class="form">
        <div class="input-group">
          <input 
            type="email" 
            v-model="registerForm.email" 
            placeholder="请输入邮箱"
          >
        </div>
        <div class="input-group">
          <input 
            type="password" 
            v-model="registerForm.password" 
            placeholder="请设置密码"
          >
        </div>
        <div class="input-group verification">
          <input 
            type="text" 
            v-model="registerForm.code" 
            placeholder="请输入验证码"
          >
          <button 
            class="verify-btn" 
            :disabled="isCountDown" 
            @click="sendVerificationCode"
          >
            {{ countDownText }}
          </button>
        </div>
        <button class="submit-btn" @click="handleRegister">注册</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { showToast } from 'vant'

const router = useRouter()
const isRegister = ref(false)
const countDown = ref(0)
const loading = ref(false)

// 登录表单数据
const loginForm = ref({
  email: '',
  password: ''
})

// 注册表单数据
const registerForm = ref({
  email: '',
  password: '',
  code: ''
})

// 验证码倒计时
const isCountDown = computed(() => countDown.value > 0)
const countDownText = computed(() => 
  isCountDown.value ? `${countDown.value}s` : '获取验证码'
)

// 邮箱验证
const validateEmail = (email) => {
  const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return reg.test(email)
}

// 检查邮箱是否已注册
const checkEmail = async (email) => {
  try {
    const response = await request.post('/api/check-email', { email });
    return response.exists;
  } catch (error) {
    console.error('检查邮箱失败:', error);
    return false;
  }
};

// 发送验证码
const sendVerificationCode = async () => {
  if (!registerForm.value.email) {
    showToast('请输入邮箱')
    return
  }
  
  if (!validateEmail(registerForm.value.email)) {
    showToast('请输入正确的邮箱格式')
    return
  }

  try {
    loading.value = true

    // 先检查邮箱是否已被注册
    const emailExists = await checkEmail(registerForm.value.email);
    if (emailExists) {
      showToast('该邮箱已被注册');
      return;
    }

    await request.post('/api/send-code', {
      email: registerForm.value.email
    })
    
    showToast('验证码已发送')
    countDown.value = 60
    const timer = setInterval(() => {
      countDown.value--
      if (countDown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    if (error?.response?.data?.error === '该邮箱已被注册') {
      showToast('该邮箱已被注册');
    } else {
      showToast(error || '发送验证码失败');
    }
  } finally {
    loading.value = false
  }
}

// 处理登录
const handleLogin = async () => {
  if (!loginForm.value.email || !loginForm.value.password) {
    showToast('请填写完整信息')
    return
  }

  if (!validateEmail(loginForm.value.email)) {
    showToast('请输入正确的邮箱格式')
    return
  }

  try {
    loading.value = true
    const res = await request.post('/api/login', loginForm.value)
    
    localStorage.setItem('token', res.token)
    localStorage.setItem('user', JSON.stringify(res.user))
    
    showToast('登录成功')
    router.push('/')
  } catch (error) {
    showToast(error || '登录失败')
  } finally {
    loading.value = false
  }
}

// 处理注册
const handleRegister = async () => {
  if (!registerForm.value.email || 
      !registerForm.value.password || 
      !registerForm.value.code) {
    showToast('请填写完整信息')
    return
  }

  if (!validateEmail(registerForm.value.email)) {
    showToast('请输入正确的邮箱格式')
    return
  }

  try {
    loading.value = true

    // 再次检查邮箱是否已被注册（双重保险）
    const emailExists = await checkEmail(registerForm.value.email);
    if (emailExists) {
      showToast('该邮箱已被注册');
      return;
    }

    const registerData = {
      email: registerForm.value.email,
      password: registerForm.value.password,
      code: registerForm.value.code,
      username: registerForm.value.email.split('@')[0]
    };

    const response = await request.post('/api/register', registerData);
    
    console.log('注册响应:', response);
    showToast('注册成功');
    
    // 注册成功后自动登录
    loginForm.value = {
      email: registerForm.value.email,
      password: registerForm.value.password
    };
    await handleLogin();
  } catch (error) {
    console.error('注册错误详情:', error);
    const errorMessage = error?.response?.data?.error || '注册失败';
    showToast(errorMessage);
  } finally {
    loading.value = false;
  }
}

// 忘记密码
const forgotPassword = () => {
  // 处理忘记密码逻辑
}
</script>

<style scoped lang="less">
.login-container {
  min-height: 100vh;
  padding: 40px 20px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;

  .logo {
    margin-bottom: 60px;
    text-align: center;

    img {
      width: 80px;
      height: 80px;
    }

    h2 {
      margin-top: 10px;
      font-size: 24px;
      color: #333;
    }
  }

  .form-container {
    width: 100%;
    max-width: 350px;

    .toggle-buttons {
      display: flex;
      justify-content: center;
      margin-bottom: 30px;

      span {
        padding: 8px 30px;
        margin: 0 10px;
        font-size: 16px;
        color: #666;
        cursor: pointer;
        border-bottom: 2px solid transparent;

        &.active {
          color: #4CAF50;
          border-bottom-color: #4CAF50;
        }
      }
    }

    .form {
      .input-group {
        margin-bottom: 20px;
        position: relative;

        input {
          width: 100%;
          height: 48px;
          padding: 0 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          
          &:focus {
            border-color: #4CAF50;
            outline: none;
          }
        }

        &.verification {
          display: flex;
          gap: 10px;

          input {
            flex: 1;
          }

          .verify-btn {
            width: 100px;
            height: 48px;
            border: none;
            border-radius: 8px;
            background-color: #4CAF50;
            color: white;
            font-size: 14px;

            &:disabled {
              background-color: #ccc;
            }
          }
        }
      }

      .submit-btn {
        width: 100%;
        height: 48px;
        border: none;
        border-radius: 8px;
        background-color: #4CAF50;
        color: white;
        font-size: 16px;
        margin-top: 20px;

        &:active {
          opacity: 0.8;
        }
      }

      .forgot-password {
        text-align: center;
        margin-top: 15px;

        span {
          color: #666;
          font-size: 14px;
        }
      }
    }
  }
}
</style> 