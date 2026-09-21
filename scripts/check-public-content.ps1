$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$issues = @()
$files = @(Get-ChildItem -LiteralPath (Join-Path $root 'src') -Recurse -File)
foreach ($file in $files) {
    $relative = $file.FullName.Substring($root.Length + 1)
    if ($file.Name -match '^wp-config\.php$|\.key$|\.pem$|\.pfx$|\.sql|\.log$|\.zip$|\.gz$') {
        $issues += "Forbidden file: $relative"
    }
    $content = [IO.File]::ReadAllText($file.FullName)
    $patterns = @(
        '-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY',
        'AIza[0-9A-Za-z_-]{30,}',
        'ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}',
        'https://script\.google\.com/macros/s/[A-Za-z0-9_-]+',
        '\$phpmailer->(?:Password|Username)\s*=\s*''[^'']+''',
        '(?:[А-ЯЁ][а-яё]+ ){2}[А-ЯЁ][а-яё]+(?:вич|вна|ична)'
    )
    foreach ($pattern in $patterns) {
        if ($content -cmatch $pattern) { $issues += "Review required: $relative"; break }
    }
    foreach ($match in [regex]::Matches($content, '(?i)[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}')) {
        if ($match.Value -ne 'contact@example.invalid') { $issues += "Contact requires review: $relative"; break }
    }
}
if ($issues.Count) { $issues | Sort-Object -Unique | Write-Output; throw 'Public-content check failed; no sensitive matching text was printed.' }
Write-Output "Known-pattern check passed for $($files.Count) source files. Manual review is still required."
