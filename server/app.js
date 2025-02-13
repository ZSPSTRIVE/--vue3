require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// 数据库连接配置
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET;

// 邮件发送配置
const transporter = nodemailer.createTransport({
  host: 'smtp.qq.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 生成验证码
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 检查邮箱是否已注册
app.post('/api/check-email', async (req, res) => {
  let connection;
  try {
    const { email } = req.body;
    
    connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    connection.release();

    res.json({ 
      exists: users.length > 0,
      message: users.length > 0 ? '该邮箱已被注册' : '邮箱可用'
    });
  } catch (error) {
    console.error('检查邮箱失败:', error);
    if (connection) {
      connection.release();
    }
    res.status(500).json({ error: '检查邮箱失败' });
  }
});

// 修改发送验证码接口
app.post('/api/send-code', async (req, res) => {
  let connection;
  try {
    const { email } = req.body;
    console.log('收到发送验证码请求:', email);

    // 先检查邮箱是否已被注册
    connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (users.length > 0) {
      connection.release();
      return res.status(400).json({ error: '该邮箱已被注册' });
    }

    const code = generateVerificationCode();
    const expires_at = new Date(Date.now() + 10 * 60000);

    await connection.execute(
      'INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, ?)',
      [email, code, expires_at]
    );
    console.log('验证码保存成功');

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Mood App 验证码',
      text: `您的验证码是：${code}，10分钟内有效。`
    });
    console.log('邮件发送成功');

    connection.release();
    res.json({ message: '验证码已发送' });
  } catch (error) {
    console.error('发送验证码失败:', error);
    if (connection) {
      connection.release();
    }
    res.status(500).json({ error: '发送验证码失败' });
  }
});

// 注册
app.post('/api/register', async (req, res) => {
  let connection;
  try {
    const { email, password, code, username } = req.body;
    console.log('收到注册请求:', { email, password: '***', code, username });

    // 验证必要字段
    if (!email || !password || !code) {
      return res.status(400).json({ error: '缺少必要字段' });
    }

    connection = await pool.getConnection();
    console.log('数据库连接成功');

    // 先检查邮箱是否已被注册
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      connection.release();
      return res.status(400).json({ error: '该邮箱已被注册' });
    }

    // 验证验证码
    const [codes] = await connection.execute(
      'SELECT * FROM verification_codes WHERE email = ? AND code = ? AND is_used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email, code]
    );
    console.log('验证码查询结果:', codes);

    if (codes.length === 0) {
      connection.release();
      return res.status(400).json({ error: '验证码无效或已过期' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('密码加密成功');

    // 使用邮箱前缀作为默认用户名（如果没有提供用户名）
    const defaultUsername = email.split('@')[0];
    const finalUsername = username || defaultUsername;

    // 创建用户
    const [result] = await connection.execute(
      'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
      [email, finalUsername, hashedPassword]
    );
    console.log('用户创建结果:', result);

    // 标记验证码已使用
    await connection.execute(
      'UPDATE verification_codes SET is_used = TRUE WHERE id = ?',
      [codes[0].id]
    );
    console.log('验证码已标记为已使用');

    connection.release();
    res.json({ 
      message: '注册成功',
      user: {
        email,
        username: finalUsername
      }
    });
  } catch (error) {
    console.error('注册失败，详细错误:', error);
    if (connection) {
      connection.release();
    }
    // 返回更具体的错误信息
    res.status(500).json({ 
      error: '注册失败',
      details: error.message,
      code: error.code 
    });
  }
});

// 登录
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ error: '用户不存在' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: '密码错误' });
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 更新最后登录时间
    await connection.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '登录失败' });
  }
});

// 获取用户信息
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT id, email, username, avatar FROM users WHERE id = ?',
      [req.user.userId]
    );
    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

// JWT中间件
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未提供token' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'token无效' });
    }
    req.user = user;
    next();
  });
}

// 获取心情类型列表
app.get('/api/mood-types', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [types] = await connection.execute('SELECT * FROM mood_types');
    connection.release();
    res.json(types);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取心情类型失败' });
  }
});

// 记录用户心情
app.post('/api/mood/record', authenticateToken, async (req, res) => {
  let connection;
  try {
    const { type, content } = req.body;
    const userId = req.user.userId;  // 从token中获取用户ID
    
    console.log('记录心情:', { userId, type, content });

    connection = await pool.getConnection();

    // 先检查心情类型是否存在
    const [moodType] = await connection.execute(
      'SELECT id FROM mood_types WHERE name = ?',
      [type]
    );

    if (moodType.length === 0) {
      connection.release();
      return res.status(400).json({ error: '无效的心情类型' });
    }

    // 检查今天是否已经记录过心情
    const [existing] = await connection.execute(
      'SELECT id FROM mood_records WHERE user_id = ? AND created_at = CURRENT_DATE',
      [userId]
    );

    if (existing.length > 0) {
      // 更新今天的心情记录
      await connection.execute(
        `UPDATE mood_records 
         SET mood_type_id = ?,
             content = ?,
             created_time = CURRENT_TIMESTAMP
         WHERE user_id = ? AND created_at = CURRENT_DATE`,
        [moodType[0].id, content, userId]
      );
    } else {
      // 创建新的心情记录
      await connection.execute(
        `INSERT INTO mood_records (user_id, mood_type_id, content)
         VALUES (?, ?, ?)`,
        [userId, moodType[0].id, content]
      );
    }

    connection.release();
    res.json({ message: '心情记录成功' });
  } catch (error) {
    console.error('记录心情失败:', error);
    if (connection) connection.release();
    res.status(500).json({ error: '记录心情失败' });
  }
});

// 获取用户心情记录
app.get('/api/mood/records', authenticateToken, async (req, res) => {
  let connection;
  try {
    const userId = req.user.userId;
    const { start_date, end_date } = req.query;
    
    console.log('查询参数:', { userId, start_date, end_date });

    connection = await pool.getConnection();
    
    // 先检查用户是否存在
    const [user] = await connection.execute(
      'SELECT id, email FROM users WHERE id = ?',
      [userId]
    );
    console.log('查询到的用户:', user);

    if (user.length === 0) {
      connection.release();
      return res.status(404).json({ error: '用户不存在' });
    }

    // 查询心情记录
    const [records] = await connection.execute(
      `SELECT 
        mr.created_at,
        mt.name as mood_type,
        mt.value as mood_value,
        mr.content,
        mr.created_time
       FROM mood_records mr
       JOIN mood_types mt ON mr.mood_type_id = mt.id
       WHERE mr.user_id = ?
       AND mr.created_at BETWEEN ? AND ?
       ORDER BY mr.created_at ASC`,  // 修改为升序
      [userId, start_date || '2024-01-01', end_date || '2024-12-31']
    );
    
    console.log('查询到的记录:', records);
    
    connection.release();
    res.json(records);
  } catch (error) {
    console.error('获取心情记录失败:', error);
    if (connection) {
      connection.release();
    }
    res.status(500).json({ 
      error: '获取心情记录失败',
      details: error.message 
    });
  }
});

// 获取本周心情趋势
app.get('/api/mood/weekly-trend', authenticateToken, async (req, res) => {
  let connection;
  try {
    const userId = req.user.userId;
    console.log('查询用户ID:', userId);

    // 获取当前日期
    const today = new Date();
    const currentDay = today.getDay();
    
    // 计算本周一的日期
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    monday.setHours(0, 0, 0, 0);

    // 计算本周日的结束时间
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    console.log('查询日期范围:', {
      monday: monday.toISOString(),
      sunday: sunday.toISOString()
    });

    connection = await pool.getConnection();

    // 修改SQL，使用MAX函数获取每天最新的一条记录
    const [records] = await connection.execute(
      `SELECT 
        DATE_FORMAT(mr.created_at, '%Y-%m-%d') as date,
        mt.value as mood_value,
        mr.content
      FROM (
        SELECT 
          user_id,
          DATE(created_at) as day,
          MAX(created_at) as latest_time
        FROM mood_records
        WHERE user_id = ?
          AND created_at >= ?
          AND created_at <= ?
        GROUP BY user_id, DATE(created_at)
      ) latest
      JOIN mood_records mr ON mr.user_id = latest.user_id 
        AND DATE(mr.created_at) = latest.day
        AND mr.created_at = latest.latest_time
      JOIN mood_types mt ON mr.mood_type_id = mt.id
      ORDER BY mr.created_at ASC`,
      [userId, monday.toISOString(), sunday.toISOString()]
    );

    console.log('查询结果:', records);
    res.json(records);

  } catch (error) {
    console.error('获取心情趋势失败:', error);
    if (connection) connection.release();
    res.status(500).json({ error: '获取心情趋势失败' });
  } finally {
    if (connection) connection.release();
  }
});

// 获取心情分布统计
app.get('/api/mood/distribution', authenticateToken, async (req, res) => {
  let connection;
  try {
    const userId = req.user.userId;  // 从token中获取用户ID
    console.log('获取用户心情分布:', userId);

    connection = await pool.getConnection();

    // 获取用户的心情分布统计
    const [records] = await connection.execute(
      `SELECT 
        mt.name as mood_type,
        mt.value as mood_value,
        COUNT(*) as count
      FROM mood_records mr
      JOIN mood_types mt ON mr.mood_type_id = mt.id
      WHERE mr.user_id = ?
      GROUP BY mt.id, mt.name, mt.value
      ORDER BY mt.value DESC`,
      [userId]
    );

    console.log('用户心情分布:', records);
    connection.release();
    res.json(records);
  } catch (error) {
    console.error('获取心情分布失败:', error);
    if (connection) connection.release();
    res.status(500).json({ error: '获取心情分布失败' });
  }
});

// 添加数据库连接测试
pool.getConnection()
  .then(connection => {
    console.log('数据库连接成功');
    connection.release();
  })
  .catch(err => {
    console.error('数据库连接失败:', err);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 