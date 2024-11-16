import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";

export const registerCommand = (
  context: vscode.ExtensionContext,
  command: string,
  callback: (context: vscode.ExtensionContext) => Promise<void>,
) => {
  const id = `settings-sync.${command}`;
  const disposable = vscode.commands.registerCommand(
    id,
    async () =>
      await callback(context).catch((error) => {
        vscode.window.showErrorMessage(error.message);
      }),
  );
  context.subscriptions.push(disposable);
};

export const getExtensionSettings = async () => {
  return vscode.workspace.getConfiguration("sync");
};

export const prepareDataPath = (context: vscode.ExtensionContext) => {
  const dataPath = _getDataPath(context);
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
  }
};

const _getDataPath = (context: vscode.ExtensionContext) => {
  return path.join(context.extensionUri.path, "data");
};

/*
 * extensions
 */

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

/*
 * settings.json
 */

export const readSettingsJson = async (context: vscode.ExtensionContext) => {
  const settingsPath = _getSettingsJsonPath(context);
  return fs.readFileSync(settingsPath, "utf8");
};

export const writeSettingsJson = async (
  context: vscode.ExtensionContext,
  settingsJson: string,
) => {
  const settingsPath = _getSettingsJsonPath(context);
  fs.writeFileSync(settingsPath, settingsJson);
};

const _getPath = (context: vscode.ExtensionContext) => {
  return path.resolve(context.globalStorageUri.path, "../../..");
};

const _getSettingsJsonPath = (context: vscode.ExtensionContext) => {
  return path.join(_getPath(context), "User", "settings.json");
};

/*
 * source repository
 */

export const getSourceRepositoryPath = (context: vscode.ExtensionContext) => {
  return path.join(_getDataPath(context), "source-repository");
};

/*
 * github token
 */

export const writeGitHubToken = async (
  context: vscode.ExtensionContext,
  pat: string,
) => {
  const gitHubTokenPath = _getGitHubTokenPath(context);
  fs.writeFileSync(gitHubTokenPath, pat);
};

export const readGitHubToken = async (context: vscode.ExtensionContext) => {
  const gitHubTokenPath = _getGitHubTokenPath(context);
  if (!fs.existsSync(gitHubTokenPath)) {
    return "";
  }
  return fs.readFileSync(gitHubTokenPath, "utf8");
};

const _getGitHubTokenPath = (context: vscode.ExtensionContext) => {
  return path.join(_getDataPath(context), "github-token");
};

/*
 * utilities
 */

export const ask = async (prompt: string) => {
  const input = await vscode.window.showInputBox({
    prompt,
    password: true,
  });
  return input ?? "";
};
