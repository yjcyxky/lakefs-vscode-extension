# LakeFS VSCode Extension 使用说明

## 功能概述

这个VSCode扩展为LakeFS提供了类似Git的界面，让你可以在VSCode中直接执行LakeFS的基本操作。

## 主要功能

### 1. LakeFS 面板
扩展会在VSCode的资源管理器中添加一个"LakeFS"面板，提供以下功能：

#### 当lakectl未安装时：
- 显示警告信息："⚠️ lakectl not installed"
- 点击可直接打开LakeFS安装文档

#### 当lakectl已安装时：
- **Repository Status**: 查看仓库状态
- **Commit Changes**: 提交更改

### 2. 状态查看功能
点击"Repository Status"按钮会：
1. 执行 `lakectl local status` 命令
2. 在新文档窗口中显示状态结果
3. 在"LakeFS"输出通道中记录执行日志

### 3. 提交功能
点击"Commit Changes"按钮会启动交互式提交流程：

1. **输入提交消息**: 必填字段，不能为空
2. **添加元数据（可选）**:
   - 选择"Add metadata"可以添加key-value对
   - 选择"Finish and commit"完成提交
   - 可以添加多个元数据
3. **执行提交**: 自动构建并执行类似以下的命令：
   ```bash
   lakectl local commit . -m "your message" --meta "key1=value1" --meta "key2=value2"
   ```

## 安装要求

### 1. 安装lakectl
在使用此扩展之前，你需要先安装lakectl命令行工具：

- 访问：https://docs.lakefs.io/quickstart/installing.html
- 按照说明安装适合你操作系统的lakectl版本
- 确保lakectl在你的PATH环境变量中

### 2. 验证安装
在终端中运行以下命令验证lakectl是否正确安装：
```bash
lakectl --version
```

## 使用方法

### 方法1：通过面板操作
1. 打开VSCode工作区
2. 在资源管理器中找到"LakeFS"面板
3. 点击相应的操作项目

### 方法2：通过命令面板
按 `Cmd+Shift+P` (macOS) 或 `Ctrl+Shift+P` (Windows/Linux) 打开命令面板，然后输入：
- `LakeFS: Show Status` - 查看状态
- `LakeFS: Commit Changes` - 提交更改
- `LakeFS: Refresh` - 刷新面板

### 方法3：通过面板顶部按钮
LakeFS面板顶部有三个按钮：
- 🔄 刷新
- 📊 查看状态
- 💾 提交更改

## 配置选项

在VSCode设置中，你可以配置：

- `lakefs.ignoreFiles`: 要监控的忽略文件列表（默认：[".gitignore", ".lakefsignore"]）
- `lakefs.enabled`: 启用/禁用文件装饰功能（默认：true）
- `lakefs.lakectlPath`: 自定义lakectl可执行文件路径（默认：""，从PATH搜索）

### 配置自定义lakectl路径

如果你的lakectl安装在非标准位置，可以通过以下方式配置：

#### 方法1：通过设置界面
1. 按 `Cmd+,` (macOS) 或 `Ctrl+,` (Windows/Linux) 打开设置
2. 搜索 "lakefs.lakectlPath"
3. 输入完整的lakectl路径，例如：
   - macOS/Linux: `/usr/local/bin/lakectl` 或 `/home/user/bin/lakectl`
   - Windows: `C:\Program Files\lakectl\lakectl.exe`

#### 方法2：通过settings.json
在VSCode的settings.json中添加：
```json
{
    "lakefs.lakectlPath": "/path/to/your/lakectl"
}
```

#### 方法3：通过面板快捷方式
当lakectl未找到时，面板中会显示"⚙️ Configure custom path"选项，点击可直接打开设置页面。

## 故障排除

### 问题1：面板显示"lakectl not found"或"lakectl path invalid"
**解决方案**：
1. **如果显示"lakectl not found"**：
   - 安装lakectl（参见安装要求）
   - 确保lakectl在PATH中，或配置自定义路径
   - 点击面板中的刷新按钮

2. **如果显示"lakectl path invalid"**：
   - 检查配置的路径是否正确
   - 确保文件存在且可执行
   - 更新 `lakefs.lakectlPath` 设置
   - 面板会自动刷新

3. **通用步骤**：
   - 重启VSCode（如果需要）
   - 使用面板中的"⚙️ Configure custom path"快捷方式

### 问题2：命令执行失败
**解决方案**：
1. 检查"LakeFS"输出通道查看详细错误信息
2. 确保当前工作区是一个有效的LakeFS仓库
3. 验证lakectl配置是否正确

### 问题3：面板不显示
**解决方案**：
1. 确保打开了工作区文件夹
2. 检查扩展是否已启用
3. 尝试重新加载窗口（Cmd+R / Ctrl+R）

## 调试

如果遇到问题，可以：
1. 打开VSCode开发者控制台查看日志
2. 检查"LakeFS"输出通道
3. 在终端中手动运行lakectl命令验证

## 测试用Mock脚本

为了测试扩展功能，项目包含了一个mock lakectl脚本 (`test-lakectl.sh`)，你可以：

```bash
# 使mock脚本可执行
chmod +x test-lakectl.sh

# 创建软链接（可选，用于测试）
mkdir -p ~/bin
ln -sf "$(pwd)/test-lakectl.sh" ~/bin/lakectl
export PATH="$HOME/bin:$PATH"
```

这样你就可以测试扩展功能而不需要真正的LakeFS环境。