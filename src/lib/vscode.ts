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

export const listExtensions = () => {
  return vscode.extensions.all.filter(
    (extension) => !extension.packageJSON.isBuiltin,
  );
};

export const writeSettings = async (
  context: vscode.ExtensionContext,
  settingsJson: string,
) => {
  const settingsPath = getSettingsPath(context);
  fs.writeFileSync(settingsPath, settingsJson);
};

export const getSettings = async () => {
  return vscode.workspace.getConfiguration("sync");
};

export const getPath = (context: vscode.ExtensionContext) => {
  return path.resolve(context.globalStorageUri.path, "../../..");
};

export const getUserPath = (context: vscode.ExtensionContext) => {
  return path.join(getPath(context), "User");
};

export const getSettingsPath = (context: vscode.ExtensionContext) => {
  return path.join(getUserPath(context), "settings.json");
};

export const getExtensionPath = (context: vscode.ExtensionContext) => {
  return context.extensionUri.path;
};

export const getGitHubTokenPath = (context: vscode.ExtensionContext) => {
  return path.join(getExtensionPath(context), "github-token");
};
