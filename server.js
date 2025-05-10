/**
 * 餐厅管理系统服务器
 * 使用Node.js + Express + 维格表实现
 * 
 * 主要功能：
 * 1. 用户登录验证
 * 2. 菜品信息管理
 * 3. 数据存储和查询
 */

// 导入必要的模块
const express = require('express');      // Express框架，用于创建Web服务器
const cors = require('cors');            // 处理跨域请求
const { Vika } = require('@vikadata/vika');  // 维格表SDK

// 创建Express应用实例
const app = express();
const port = 3000;  // 服务器端口号

// 配置中间件
app.use(cors());                        // 启用CORS，允许跨域请求
app.use(express.json());                // 解析JSON请求体
app.use(express.static('public'));      // 提供静态文件服务

/**
 * 配置维格表连接
 * token: 维格表API令牌，用于身份验证
 * fieldKey: 使用字段名而不是ID，提高代码稳定性
 */
const vika = new Vika({ 
  token: "uskWTCDGtCP4YZPQlK6tTSW",    // 维格表API令牌
  requestTimeout: 30000, // 设置30秒超时
  fieldKey: "name"                        // 使用字段名而不是ID
});

/**
 * 初始化维格表数据表
 * datasheet: 菜品数据表，用于存储菜品信息
 * userDatasheet: 用户数据表，用于存储用户信息
 */
const datasheet = vika.datasheet("dstL4PN1atm2PJ8J7Y");  // 菜品数据表
const userDatasheet = vika.datasheet("dstbafPycoz6CnAKyV");  // 用户数据表

/**
 * 重试函数
 * @param {Function} fn - 要重试的异步函数
 * @param {number} retries - 重试次数
 * @param {number} delay - 重试延迟(ms)
 */
async function retry(fn, retries = 3, delay = 1000) {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;
        console.log(`操作失败，${retries}次重试机会剩余，${delay}ms后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return retry(fn, retries - 1, delay * 2);
    }
}

/**
 * 获取所有菜品
 * GET /api/dishes
 * 
 * 功能：
 * 1. 从维格表获取所有菜品数据
 * 2. 返回JSON格式的菜品列表
 * 
 * 错误处理：
 * 1. 维格表查询失败
 * 2. 数据格式错误
 */
app.get('/api/dishes', async (req, res) => {
  try {
    console.log('开始获取菜品列表...');
    
    const response = await retry(async () => {
      const result = await datasheet.records.query({
        viewId: "viwqapiGtN1Jk",
        pageSize: 100 // 设置每页记录数
      });
      
      if (!result.success) {
        throw new Error(result.message || '获取数据失败');
      }
      
      return result;
    });

    console.log('Vika API查询响应:', JSON.stringify(response, null, 2));
    res.json(response);
    
  } catch (error) {
    console.error('获取菜品异常:', error);
    res.status(error.status || 500).json({ 
      error: '获取菜品失败',
      detail: error.message,
      code: error.code
    });
  }
});

/**
 * 添加新菜品
 * POST /api/dishes
 * 
 * 请求体格式：[{ fields: { category, miaoshu, tupian_url } }]
 * 
 * 功能：
 * 1. 验证请求数据格式
 * 2. 检查必要字段
 * 3. 创建新菜品记录
 * 
 * 错误处理：
 * 1. 数据格式错误
 * 2. 字段缺失
 * 3. 创建记录失败
 */
app.post('/api/dishes', async (req, res) => {
  try {
    const records = req.body;
    console.log('收到前端数据:', JSON.stringify(records, null, 2));
    
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('请求数据格式错误或为空');
    }

    const response = await retry(async () => {
      const result = await datasheet.records.create(records);
      
      if (!result.success) {
        throw new Error(result.message || '创建记录失败');
      }
      
      return result;
    });

    console.log('菜品添加成功:', JSON.stringify(response.data, null, 2));
    res.json(response);
    
  } catch (error) {
    console.error('添加菜品异常:', error);
    res.status(error.status || 500).json({ 
      error: '添加菜品失败',
      detail: error.message,
      code: error.code
    });
  }
});

/**
 * 用户登录验证
 * POST /api/login
 * 
 * 请求体格式：{ username, password }
 * 
 * 功能：
 * 1. 验证用户名和密码
 * 2. 查询用户数据
 * 3. 返回登录结果
 * 
 * 错误处理：
 * 1. 用户名或密码为空
 * 2. 用户不存在
 * 3. 密码错误
 * 4. 查询失败
 */
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('收到登录请求:', { username });

    // 验证用户名和密码
    if (!username || !password) {
      return res.status(400).json({ 
        error: '登录失败',
        detail: '用户名和密码不能为空'
      });
    }

    // 查询用户数据
    console.log('开始查询用户数据...');
    const response = await userDatasheet.records.query({
      viewId: "viwPVMH3NE4xr"
    });

    console.log('维格表查询响应:', JSON.stringify(response, null, 2));

    if (!response.success) {
      console.error('维格表查询失败:', response);
      throw new Error('查询用户数据失败');
    }

    const records = response.data.records;
    console.log('查询到的用户记录:', JSON.stringify(records, null, 2));

    // 在内存中过滤用户，使用字段ID
    const user = records.find(record => record.fields.user_name === username);
    console.log('找到的用户:', JSON.stringify(user, null, 2));

    if (!user) {
      return res.status(401).json({ 
        error: '登录失败',
        detail: '用户名或密码错误'
      });
    }

    // 验证密码
    if (user.fields.user_password !== password) {
      return res.status(401).json({ 
        error: '登录失败',
        detail: '用户名或密码错误'
      });
    }

    // 登录成功
    res.json({
      success: true,
      message: '登录成功',
      user: {
        username: user.fields.fldoS4U7fi7wQ
      }
    });

  } catch (error) {
    console.error('登录异常:', error);
    res.status(500).json({ 
      error: '登录失败',
      detail: error.message 
    });
  }
});

/**
 * 健康检查接口
 * GET /health
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * 全局错误处理中间件
 * 处理所有未捕获的错误
 */
app.use((err, req, res, next) => {
  console.error('未捕获的错误:', err);
  res.status(500).json({
    error: '服务器内部错误',
    detail: err.message
  });
});

/**
 * 启动服务器
 * 监听指定端口
 */
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
  console.log('维格表配置:', {
    datasheet: datasheet.datasheetId,
    viewId: "viwqapiGtN1Jk",
    timeout: vika.requestTimeout
  });
}); 