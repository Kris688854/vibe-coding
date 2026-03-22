# 健身工具 - 肌肉训练3D可视化系统

一个基于 Vue.js + Three.js + FastAPI 的健身工具，可视化展示训练动作的肌肉发力情况。

## 功能特点

- 3D 人体肌肉模型，支持前/后/侧视角切换
- 旋转、缩放查看模型
- 选择动作高亮显示主动肌和协同肌
- 按肌肉群和难度筛选动作
- 响应式设计，支持移动端

## 技术栈

- **前端**: Vue.js 3 + Vite + Pinia + Three.js
- **后端**: FastAPI (Python)
- **3D渲染**: Three.js

## 快速启动

### Windows

```bash
# 双击运行
start.bat
```

### Linux / macOS

```bash
chmod +x start.sh
./start.sh
```

### 手动启动

```bash
# 后端
cd backend
pip install -r ../requirements.txt
uvicorn main:app --reload --port 8000

# 前端 (新终端)
cd frontend
npm install
npm run dev
```

## 项目结构

```
fitness-tool/
├── backend/
│   ├── main.py              # FastAPI 入口
│   ├── data/
│   │   ├── muscles.py       # 肌肉定义 (19个)
│   │   └── exercises.py     # 动作数据 (45个)
│   └── routers/
│       └── api.py           # API 路由
│
├── frontend/
│   ├── src/
│   │   ├── App.vue          # 主组件
│   │   ├── main.js          # 入口文件
│   │   ├── style.css        # 全局样式
│   │   ├── components/
│   │   │   ├── MuscleViewer.vue    # 3D 视图
│   │   │   ├── ExerciseList.vue    # 动作列表
│   │   │   ├── FilterBar.vue       # 筛选栏
│   │   │   ├── ExerciseDetail.vue  # 详情面板
│   │   │   └── MuscleLegend.vue    # 图例
│   │   ├── stores/
│   │   │   └── exercise.js  # 状态管理
│   │   └── three/
│   │       └── HumanModel.js # 人体模型
│   └── package.json
│
├── requirements.txt
└── README.md
```

## API 接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/muscles` | 获取所有肌肉定义 |
| GET | `/api/exercises` | 获取动作列表 |
| GET | `/api/exercises/{id}` | 获取动作详情 |
| GET | `/api/categories` | 获取肌肉分类 |

## 肌肉数据

共 19 个肌肉部位：

| 分类 | 肌肉 |
|------|------|
| 胸部 (3) | 上胸、中胸、下胸 |
| 背部 (4) | 背阔肌、菱形肌、斜方肌、竖脊肌 |
| 腿部 (4) | 股四头肌、腘绳肌、臀大肌、小腿 |
| 肩部 (3) | 三角肌前束、中束、后束 |
| 手臂 (3) | 肱二头肌、肱三头肌、前臂 |
| 核心 (2) | 腹直肌、腹斜肌 |

## 动作数据

共 45 个训练动作：

| 分类 | 数量 |
|------|------|
| 胸部 | 9 |
| 背部 | 9 |
| 腿部 | 7 |
| 肩部 | 7 |
| 手臂 | 7 |
| 核心 | 6 |

## 使用说明

1. 启动应用后，在左侧选择肌肉群和难度筛选动作
2. 点击动作名称，在右侧3D视图中查看肌肉发力情况
3. 主动肌（主要发力）显示高亮
4. 协同肌（辅助发力）显示较暗高亮
5. 使用底部按钮切换视角（正面/背面/左侧/右侧）
6. 鼠标拖拽旋转、滚轮缩放3D模型
