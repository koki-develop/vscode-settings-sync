import type * as vscode from "vscode";
import { downloadSettings, uploadSettings } from "./lib/commands";
import { prepareDataPath, registerCommand } from "./lib/vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "settings-sync" is now active!');

  prepareDataPath(context);

  registerCommand(context, "downloadSettings", async (context) => {
    await downloadSettings(context);
  });

  registerCommand(context, "uploadSettings", async (context) => {
    await uploadSettings(context);
  });
}

export function deactivate() {}
