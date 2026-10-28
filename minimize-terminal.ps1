param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$WindowTitle
)

Add-Type @'
using System;
using System.Text;
using System.Runtime.InteropServices;

public class TerminalWindow {
    public delegate bool EnumWindowsProc(IntPtr hwnd, IntPtr lParam);

    [DllImport("user32.dll")]
    public static extern bool EnumWindows(
        EnumWindowsProc callback,
        IntPtr lParam
    );

    [DllImport("user32.dll")]
    public static extern int GetWindowText(
        IntPtr hwnd,
        StringBuilder text,
        int count
    );

    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr hwnd);

    [DllImport("user32.dll")]
    public static extern bool ShowWindowAsync(
        IntPtr hwnd,
        int command
    );
}
'@

$state = @{ Found = $false }
for ($attempt = 0; $attempt -lt 20 -and -not $state.Found; $attempt++) {
    $callback = [TerminalWindow+EnumWindowsProc]{
        param($hwnd, $lParam)

        if (-not [TerminalWindow]::IsWindowVisible($hwnd)) {
            return $true
        }

        $text = New-Object System.Text.StringBuilder 512
        [TerminalWindow]::GetWindowText($hwnd, $text, 512) | Out-Null

        if ($text.ToString().IndexOf(
            $WindowTitle,
            [System.StringComparison]::OrdinalIgnoreCase
        ) -lt 0) {
            return $true
        }

        [TerminalWindow]::ShowWindowAsync($hwnd, 6) | Out-Null
        $state.Found = $true
        return $true
    }.GetNewClosure()

    [TerminalWindow]::EnumWindows($callback, [IntPtr]::Zero) | Out-Null
    if (-not $state.Found) {
        Start-Sleep -Milliseconds 250
    }
}

if (-not $state.Found) {
    Write-Warning "Terminal window not found: $WindowTitle"
}
