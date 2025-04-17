@# Google AI API 兼容代理

本项目为 Google AI API 的无依赖透传代理，支持云端 Deno Deploy

---

## 云端部署（推荐，适合中国大陆/全球）

使用 `google_proxy.ts`，专为 [Deno Deploy](https://deploy.deno.com) 云端部署设计。

### 云端部署流程

1. **Fork 本项目**  
   点击右上角 Fork，将本项目复制到你的 GitHub 账户下。

2. **进入 [deploy.deno.com](https://deploy.deno.com)**  
   使用 GitHub 账号登录 Deno Deploy 云平台。

3. **新建 Project**  
   点击"New Project"按钮，选择"Import from GitHub Repository"。

4. **选择你 Fork 后的本项目**  
   在仓库列表中找到你刚刚 Fork 的仓库，点击进入。

5. **接入点选择 ts 文件**  
   选择 `google_proxy.ts` 作为入口文件（entrypoint），确认并部署。

6. **（可选）设置环境变量**  
   如需全局 API Key，可在 Deno Deploy 项目设置中添加 `GOOGLE_API_KEY` 环境变量。

---

## 项目优点

- **兼容性强**：支持 Google AI API 及所有兼容格式的 API 客户端，直接透传请求与响应。
- **完全透传**：请求和响应内容不做修改，最大程度还原原始 API 行为，包括：
  - 保持原始JSON响应格式
  - 支持图片、音频等多媒体内容透传
  - 不影响Google AI搜索服务功能
- **无需其他网络代理**：无需自建服务器，无需科学上网，直接云端部署即可使用。
- **中国大陆可用**：Deno Deploy 云端节点全球可用，中国大陆用户无需额外网络配置。
- **代码简单易维护**：核心代码极简，易于理解和二次开发，方便自定义扩展。
- **支持多种响应类型**：
  - SSE流式响应（适配聊天、生成式AI场景）
  - 标准JSON响应
  - 二进制数据流（图片、音频等）
- **完善的错误处理**：详细的错误日志和调试信息
- **灵活的API Key支持**：支持多种Key传递方式（Header/URL参数/环境变量）

---

## 适用场景

- 需要在中国大陆等网络受限地区无障碍访问 Google AI API
- 需要自定义 API 代理逻辑或统计
- 需要极简、易维护的云端代理方案

---

## 技术细节

### 环境变量
| 变量名 | 说明 |
|--------|------|
| `GOOGLE_API_KEY` | 默认API Key |

### 请求选项
- Header传递: `x-api-key` 或 `x-goog-api-key`
- URL参数: `?key=YOUR_KEY`

---

## 免责声明

本项目仅供学习和个人研究用途，请勿用于任何违反相关法律法规的用途。API Key 请妥善保管，避免泄露。
