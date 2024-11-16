import type * as vscode from "vscode";
import { registerCommand } from "./lib/vscode";
import { downloadSettings } from "./lib/commands";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "settings-sync" is now active!');

  registerCommand(context, "downloadSettings", async (context) => {
    await downloadSettings(context);
  });
}

export function deactivate() {}
