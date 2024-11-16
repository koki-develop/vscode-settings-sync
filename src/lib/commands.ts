import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";
import { sh } from "./util";
import {
  ask,
  getExtensionSettings,
  getSourceRepositoryPath,
  installExtension,
  listExtensions,
  readGitHubToken,
  readSettingsJson,
  uninstallExtension,
  writeGitHubToken,
  writeSettingsJson,
} from "./vscode";

export const downloadSettings = async (context: vscode.ExtensionContext) => {
  await vscode.window
    .withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Downloading Settings",
      },
      async (progress) => {
        progress.report({ message: "Preparing..." });

        const sourceRepository = await _loadSourceRepository();
        const sourceRepositoryPath = getSourceRepositoryPath(context);
        const githubToken = await _loadGitHubToken(context);

        await _prepareSourceRepository({
          path: sourceRepositoryPath,
          githubToken,
          repository: sourceRepository,
        });

        progress.report({ message: "Loading settings.json..." });

        const settingsJson = fs.readFileSync(
          path.join(sourceRepositoryPath, "settings.json"),
          "utf8",
        );
        await writeSettingsJson(context, settingsJson);

        progress.report({ message: "Loading extensions.json..." });

        const extensionsJson = fs.readFileSync(
          path.join(sourceRepositoryPath, "extensions.json"),
          "utf8",
        );
        const extensionIdsToInstall = JSON.parse(extensionsJson);
        const installedExtensionIds = listExtensions().map(
          (extension) => extension.id,
        );

        // install extensions
        for (const extensionId of extensionIdsToInstall) {
          if (installedExtensionIds.includes(extensionId)) {
            continue;
          }
          progress.report({ message: `Installing ${extensionId}...` });
          await installExtension(extensionId);
        }

        // uninstall extensions
        for (const extensionId of installedExtensionIds) {
          if (extensionIdsToInstall.includes(extensionId)) {
            continue;
          }
          progress.report({ message: `Uninstalling ${extensionId}...` });
          await uninstallExtension(extensionId);
        }
      },
    )
    .then(() => {
      vscode.window.showInformationMessage("Settings downloaded successfully!");
    });
};

export const uploadSettings = async (context: vscode.ExtensionContext) => {
  await vscode.window
    .withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Uploading Settings",
      },
      async (progress) => {
        progress.report({ message: "Preparing..." });

        const sourceRepository = await _loadSourceRepository();
        const sourceRepositoryPath = getSourceRepositoryPath(context);
        const githubToken = await _loadGitHubToken(context);

        await _prepareSourceRepository({
          path: sourceRepositoryPath,
          githubToken,
          repository: sourceRepository,
        });

        const settingsJson = await readSettingsJson(context);
        fs.writeFileSync(
          path.join(sourceRepositoryPath, "settings.json"),
          settingsJson,
        );
        sh("git add settings.json", { cwd: sourceRepositoryPath });

        const extensionIds = listExtensions().map((extension) => extension.id);
        const extensionsJson = JSON.stringify(extensionIds, null, 2);
        fs.writeFileSync(
          path.join(sourceRepositoryPath, "extensions.json"),
          extensionsJson,
        );
        sh("git add extensions.json", { cwd: sourceRepositoryPath });

        progress.report({ message: "Uploading to GitHub..." });

        sh(`git commit -m "Save Settings"`, { cwd: sourceRepositoryPath });
        sh("git push origin main --force", { cwd: sourceRepositoryPath });
      },
    )
    .then(() => {
      vscode.window.showInformationMessage("Settings uploaded successfully!");
    });
};

const _loadSourceRepository = async () => {
  const extensionSettings = await getExtensionSettings();
  const sourceRepository = extensionSettings.get<string>("sourceRepository");
  if (!sourceRepository) {
    throw new Error("sync.sourceRepository is not set");
  }
  return sourceRepository;
};

const _loadGitHubToken = async (context: vscode.ExtensionContext) => {
  const token = await readGitHubToken(context);
  if (token !== "") {
    return token;
  }
  const newToken = await ask("GitHub Personal Access Token");
  if (newToken === "") {
    throw new Error("GitHub Personal Access Token is not set");
  }

  await writeGitHubToken(context, newToken);
  return newToken;
};

const _recreateDirectory = async (path: string) => {
  if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
  }
  fs.mkdirSync(path, { recursive: true });
};

const _prepareSourceRepository = async (params: {
  path: string;
  githubToken: string;
  repository: string;
}) => {
  await _recreateDirectory(params.path);
  sh("git init -b main", { cwd: params.path });
  sh(
    `git remote add origin https://${params.githubToken}@github.com/${params.repository}`,
    {
      cwd: params.path,
    },
  );
  sh("git pull origin main --depth 1", { cwd: params.path });
};
