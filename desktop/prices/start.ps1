$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$runtime = Join-Path $root 'desktop/facade/node_modules/electron/dist/electron.exe'
Start-Process -FilePath $runtime -ArgumentList ('"' + $PSScriptRoot + '"') -WindowStyle Normal
