# 地区数据迁移脚本 (PowerShell版本)
# 功能：将 config/index.js 中的 areaData 提取到独立的 area-data.js 文件

Write-Host "🚀 开始迁移地区数据...`n" -ForegroundColor Green

# 获取脚本所在目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 文件路径
$IndexPath = Join-Path $ScriptDir "index.js"
$AreaDataPath = Join-Path $ScriptDir "area-data.js"
$BackupPath = Join-Path $ScriptDir "index.js.backup"

try {
    # 1. 备份原文件
    Write-Host "📦 备份原文件..." -ForegroundColor Cyan
    Copy-Item $IndexPath $BackupPath -Force
    Write-Host "✅ 已备份到: $BackupPath`n" -ForegroundColor Green

    # 2. 读取 index.js
    Write-Host "📖 读取 config/index.js..." -ForegroundColor Cyan
    $IndexContent = Get-Content $IndexPath -Raw -Encoding UTF8

    # 3. 提取 areaData（使用正则表达式）
    Write-Host "🔍 提取地区数据..." -ForegroundColor Cyan
    
    # 查找 areaData 的开始位置
    $StartPattern = "export const areaData = \["
    $StartIndex = $IndexContent.IndexOf($StartPattern)
    
    if ($StartIndex -eq -1) {
        throw "未找到 areaData 定义"
    }

    # 从开始位置往后查找匹配的结束位置
    # 找到最后的 "];"
    $AfterStart = $IndexContent.Substring($StartIndex)
    $EndPattern = "`n];"
    $RelativeEndIndex = $AfterStart.LastIndexOf($EndPattern)
    
    if ($RelativeEndIndex -eq -1) {
        throw "未找到 areaData 结束标记"
    }

    # 提取完整的 areaData 代码
    $AreaDataCode = $AfterStart.Substring(0, $RelativeEndIndex + 3)  # +3 for "];`n"
    
    $LineCount = ($AreaDataCode -split "`n").Count
    Write-Host "✅ 提取到 $LineCount 行地区数据`n" -ForegroundColor Green

    # 4. 创建新的 area-data.js 内容
    Write-Host "✍️  生成 area-data.js..." -ForegroundColor Cyan
    $AreaDataFileContent = @"
/**
 * 地区数据（独立文件）
 * 从 config/index.js 迁移而来
 * 仅在需要时加载（如电费查询页面、地址选择等）
 * 
 * 使用方式：
 * import { areaData } from '../../config/area-data';
 */

$AreaDataCode
"@

    # 5. 写入 area-data.js
    [System.IO.File]::WriteAllText($AreaDataPath, $AreaDataFileContent, [System.Text.UTF8Encoding]::new($false))
    Write-Host "✅ 已创建: $AreaDataPath`n" -ForegroundColor Green

    # 6. 修改 index.js，移除 areaData 定义，改为导入
    Write-Host "🔧 更新 config/index.js..." -ForegroundColor Cyan
    
    # 替换 areaData 定义为导入语句
    $NewAreaDataSection = @"
// 地区数据已迁移到独立文件
// 导入地区数据
import { areaData } from './area-data';

// 重新导出地区数据（保持兼容性）
export { areaData };
"@

    $NewIndexContent = $IndexContent.Replace($AreaDataCode, $NewAreaDataSection)

    # 7. 写回 index.js
    [System.IO.File]::WriteAllText($IndexPath, $NewIndexContent, [System.Text.UTF8Encoding]::new($false))
    Write-Host "✅ 已更新 config/index.js`n" -ForegroundColor Green

    # 8. 验证文件大小
    $OldSize = (Get-Item $BackupPath).Length
    $NewSize = (Get-Item $IndexPath).Length
    $AreaDataSize = (Get-Item $AreaDataPath).Length
    
    Write-Host "📊 文件大小对比:" -ForegroundColor Cyan
    Write-Host "   原 index.js:     $([Math]::Round($OldSize / 1KB, 2)) KB"
    Write-Host "   新 index.js:     $([Math]::Round($NewSize / 1KB, 2)) KB"
    Write-Host "   新 area-data.js: $([Math]::Round($AreaDataSize / 1KB, 2)) KB"
    Write-Host "   减少大小:        $([Math]::Round(($OldSize - $NewSize) / 1KB, 2)) KB`n"

    Write-Host "✅ 迁移完成！`n" -ForegroundColor Green
    Write-Host "📝 后续步骤:" -ForegroundColor Yellow
    Write-Host "   1. 检查 config/index.js 和 config/area-data.js"
    Write-Host "   2. 测试所有使用地区数据的页面"
    Write-Host "   3. 确认无误后删除备份文件: config/index.js.backup"
    Write-Host ""

} catch {
    Write-Host "❌ 迁移失败: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n如果出现问题，请从备份恢复:" -ForegroundColor Yellow
    Write-Host "   Copy-Item config/index.js.backup config/index.js -Force" -ForegroundColor Yellow
    exit 1
}

