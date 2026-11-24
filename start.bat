
@echo off
setlocal
cd /d "%~dp0"

powershell.exe -NoProfile -ExecutionPolicy Bypass -STA -Command ^
"Add-Type -AssemblyName System.Windows.Forms; ^
$form = New-Object System.Windows.Forms.Form; ^
$form.Text = 'Bradar Cinema Software Launcher'; ^
$form.ClientSize = New-Object System.Drawing.Size(540,370); ^
$form.StartPosition = 'CenterScreen'; ^
$form.FormBorderStyle = 'FixedDialog'; ^
$form.Font = New-Object System.Drawing.Font('Segoe UI',10); ^
$form.MaximizeBox = $false; ^
$form.MinimizeBox = $false; ^
$theme = (Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize' -Name AppsUseLightTheme -ErrorAction SilentlyContinue).AppsUseLightTheme; ^
$isDark = $theme -eq 0; ^
if ($isDark) { ^
    $form.BackColor = [System.Drawing.Color]::FromArgb(22,29,43); ^
    $form.ForeColor = [System.Drawing.Color]::FromArgb(232,240,250); ^
    $cardColor = [System.Drawing.Color]::FromArgb(36,49,68); ^
    $mutedColor = [System.Drawing.Color]::FromArgb(161,183,210); ^
    $cardHover = [System.Drawing.Color]::FromArgb(48,65,88); ^
} else { ^
    $form.BackColor = [System.Drawing.Color]::FromArgb(242,247,253); ^
    $form.ForeColor = [System.Drawing.Color]::FromArgb(32,49,70); ^
    $cardColor = [System.Drawing.Color]::FromArgb(227,237,250); ^
    $mutedColor = [System.Drawing.Color]::FromArgb(88,111,142); ^
    $cardHover = [System.Drawing.Color]::FromArgb(212,228,247); ^
}; ^
$brand = New-Object System.Windows.Forms.Label; ^
$brand.Text = 'BRADAR CINEMA'; ^
$brand.Location = New-Object System.Drawing.Point(34,24); ^
$brand.Size = New-Object System.Drawing.Size(470,22); ^
$brand.ForeColor = [System.Drawing.Color]::FromArgb(73,139,211); ^
$brand.Font = New-Object System.Drawing.Font('Segoe UI Semibold',9); ^
$form.Controls.Add($brand); ^
$heading = New-Object System.Windows.Forms.Label; ^
$heading.Text = 'Choose how to launch'; ^
$heading.Location = New-Object System.Drawing.Point(32,55); ^
$heading.Size = New-Object System.Drawing.Size(470,38); ^
$heading.Font = New-Object System.Drawing.Font('Segoe UI Semibold',20); ^
$form.Controls.Add($heading); ^
$subtitle = New-Object System.Windows.Forms.Label; ^
$subtitle.Text = 'Select a mode to start the site.'; ^
$subtitle.Location = New-Object System.Drawing.Point(35,100); ^
$subtitle.Size = New-Object System.Drawing.Size(470,25); ^
$subtitle.ForeColor = $mutedColor; ^
$form.Controls.Add($subtitle); ^
$build = New-Object System.Windows.Forms.Button; ^
$build.Text = 'BUILD MODE' + [Environment]::NewLine + 'User-mode preview. Promo release for show' + [Environment]::NewLine + [Environment]::NewLine + 'Start Build Mode'; ^
$build.Location = New-Object System.Drawing.Point(34,148); ^
$build.Size = New-Object System.Drawing.Size(228,142); ^
$build.TextAlign = [System.Drawing.ContentAlignment]::MiddleLeft; ^
$build.Padding = New-Object System.Windows.Forms.Padding(18,12,12,12); ^
$build.Font = New-Object System.Drawing.Font('Segoe UI Semibold',11); ^
$build.BackColor = [System.Drawing.Color]::FromArgb(63,120,189); ^
$build.ForeColor = [System.Drawing.Color]::White; ^
$build.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat; ^
$build.FlatAppearance.BorderSize = 0; ^
$build.FlatAppearance.MouseOverBackColor = [System.Drawing.Color]::FromArgb(52,106,174); ^
$build.DialogResult = [System.Windows.Forms.DialogResult]::Yes; ^
$form.Controls.Add($build); ^
$dev = New-Object System.Windows.Forms.Button; ^
$dev.Text = 'DEVELOPER MODE' + [Environment]::NewLine + 'For editing and development' + [Environment]::NewLine + [Environment]::NewLine + 'Start Developer Mode'; ^
$dev.Location = New-Object System.Drawing.Point(278,148); ^
$dev.Size = New-Object System.Drawing.Size(228,142); ^
$dev.TextAlign = [System.Drawing.ContentAlignment]::MiddleLeft; ^
$dev.Padding = New-Object System.Windows.Forms.Padding(18,12,12,12); ^
$dev.Font = New-Object System.Drawing.Font('Segoe UI Semibold',11); ^
$dev.BackColor = $cardColor; ^
$dev.ForeColor = $form.ForeColor; ^
$dev.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat; ^
$dev.FlatAppearance.BorderSize = 0; ^
$dev.FlatAppearance.MouseOverBackColor = $cardHover; ^
$dev.DialogResult = [System.Windows.Forms.DialogResult]::No; ^
$form.Controls.Add($dev); ^
$footer = New-Object System.Windows.Forms.Label; ^
$footer.Text = 'Build Mode disables editing. Developer Mode enables editing.'; ^
$footer.Location = New-Object System.Drawing.Point(35,318); ^
$footer.Size = New-Object System.Drawing.Size(470,24); ^
$footer.ForeColor = $mutedColor; ^
$footer.Font = New-Object System.Drawing.Font('Segoe UI',9); ^
$form.Controls.Add($footer); ^
$form.AcceptButton = $build; ^
$dwmCode = 'using System; using System.Runtime.InteropServices; public class DwmApi { [DllImport(@dwmapi.dll@)] public static extern int DwmSetWindowAttribute(IntPtr hwnd, int attribute, ref int value, int size); }'.Replace('@',[char]34); ^
Add-Type -TypeDefinition $dwmCode; ^
if ($isDark) { $darkMode = 1; $handle = $form.Handle; $status = [DwmApi]::DwmSetWindowAttribute($handle,20,[ref]$darkMode,4); if ($status -ne 0) { $status = [DwmApi]::DwmSetWindowAttribute($handle,19,[ref]$darkMode,4) } }; ^
$form.Add_FormClosing({ ^
    param($sender,$eventArgs) ^
    if ($sender.DialogResult -ne [System.Windows.Forms.DialogResult]::Yes -and $sender.DialogResult -ne [System.Windows.Forms.DialogResult]::No) { ^
        $closeMessage = [System.Windows.Forms.MessageBox]::Show($sender,'Goodbye!','Exit Launcher',[System.Windows.Forms.MessageBoxButtons]::OK,[System.Windows.Forms.MessageBoxIcon]::Information) ^
    } ^
}); ^
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
where wt.exe >nul 2>nul
if errorlevel 1 (
    start "Backend - Production" cmd /k "title Backend - Production && cd /d backend && if exist node_modules (npm run build && set NODE_ENV=production && set ALLOW_EDITING=false && npm start) else (npm ci && npm run build && set NODE_ENV=production && set ALLOW_EDITING=false && npm start)"
) else (
    start "" wt.exe -w new new-tab --startingDirectory "%~dp0." --title "Backend - Production" --suppressApplicationTitle cmd /k "title Backend - Production && cd /d backend && if exist node_modules (npm run build && set NODE_ENV=production && set ALLOW_EDITING=false && npm start) else (npm ci && npm run build && set NODE_ENV=production && set ALLOW_EDITING=false && npm start)"
)
call :wait_for_backend
if errorlevel 1 exit /b 1
call :minimize_terminal "Backend - Production"
where wt.exe >nul 2>nul
if errorlevel 1 (
    start "Frontend - Preview" cmd /k "title Frontend - Preview && cd /d frontend && if exist node_modules (npm run build && npm run preview) else (npm ci && npm run build && npm run preview)"
) else (
    start "" wt.exe -w new new-tab --startingDirectory "%~dp0." --title "Frontend - Preview" --suppressApplicationTitle cmd /k "title Frontend - Preview && cd /d frontend && if exist node_modules (npm run build && npm run preview) else (npm ci && npm run build && npm run preview)"
)
call :wait_for_frontend 4173
if errorlevel 1 exit /b 1
call :minimize_terminal "Frontend - Preview"
start "" "http://localhost:4173/"
echo Main page: http://localhost:4173/
echo API: http://localhost:3000
goto end

:developer
echo Starting Site in Developer Mode... (c) Samir Miles Cibis, Aleksander Kartuzov, Daniel Helmrosin 2026, All Rights Reserved.
powershell -Command "Start-Sleep -Seconds 3"
docker compose up -d --wait --wait-timeout 120
if errorlevel 1 exit /b 1
where wt.exe >nul 2>nul
if errorlevel 1 (
    start "Backend - Development" cmd /k "title Backend - Development && cd /d backend && if exist node_modules (set NODE_ENV=development && set ALLOW_EDITING=true && npm run dev) else (npm ci && set NODE_ENV=development && set ALLOW_EDITING=true && npm run dev)"
) else (
    start "" wt.exe -w new new-tab --startingDirectory "%~dp0." --title "Backend - Development" --suppressApplicationTitle cmd /k "title Backend - Development && cd /d backend && if exist node_modules (set NODE_ENV=development && set ALLOW_EDITING=true && npm run dev) else (npm ci && set NODE_ENV=development && set ALLOW_EDITING=true && npm run dev)"
)
call :wait_for_backend
if errorlevel 1 exit /b 1
call :minimize_terminal "Backend - Development"
where wt.exe >nul 2>nul
if errorlevel 1 (
    start "Frontend - Development" cmd /k "title Frontend - Development && cd /d frontend && if exist node_modules (npm run dev) else (npm ci && npm run dev)"
) else (
    start "" wt.exe -w new new-tab --startingDirectory "%~dp0." --title "Frontend - Development" --suppressApplicationTitle cmd /k "title Frontend - Development && cd /d frontend && if exist node_modules (npm run dev) else (npm ci && npm run dev)"
)
call :wait_for_frontend 5173
if errorlevel 1 exit /b 1
call :minimize_terminal "Frontend - Development"
start "" "http://localhost:5173/"
echo Developer Mode: http://localhost:5173/
echo API: http://localhost:3000
goto end

:end
endlocal
exit /b 0

:wait_for_backend
echo Waiting for the backend to finish initializing...
powershell -NoProfile -Command "$deadline = (Get-Date).AddMinutes(5); do { try { $response = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3000/movies' -TimeoutSec 2; if ($response.StatusCode -eq 200) { Write-Host 'Backend is ready.'; exit 0 } } catch { }; Start-Sleep -Seconds 2 } while ((Get-Date) -lt $deadline); Write-Error 'Backend did not become ready within 5 minutes. Frontend was not started.'; exit 1"
exit /b %errorlevel%

:wait_for_frontend
echo Waiting for Vite to start...
powershell -NoProfile -Command "$url = 'http://localhost:%~1/'; $deadline = (Get-Date).AddMinutes(5); do { try { $response = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 2; if ($response.StatusCode -eq 200) { Write-Host 'Frontend is ready.'; exit 0 } } catch { }; Start-Sleep -Milliseconds 500 } while ((Get-Date) -lt $deadline); Write-Error 'Frontend did not start.'; exit 1"
exit /b %errorlevel%

:minimize_terminal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0minimize-terminal.ps1" -WindowTitle "%~1"
exit /b