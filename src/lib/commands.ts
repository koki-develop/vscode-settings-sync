import * as fs from "node:fs";
import * as path from "node:path";
import { simpleGit } from "simple-git";
import * as vscode from "vscode";
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
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Downloading Settings",
    },
    async (progress) => {
      progress.report({ message: "Preparing..." });

      const sourceRepository = await _loadSourceRepository();
      const sourceRepositoryPath = getSourceRepositoryPath(context);
      const githubToken = await _loadGitHubToken(context);

      await _recreateDirectory(sourceRepositoryPath);

      const git = simpleGit(sourceRepositoryPath);
      await git.init({ "--initial-branch": "main" });
      await git.addRemote(
        "origin",
        `https://${githubToken}@github.com/${sourceRepository}`,
      );
      await git.pull(["origin", "main", "--depth=1"]);

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

      vscode.window.showInformationMessage("Settings downloaded successfully!");
    },
  );
};

export const uploadSettings = async (context: vscode.ExtensionContext) => {
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Uploading Settings",
    },
    async (progress) => {
      progress.report({ message: "Preparing..." });

      const sourceRepository = await _loadSourceRepository();
      const sourceRepositoryPath = getSourceRepositoryPath(context);
      const githubToken = await _loadGitHubToken(context);

      await _recreateDirectory(sourceRepositoryPath);

      const git = simpleGit(sourceRepositoryPath);
      await git.init({ "--initial-branch": "main" });
      await git.addRemote(
        "origin",
        `https://${githubToken}@github.com/${sourceRepository}`,
      );
      await git.pull(["origin", "main", "--depth=1"]);

      const settingsJson = await readSettingsJson(context);
      fs.writeFileSync(
        path.join(sourceRepositoryPath, "settings.json"),
        settingsJson,
      );
      await git.add("settings.json");

      const extensionIds = listExtensions().map((extension) => extension.id);
      const extensionsJson = JSON.stringify(extensionIds, null, 2);
      fs.writeFileSync(
        path.join(sourceRepositoryPath, "extensions.json"),
        extensionsJson,
      );
      await git.add("extensions.json");

      try {
        await git.diff(["--cached", "--exit-code"]);
        vscode.window.showInformationMessage("No changes detected.");
        return;
      } catch {
        // Changes detected
      }

      progress.report({ message: "Uploading to GitHub..." });

      await git.commit("Save Settings");
      await git.push(["origin", "main", "--force"]);

      vscode.window.showInformationMessage("Settings uploaded successfully!");
    },
  );
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
