
@echo off
setlocal
cd /d "%~dp0"

powershell.exe -NoProfile -ExecutionPolicy Bypass -STA -Command ^
"Add-Type -AssemblyName System.Windows.Forms; ^
$form = New-Object System.Windows.Forms.Form; ^
$form.Text = 'Bradar Cinema Software Launcher'; ^
$form.Size = New-Object System.Drawing.Size(420,210); ^
$form.StartPosition = 'CenterScreen'; ^
$form.FormBorderStyle = 'FixedDialog'; ^
$form.MaximizeBox = $false; ^
$theme = (Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize' -Name AppsUseLightTheme -ErrorAction SilentlyContinue).AppsUseLightTheme; ^
$isDark = $theme -eq 0; ^
if ($isDark) { ^
    $form.BackColor = [System.Drawing.Color]::FromArgb(32,32,32); ^
    $form.ForeColor = [System.Drawing.Color]::White; ^
} else { ^
    $form.BackColor = [System.Drawing.Color]::FromArgb(248,248,248); ^
    $form.ForeColor = [System.Drawing.Color]::Black; ^
}; ^
$label = New-Object System.Windows.Forms.Label; ^
$label.Text = 'Welcome back! How to you want to run site?'; ^
$label.Location = New-Object System.Drawing.Point(50,25); ^
$label.Size = New-Object System.Drawing.Size(370,30); ^
$label.Font = New-Object System.Drawing.Font('Segoe UI',11); ^
$form.Controls.Add($label); ^
$build = New-Object System.Windows.Forms.Button; ^
$build.Text = 'Build Mode'; ^
$build.Location = New-Object System.Drawing.Point(45,85); ^
$build.Size = New-Object System.Drawing.Size(145,45); ^
$build.DialogResult = [System.Windows.Forms.DialogResult]::Yes; ^
$form.Controls.Add($build); ^
$dev = New-Object System.Windows.Forms.Button; ^
$dev.Text = 'Developer Mode'; ^
$dev.Location = New-Object System.Drawing.Point(210,85); ^
$dev.Size = New-Object System.Drawing.Size(160,45); ^
$dev.DialogResult = [System.Windows.Forms.DialogResult]::No; ^
$form.Controls.Add($dev); ^
$buttonBorder = if ($isDark) { [System.Drawing.Color]::FromArgb(105,105,105) } else { [System.Drawing.Color]::FromArgb(160,160,160) }; ^
$hoverBg = if ($isDark) { [System.Drawing.Color]::FromArgb(48,48,48) } else { [System.Drawing.Color]::FromArgb(225,225,225) }; ^
$hoverBorder = if ($isDark) { [System.Drawing.Color]::FromArgb(160,160,160) } else { [System.Drawing.Color]::FromArgb(100,100,100) }; ^
$normalBg = $form.BackColor; ^
$buttonPaint = { ^
    param($sender,$e) ^
    $e.Graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias; ^
    $radius = 5; ^
    $d = $radius * 2; ^
    $x = 2; ^
    $y = 2; ^
    $w = $sender.ClientSize.Width - 5; ^
    $h = $sender.ClientSize.Height - 5; ^
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath; ^
    $path.AddArc($x,$y,$d,$d,180,90); ^
    $path.AddArc(($x+$w-$d),$y,$d,$d,270,90); ^
    $path.AddArc(($x+$w-$d),($y+$h-$d),$d,$d,0,90); ^
    $path.AddArc($x,($y+$h-$d),$d,$d,90,90); ^
    $path.CloseFigure(); ^
    $hovered = $sender.Tag -eq 'hover'; ^
    $borderColor = if ($hovered) { $hoverBorder } else { $buttonBorder }; ^
    $fillColor = if ($hovered) { $hoverBg } else { $normalBg }; ^
    $brush = New-Object System.Drawing.SolidBrush($fillColor); ^
    $pen = New-Object System.Drawing.Pen($borderColor,1.5); ^
    $e.Graphics.FillPath($brush,$path); ^
    $e.Graphics.DrawPath($pen,$path); ^
    [System.Windows.Forms.TextRenderer]::DrawText($e.Graphics,$sender.Text,$sender.Font,$sender.ClientRectangle,$sender.ForeColor,([System.Windows.Forms.TextFormatFlags]::HorizontalCenter -bor [System.Windows.Forms.TextFormatFlags]::VerticalCenter -bor [System.Windows.Forms.TextFormatFlags]::SingleLine)); ^
    $brush.Dispose(); ^
    $pen.Dispose(); ^
    $path.Dispose(); ^
}.GetNewClosure(); ^
$buttonEnter = { ^
    param($sender,$e) ^
    $sender.Tag = 'hover'; ^
    $sender.Invalidate(); ^
}; ^
$buttonLeave = { ^
    param($sender,$e) ^
    $sender.Tag = $null; ^
    $sender.Invalidate(); ^
}; ^
foreach ($btn in @($build,$dev)) { ^
    $btn.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat; ^
    $btn.UseVisualStyleBackColor = $false; ^
    $btn.BackColor = $normalBg; ^
    $btn.ForeColor = $form.ForeColor; ^
    $btn.FlatAppearance.BorderSize = 0; ^
    $btn.FlatAppearance.MouseOverBackColor = $normalBg; ^
    $btn.FlatAppearance.MouseDownBackColor = $normalBg; ^
    $btn.Region = $null; ^
    $btn.Add_Paint($buttonPaint); ^
    $btn.Add_MouseEnter($buttonEnter); ^
    $btn.Add_MouseLeave($buttonLeave); ^
}; ^
$form.AcceptButton = $build; ^
$dwmCode = 'using System; using System.Runtime.InteropServices; public class DwmApi { [DllImport(@dwmapi.dll@)] public static extern int DwmSetWindowAttribute(IntPtr hwnd, int attribute, ref int value, int size); }'.Replace('@',[char]34); ^
Add-Type -TypeDefinition $dwmCode; ^
if ($isDark) { $darkMode = 1; $handle = $form.Handle; $status = [DwmApi]::DwmSetWindowAttribute($handle,20,[ref]$darkMode,4); if ($status -ne 0) { $status = [DwmApi]::DwmSetWindowAttribute($handle,19,[ref]$darkMode,4) } }; ^
$form.CancelButton = $dev; ^
$result = $form.ShowDialog(); ^
$form.Dispose(); ^
if ($result -eq [System.Windows.Forms.DialogResult]::Yes) { exit 10 }; ^
if ($result -eq [System.Windows.Forms.DialogResult]::No) { exit 20 }; ^
exit 0"

if errorlevel 20 goto developer
if errorlevel 10 goto build
goto end


:build
echo Starting Site in Build Mode... (c) Samir Miles Cibis, Aleksander Kartuzov, Daniel Helmrosin 2026, All Rights Reserved. 
powershell -Command "Start-Sleep -Seconds 3"
docker compose up -d --wait --wait-timeout 120
if errorlevel 1 exit /b 1
start "Backend - Production" cmd /k "cd /d backend && if not exist node_modules (npm ci) && npm run build && set NODE_ENV=production&& npm start"
start "Frontend - Preview" cmd /k "cd /d frontend && if not exist node_modules (npm ci) && npm run build && npm run preview"
powershell -Command "Start-Sleep -Seconds 12"
echo Main page: http://localhost:4173/
echo API: http://localhost:3000
goto end

:developer
echo Starting Site in Developer Mode... (c) Samir Miles Cibis, Aleksander Kartuzov, Daniel Helmrosin 2026, All Rights Reserved.
powershell -Command "Start-Sleep -Seconds 3"
docker compose up -d --wait --wait-timeout 120
if errorlevel 1 exit /b 1
start "Backend - Development" cmd /k "cd /d backend && if not exist node_modules (npm ci) && set ALLOW_EDITING=true&& npm run dev"
start "Frontend - Development" cmd /k "cd /d frontend && if not exist node_modules (npm ci) && npm run dev"
powershell -Command "Start-Sleep -Seconds 12"
echo Developer Mode: http://localhost:5173/
echo API: http://localhost:3000
goto end

:end
endlocal
