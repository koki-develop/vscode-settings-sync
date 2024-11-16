import * as vscode from "vscode";

export const registerCommand = (
  context: vscode.ExtensionContext,
  command: string,
  callback: () => void,
) => {
  const id = `settings-sync.${command}`;
  const disposable = vscode.commands.registerCommand(id, callback);
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
