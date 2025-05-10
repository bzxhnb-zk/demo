# 餐厅管理系统

这是一个基于Node.js、Express和维格表的餐厅管理系统，用于展示和管理餐厅菜品信息。

## 功能特点

- 用户登录验证
- 菜品信息管理
- 响应式前端界面
- 美观的菜品展示卡片
- 实时数据更新

## 技术栈

- 后端：Node.js, Express
- 前端：HTML, CSS, JavaScript
- 数据存储：维格表
- 跨域处理：CORS

## 项目结构

```
restaurant-management/
├── public/              # 静态文件目录
│   ├── index.html      # 首页
│   ├── login.html      # 登录页面
│   ├── admin.html      # 管理页面
│   └── style.css       # 样式文件
├── server.js           # 后端服务器
└── package.json        # 项目配置
```

## API接口说明

### 1. 用户登录
- 请求路径：`POST /api/login`
- 请求参数：
  ```json
  {
    "username": "用户名",
    "password": "密码"
  }
  ```
- 返回示例：
  ```json
  {
    "success": true,
    "message": "登录成功",
    "user": {
      "username": "admin"
    }
  }
  ```

### 2. 获取菜品列表
- 请求路径：`GET /api/dishes`
- 返回示例：
  ```json
  {
    "records": [
      {
        "fields": {
          "category": "菜品名称",
          "miaoshu": "菜品描述",
          "tupian_url": "图片URL"
        }
      }
    ]
  }
  ```

### 3. 添加菜品
- 请求路径：`POST /api/dishes`
- 请求参数：
  ```json
  [{
    "fields": {
      "category": "菜品名称",
      "miaoshu": "菜品描述",
      "tupian_url": "图片URL"
    }
  }]
  ```

## 安装步骤

1. 克隆项目
```bash
git clone [项目地址]
```

2. 安装依赖
```bash
npm install
```

3. 配置维格表
- 在维格表中创建两个数据表：
  - 用户表：包含用户名和密码字段
  - 菜品表：包含菜品名称、描述和图片URL字段
- 获取维格表API令牌和表ID
- 在`server.js`中配置相关参数

4. 启动服务器
```bash
npm start
```

5. 访问应用
- 首页：`http://localhost:3000`
- 登录页：`http://localhost:3000/login.html`
- 管理页：`http://localhost:3000/admin.html`

## 配置说明

在使用前，请确保在`server.js`中配置正确的维格表信息：
- token: 维格表API令牌
- datasheetId: 维格表ID
- viewId: 视图ID

## 注意事项

- 确保网络连接正常
- 确保维格表API令牌有效
- 确保维格表数据结构正确
- 建议在生产环境中使用环境变量存储敏感信息

## 开发说明

1. 前端开发
- 使用原生JavaScript实现
- 采用响应式设计
- 使用localStorage存储登录状态

2. 后端开发
- 使用Express框架
- 实现RESTful API
- 使用维格表SDK进行数据操作

3. 数据存储
- 使用维格表存储用户和菜品数据
- 使用字段ID而不是字段名称进行数据操作
- 实现数据验证和错误处理

## 维护说明

1. 日志记录
- 服务器记录详细的请求和错误日志
- 前端控制台记录操作日志

2. 错误处理
- 统一的错误处理中间件
- 友好的错误提示信息

3. 安全措施
- 密码验证
- 跨域请求处理
- 输入数据验证 