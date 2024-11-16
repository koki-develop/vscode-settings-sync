import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "vscode-extension-template" is now active!'
  );

  const disposable = vscode.commands.registerCommand(
    "vscode-extension-template.helloWorld",
    () => {
      vscode.window.showInformationMessage(
        "Hello World from vscode-extension-template!"
      );
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
