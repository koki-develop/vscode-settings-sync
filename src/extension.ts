import * as vscode from "vscode";
import { registerCommand } from "./lib/vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "settings-sync" is now active!');

  registerCommand(context, "helloWorld", () => {
    vscode.window.showInformationMessage("Hello World from settings-sync!");
  });
}

export function deactivate() {}
