# Settings Sync

[![GitHub Release](https://img.shields.io/github/v/release/koki-develop/vscode-settings-sync)](https://github.com/koki-develop/vscode-settings-sync/releases/latest)
[![GitHub License](https://img.shields.io/github/license/koki-develop/vscode-settings-sync)](https://github.com/koki-develop/vscode-settings-sync/blob/main/LICENSE)

VSCode settings sync extension to manage settings on GitHub and synchronize across multiple environments.

## Installation

1. Download the `.vsix` from [GitHub Releases](https://github.com/koki-develop/vscode-settings-sync/releases/latest)
2. Install using the `code --install-extension`.

```console
$ code --install-extension /path/to/settings-sync-x.y.z.vsix
```

## Usage

### Setup

1. Create a GitHub repository to store your settings. (e.g. `koki-develop/vscode-settings`)
2. Set the repository in `sync.sourceRepository` in settings.json.

```json5
// settings.json
{
  "sync.sourceRepository": "koki-develop/vscode-settings"
}
```

### Upload Settings

Run `Sync: Upload Settings` from the command palette.  
You can also use `Alt + Shift + U`.

### Download Settings

Run `Sync: Download Settings` from the command palette.  
You can also use `Alt + Shift + D`.

## LICENSE

[MIT](https://github.com/koki-develop/vscode-settings-sync/blob/main/LICENSE)
