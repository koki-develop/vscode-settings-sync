import * as fs from "node:fs";
import * as path from "node:path";
import type * as vscode from "vscode";
import { sh } from "./util";
import {
  ask,
  getExtensionSettings,
  getSourceRepositoryPath,
  listExtensions,
  readGitHubToken,
  readSettingsJson,
  writeGitHubToken,
  writeSettingsJson,
} from "./vscode";

export const downloadSettings = async (context: vscode.ExtensionContext) => {
  const sourceRepository = await _loadSourceRepository();
  const sourceRepositoryPath = getSourceRepositoryPath(context);
  const githubToken = await _loadGitHubToken(context);

  await _prepareSourceRepository({
    path: sourceRepositoryPath,
    githubToken,
    repository: sourceRepository,
  });

  const settingsJson = fs.readFileSync(
    path.join(sourceRepositoryPath, "settings.json"),
    "utf8",
  );
  await writeSettingsJson(context, settingsJson);
};

export const uploadSettings = async (context: vscode.ExtensionContext) => {
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

  sh(`git commit -m "Save Settings"`, { cwd: sourceRepositoryPath });
  sh("git push origin main --force", { cwd: sourceRepositoryPath });
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
