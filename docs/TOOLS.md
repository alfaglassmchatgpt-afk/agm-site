# Инструменты GitHub

На исходном Windows-компьютере 2026-09-21 установлен официальный GitHub CLI 2.101.0 через WinGet. Хэш MSI проверен установщиком WinGet.

Команда установки на другом Windows-компьютере:

```powershell
winget install --id GitHub.cli --exact --source winget
gh auth login --hostname github.com --git-protocol https --web --skip-ssh-key
gh auth status
```

После установки нужен новый терминал для обновленного PATH. На исходном компьютере исполняемый файл: `C:\Program Files\GitHub CLI\gh.exe`.

Вход успешно выполнен в аккаунт alfaglassmchatgpt-afk, учетные данные хранятся в системном keyring и не входят в проект. Авторизация CLI независима от плагина GitHub и на другом компьютере выполняется заново.

Создание репозитория поддерживает `gh repo create OWNER/NAME --public` (либо `--private`). Новый репозиторий создаётся только по заданию владельца. Существующий проект: https://github.com/alfaglassmchatgpt-afk/agm-site.

Для настройки Git на авторизацию через CLI при необходимости: `gh auth setup-git --hostname github.com`.

Официальные инструкции: https://github.com/cli/cli/blob/trunk/docs/install_windows.md и https://cli.github.com/manual/gh_repo_create.
