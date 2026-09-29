# 🦞 OpenClaw 记账助手

基于 [OpenClaw](https://github.com/openclaw/openclaw) + DeepSeek 的个人财务记账 bot。微信扫码即用，自然语言记账，带 Web 可视化看板。

## 效果

```
微信发：
  你：刚吃了碗川菜45
  🤖：✅ 🍜 餐饮 - 川菜 ¥45.00

  你：我这个月花太多了吗
  🤖：📊 5月消费洞察
      日均 ¥82.7，比上月 ↓5%，控制得不错！
      📈 餐饮 ↑18%，外卖从8次增到15次
      💡 午餐自带一个月能省 ¥200+
```

## 功能

- 📱 **微信快捷记账** — 自然语言输入，AI 自动提取金额和分类
- ✏️ **支持删改** — "刚才那条改成50"、"删掉最后一条"
- 📊 **消费洞察** — "我是不是花太多了" → AI 对比上月给分析
- 📈 **Web 看板** — localhost:8080 实时图表
- 🔌 **模型可换** — DeepSeek / OpenAI / Anthropic 都支持

## 前置要求

- [Node.js](https://nodejs.org) (v18+)
- [DeepSeek API Key](https://platform.deepseek.com)
- 实名认证的微信号
- Windows / macOS / Linux

## 安装

### 1. 安装 OpenClaw

```bash
npm install -g openclaw
```

### 2. 克隆本项目

```bash
git clone https://github.com/你的用户名/openclaw-bookkeeper.git
cd openclaw-bookkeeper
```

### 3. 配置

复制配置文件到 OpenClaw 目录：

```bash
# 主配置（记得改 API Key 和密码）
cp config/openclaw.json.example ~/.openclaw/openclaw.json

# 人格文件
cp config/SOUL.md ~/.openclaw/workspace/SOUL.md
cp config/IDENTITY.md ~/.openclaw/workspace/IDENTITY.md

# 技能
cp skills/bookkeeping.md ~/.openclaw/skills/bookkeeping.md

# 初始账本
cp config/ledger.json.example ~/.openclaw/workspace/ledger.json
```

编辑 `~/.openclaw/openclaw.json`：

- `models.providers.deepseek.apiKey` → 你的 DeepSeek API Key
- `gateway.auth.token` → 改成你的密码
- `agents.defaults.workspace` → 改成你的实际路径

### 4. 安装微信插件

```bash
openclaw plugins install @tencent-weixin/openclaw-weixin@2.4.3
```

### 5. 启动

```bash
# 安装并启动 Gateway（Windows 后台服务）
openclaw gateway install
openclaw gateway start

# 启动看板服务器
node server.js
```

Windows 用户也可以直接双击 `start.bat`。

### 6. 连接微信

```bash
openclaw channels login --channel openclaw-weixin
```

手机微信扫描终端显示的二维码（或打开输出的链接）。

## 使用

| 微信发什么 | 效果 |
|-----------|------|
| 午饭川菜45 | 自动记录：餐饮 ¥45 |
| 打车去公司28块 | 自动记录：交通 ¥28 |
| 工资到账15000 | 自动记录：收入 ¥15000 |
| 刚才那条改成50 | 修改最近记录 |
| 删掉最后一条 | 删除（二次确认） |
| 本月花了多少 | 统计回复 |
| 我是不是花太多了 | 消费洞察 + 建议 |

## 看板

浏览器打开 `http://localhost:8080`

- 本月支出/收入/结余卡片
- 分类占比饼图
- 近30天趋势折线图
- 最近10条记录

## 切换模型

编辑 `~/.openclaw/openclaw.json` 的 `models.providers`：

**OpenAI：**
```json
"openai": {
  "baseUrl": "https://api.openai.com/v1",
  "apiKey": "sk-xxx",
  "api": "openai-completions",
  "models": [{ "id": "gpt-4.1" }]
}
// primary: "openai/gpt-4.1"
```

**Anthropic Claude：**
```json
"anthropic": {
  "apiKey": "sk-ant-xxx",
  "models": [{ "id": "claude-sonnet-4-6" }]
}
// primary: "anthropic/claude-sonnet-4-6"
```

改完运行 `openclaw gateway restart`。

## 自定义

- `SOUL.md` — bot 人格和行为规则
- `IDENTITY.md` — 名字、风格、emoji
- `skills/bookkeeping.md` — 记账技能详细 prompt
- `dashboard/` — 看板前端代码（Chart.js）

## 文件结构

```
├── server.js              # 看板服务器
├── start.bat / stop.bat   # Windows 启停脚本
├── dashboard/             # Web 看板
├── skills/                # 记账技能
├── config/                # 配置模板
│   ├── openclaw.json.example
│   ├── SOUL.md
│   ├── IDENTITY.md
│   └── ledger.json.example
└── README.md
```

## 数据备份

所有记账数据在 `~/.openclaw/workspace/ledger.json`，复制即备份。

## License

MIT
