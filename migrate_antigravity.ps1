# migrate_antigravity.ps1
# Script to safely migrate old Antigravity settings and databases to the new Antigravity IDE directory.

$ErrorActionPreference = "Stop"

# Define Paths
$OldUserPath = "$env:APPDATA\Antigravity\User"
$NewUserPath = "$env:APPDATA\Antigravity IDE\User"
$BackupParentPath = "$env:APPDATA\Antigravity IDE"
$BackupPath = Join-Path $BackupParentPath ("User_Backup_" + (Get-Date -Format "yyyyMMdd_HHmmss"))
$IDEExePath = "C:\Users\ADMIN\AppData\Local\Programs\Antigravity IDE\Antigravity IDE.exe"
$LogPath = "c:\Users\ADMIN\Documents\Zaid Asim\migration_report.txt"

function Write-Log($Message, $Level = "INFO") {
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $FormattedMessage = "[$Timestamp] [$Level] $Message"
    Write-Host $FormattedMessage
    Add-Content -Path $LogPath -Value $FormattedMessage
}

# Initialize log file
If (Test-Path $LogPath) { Remove-Item $LogPath -Force }
New-Item -Path $LogPath -ItemType File | Out-Null

Write-Log "Starting Antigravity IDE migration script..."
Write-Log "Source directory: $OldUserPath"
Write-Log "Destination directory: $NewUserPath"
Write-Log "Backup directory: $BackupPath"

# Check if Old User Path exists
if (-not (Test-Path $OldUserPath)) {
    Write-Log "ERROR: Old user directory '$OldUserPath' not found. Cannot proceed." "ERROR"
    Exit
}

# Wait for IDE processes to exit
Write-Log "Please CLOSE your Antigravity IDE and Antigravity windows now." "WARN"
Write-Log "Waiting for all active Antigravity and Antigravity IDE processes to exit..."

while ($true) {
    $procs = Get-Process -Name "Antigravity", "Antigravity IDE" -ErrorAction SilentlyContinue
    if ($procs.Count -eq 0) {
        Write-Log "No running Antigravity processes detected. Proceeding with migration."
        break
    }
    
    $procNames = $procs | Select-Object -ExpandProperty Name -Unique
    Write-Log "Waiting for processes to exit: $($procNames -join ', ')..." "INFO"
    Start-Sleep -Seconds 2
}

# Perform Backup if Target directory exists
if (Test-Path $NewUserPath) {
    Write-Log "Backing up current settings/state to: $BackupPath"
    try {
        Copy-Item -Path $NewUserPath -Destination $BackupPath -Recurse -Force
        Write-Log "Backup completed successfully."
    } catch {
        Write-Log "ERROR: Failed to back up existing user files. $_" "ERROR"
        Exit
    }
} else {
    Write-Log "No existing target user directory found. No backup needed."
    New-Item -Path $NewUserPath -ItemType Directory | Out-Null
}

# List of folders/files to copy from Old to New
$ItemsToMigrate = @(
    "globalStorage",
    "workspaceStorage",
    "snippets",
    "History",
    "settings.json"
)

foreach ($item in $ItemsToMigrate) {
    $src = Join-Path $OldUserPath $item
    $dest = Join-Path $NewUserPath $item
    
    if (Test-Path $src) {
        Write-Log "Copying: $item..."
        try {
            if (Test-Path $dest) {
                # Remove target item to ensure clean overwrite
                Remove-Item -Path $dest -Recurse -Force
            }
            
            Copy-Item -Path $src -Destination $dest -Recurse -Force
            Write-Log "Successfully copied $item."
        } catch {
            Write-Log "ERROR: Failed to copy $item: $_" "ERROR"
        }
    } else {
        Write-Log "Skipped $item (does not exist in old settings)."
    }
}

Write-Log "Migration complete! Starting Antigravity IDE..."

if (Test-Path $IDEExePath) {
    try {
        Start-Process -FilePath $IDEExePath
        Write-Log "Antigravity IDE started successfully."
    } catch {
        Write-Log "ERROR: Failed to start Antigravity IDE: $_" "ERROR"
    }
} else {
    Write-Log "WARNING: Could not find IDE executable at $IDEExePath. Please launch it manually." "WARN"
}

Write-Log "Migration script finished."
Write-Host "Press any key to close this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
