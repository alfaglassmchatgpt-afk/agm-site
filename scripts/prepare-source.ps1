$ErrorActionPreference = 'Stop'
# Run only against the local, untracked review copy obtained over SSH.
# This is a sanitised reference snapshot, never a deployment command.
$root = Split-Path $PSScriptRoot -Parent
$inputRoot = Join-Path $root '.local'
$outputRoot = Join-Path $root 'src'
$include = @('themes/alfa-glass-home-2026', 'plugins/alfaglass-site-auditor', 'plugins/elementor-addon-by-screpter')
$extensions = @('.php','.js','.css','.sass','.scss','.html','.json','.svg','.md','.txt','.xml','.dist')
$excluded = @()
$manifest = @()
foreach ($folder in $include) {
    $source = Join-Path $inputRoot $folder
    foreach ($file in Get-ChildItem -LiteralPath $source -File -Recurse) {
        $relative = $file.FullName.Substring($inputRoot.Length + 1).Replace('\','/')
        if ($file.Extension -notin $extensions -or $relative -match 'agm-company/.*(html|json)$|production-questionnaire|languages/|killbot|\.min\.|_back|_bak') {
            $excluded += $relative
            continue
        }
        $content = [IO.File]::ReadAllText($file.FullName)
        $content = [regex]::Replace($content, "define\s*\(\s*'(AG_GS_WEBHOOK_URL|AG_GS_SECRET)'\s*,\s*'[^']*'\s*\)", {
            param($m)
            $name = $m.Groups[1].Value
            "define('$name', getenv('$name') ?: '')"
        })
        $content = [regex]::Replace($content, 'https://script\.google\.com/macros/s/[^\s''"<>]+', 'https://example.invalid/integration-disabled')
        $content = [regex]::Replace($content, '(\$phpmailer->(?:Password|Username|Host)\s*=\s*)''[^'']*''', '$1''''')
        $content = [regex]::Replace($content, '(?s)<!-- AGM-TEAM-START -->.*?<!-- AGM-TEAM-END -->', '<!-- Team content omitted from public source snapshot. -->')
        $content = [regex]::Replace($content, '(?i)[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}', 'contact@example.invalid')
        $content = [regex]::Replace($content, '(?<!\d)(?:\+7|8)[\s(.-]*\d{3}[\s).-]*\d{3}[\s.-]*\d{2}[\s.-]*\d{2}(?!\d)', '+70000000000')
        $content = [regex]::Replace($content, 'https?://(?:wa\.me|t\.me|api\.whatsapp\.com|max\.ru)/[^\s''"<>]+', 'https://example.invalid/contact-disabled')
        $destination = Join-Path $outputRoot $relative
        [IO.Directory]::CreateDirectory((Split-Path $destination)) | Out-Null
        [IO.File]::WriteAllText($destination, $content.Replace("`r`n","`n"), [Text.UTF8Encoding]::new($false))
        $manifest += [pscustomobject]@{ path = "src/$relative"; sha256 = (Get-FileHash $destination -Algorithm SHA256).Hash.ToLower(); sanitised = $true }
    }
}
$manifest | ConvertTo-Json -Depth 3 | Set-Content -Encoding utf8 (Join-Path $root 'docs/source-manifest.json')
$excluded | ConvertTo-Json | Set-Content -Encoding utf8 (Join-Path $root 'docs/source-exclusions.json')
Write-Output "Prepared $($manifest.Count) text files; excluded $($excluded.Count) review-copy files. Media were excluded during extraction. Manual review is required before publication."
