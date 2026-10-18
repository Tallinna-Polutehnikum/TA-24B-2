
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
$form.AcceptButton = $build; ^
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
docker compose up -d
start "Backend - Production" cmd /k "cd /d backend && npm run build && set NODE_ENV=production && npm start"
start "Frontend - Preview" cmd /k "cd /d frontend && npm run build && npm run preview"
powershell -Command "Start-Sleep -Seconds 12"
echo Main page: http://localhost:4173/
echo API: http://localhost:3000
goto end

:developer
echo Starting Site in Developer Mode... (c) Samir Miles Cibis, Aleksander Kartuzov, Daniel Helmrosin 2026, All Rights Reserved.
powershell -Command "Start-Sleep -Seconds 3"
docker compose up -d
start "Backend - Development" cmd /k "cd /d backend && npm run dev"
start "Frontend - Development" cmd /k "cd /d frontend && npm run dev"
powershell -Command "Start-Sleep -Seconds 12"
echo Developer Mode: http://localhost:5173/
echo API: http://localhost:3000
goto end

:end
endlocal

