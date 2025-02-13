项目介绍
这是一个基于 Vue 3 和 Node.js 开发的每周心情记录与统计项目。用户可以通过邮箱注册和登录，记录每日心情，并将其展示在直观的 Echarts 图表中。项目包含前后端，功能主要有：

用户通过邮箱注册并登录。
登录后，用户可以记录每日心情和想法。
每天发布的心情数据会渲染到 Echarts 图表上，展示每周心情趋势。
#### 项目结构
```
mood-record/
├── server/ # 后端服务器目录
│ ├── app.js # 主服务器文件
│ └── .env # 环境变量配置
│
├── src/ # 前端源代码目录
│ ├── assets/ # 静态资源文件夹
│ ├── components/ # Vue 组件目录
│ │ ├── Analysis.vue # 心情分析组件
│ │ ├── Mood.vue # 心情记录组件
│ │ └── MyInfo.vue # 用户信息组件
│ │
│ ├── utils/ # 工具函数目录
│ │ ├── request.js # 请求封装
│ │ └── axios.js # Axios 配置
│ │
│ ├── router/ # 路由配置目录
│ │ └── index.js # 路由定义
│ │
│ ├── constants/ # 常量定义目录
│ │ └── images.js # 图片配置
│ │
│ ├── App.vue # 根组件
│ └── main.js # 应用入口文件
│
├── public/ # 公共资源目录
├── package.json # 项目依赖配置
└── README.md # 项目说明文档
```

#### 技术栈

##### 前端
- Vue 3
- Vue Router 用于路由管理
- Axios 用于HTTP请求
- ECharts 用于数据可视化
- Vant UI 移动端组件库

##### 后端
- Node.js
- Express 框架
- MySQL 数据库
- JWT 用于用户认证

#### 主要功能

1. 用户系统
   - 邮箱注册
   - 用户登录
   - Token 认证
   - 个人信息管理

2. 心情记录
   - 多种心情类型选择
   - 文字记录功能
   - 实时保存
   - 每日心情更新

3. 数据分析
   - 周心情趋势图
   - 心情分布统计
   - 数据可视化展示
   - 历史记录查看

#### 安装和运行

1. 环境要求
   - Node.js >= 14
   - MySQL >= 5.7

2. 前端启动
   - 安装依赖
   npm install

3. 后端配置和启动
   - 进入后端项目目录
   ```bash
   cd server
   ```
   - 安装依赖
   ```bash
   pnpm install
   ```
   - 配置数据库
     - 创建名为 `mood` 的数据库
     - 导入 `mood.sql` 文件（如果有）
     - 配置 `.env` 文件中的数据库信息：
     ```env
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=123456
     DB_NAME=mood
     JWT_SECRET=your_secret_key
     ```
   - 启动后端服务
   ```bash
   node app.js
   ```
   - 访问地址：`http://localhost:3001`

## API 接口说明

1. 用户相关
   - **POST /api/login** - 用户登录
   - **POST /api/register** - 用户注册
   - **GET /api/user** - 获取用户信息

2. 心情记录
   - **POST /api/mood/record** - 记录心情
   - **GET /api/mood/weekly-trend** - 获取周趋势
   - **GET /api/mood/distribution** - 获取心情分布
 


