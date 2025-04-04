# Google AI API 透明代理

一个用于Deno部署的Google AI API透明代理服务，完全保留原始请求和响应格式。

## 核心特性

✅ **完全透明的流量转发**  
- 请求体/响应体零修改
- 精准匹配原始API头信息
- 原生支持SSE流式响应

🔒 **安全验证**  
- 支持多种API Key传递方式:
  - Header (x-api-key/x-goog-api-key)
  - URL参数 (?key=)
  - 环境变量

📊 **详细日志**  
- 记录完整请求链路
- 包含转发前后的URL
- 时间戳标记

## 快速开始

1. **安装Deno**  
   ```bash
   curl -fsSL https://deno.land/x/install/install.sh | sh
   ```

2. **部署服务**  
   ```bash
   deno run -A google_proxy.ts
   ```

3. **发送请求**  
   ```bash
   curl -X POST \
     -H "x-goog-api-key: YOUR_KEY" \
     -H "Content-Type: application/json" \
     -d '{"contents":"测试"}' \
     "http://localhost:8000/v1beta/models/gemini-pro:streamGenerateContent?alt=sse" 
   ```

## 部署指南

### 本地运行
```bash
export GOOGLE_API_KEY="your_key"
deno run --allow-net --allow-env google_proxy.ts
```

### Deno Deploy
1. 将代码推送至GitHub仓库
2. 在Deno Deploy创建新项目
3. 设置环境变量:
   ```
   GOOGLE_API_KEY=your_key
   ```

## 配置说明

### 环境变量
| 变量名 | 说明 |
|--------|------|
| `GOOGLE_API_KEY` | 默认API Key |

### 请求选项
- Header传递: `x-api-key` 或 `x-goog-api-key`
- URL参数: `?key=YOUR_KEY`

---

> 📝 **Note**: 确保您的API Key有访问Gemini API的权限  
> ⚠️ **Warning**: 日志会记录敏感信息，生产环境需注意
