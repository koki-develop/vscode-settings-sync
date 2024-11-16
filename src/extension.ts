import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "settings-sync" is now active!');

  const disposable = vscode.commands.registerCommand(
    "settings-sync.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from settings-sync!");
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
