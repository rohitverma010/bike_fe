# backup_db.ps1
# Copies db.sqlite3 into a timestamped backup file and deletes backups
# older than $RetentionDays.

$ProjectDir   = "d:\book hotels and rentals bike website\h_r_be"
$EnvFile      = Join-Path $ProjectDir ".env"

# Defaults (overridden by .env if present)
$DbName        = "db.sqlite3"
$BackupDirName = "backups"
$RetentionDays = 30

if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match '^\s*(#|$)') { return }
        $parts = $_ -split '=', 2
        if ($parts.Count -eq 2) {
            $key = $parts[0].Trim()
            $val = $parts[1].Trim()
            switch ($key) {
                'DB_NAME'                { $DbName = $val }
                'BACKUP_DIR'              { $BackupDirName = $val }
                'BACKUP_RETENTION_DAYS'   { $RetentionDays = [int]$val }
            }
        }
    }
}

$DbFile    = Join-Path $ProjectDir $DbName
$BackupDir = Join-Path $ProjectDir $BackupDirName

if (-not (Test-Path $DbFile)) {
    Write-Error "Database file not found: $DbFile"
    exit 1
}

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupFile = Join-Path $BackupDir "db_$Timestamp.sqlite3"

Copy-Item -Path $DbFile -Destination $BackupFile -Force
Write-Output "Backed up $DbFile -> $BackupFile"

# Remove backups older than $RetentionDays
$CutoffDate = (Get-Date).AddDays(-$RetentionDays)
Get-ChildItem -Path $BackupDir -Filter "db_*.sqlite3" |
    Where-Object { $_.LastWriteTime -lt $CutoffDate } |
    ForEach-Object {
        Remove-Item $_.FullName -Force
        Write-Output "Deleted old backup: $($_.Name)"
    }
