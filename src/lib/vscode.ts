import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";

export const registerCommand = (
  context: vscode.ExtensionContext,
  command: string,
  callback: (context: vscode.ExtensionContext) => void,
) => {
  const id = `settings-sync.${command}`;
  const disposable = vscode.commands.registerCommand(id, () =>
    callback(context),
  );
  context.subscriptions.push(disposable);
};

export const installExtension = async (id: string) => {
  await vscode.commands.executeCommand(
    "workbench.extensions.installExtension",
    id,
  );
};

export const uninstallExtension = async (id: string) => {
  await vscode.commands.executeCommand(
    "workbench.extensions.uninstallExtension",
    id,
  );
};

export const writeSettings = async (
  context: vscode.ExtensionContext,
  settingsJson: string,
) => {
  const settingsPath = _getSettingsPath(context);
  fs.writeFileSync(settingsPath, settingsJson);
};

const _getPath = (context: vscode.ExtensionContext) => {
  return path.resolve(context.globalStorageUri.path, "../../..");
};

const _getUserPath = (context: vscode.ExtensionContext) => {
  return path.join(_getPath(context), "User");
};

const _getSettingsPath = (context: vscode.ExtensionContext) => {
  return path.join(_getUserPath(context), "settings.json");
};
