import * as fs from "node:fs";
import * as path from "node:path";
import type * as vscode from "vscode";
import { sh } from "./util";
import {
  askGitHubToken,
  getExtensionSettings,
  getSourceRepositoryPath,
  readGitHubToken,
  readSettings,
  writeGitHubToken,
  writeSettings,
} from "./vscode";

export const downloadSettings = async (context: vscode.ExtensionContext) => {
  const extensionSettings = await getExtensionSettings();
  const sourceRepository = extensionSettings.get("sourceRepository");
  if (!sourceRepository) {
    throw new Error("sync.sourceRepository is not set");
  }

  const githubToken = await (async () => {
    const token = await readGitHubToken(context);
    if (token !== "") {
      return token;
    }
    const newToken = await askGitHubToken();
    await writeGitHubToken(context, newToken);
    return newToken;
  })();

  const sourceRepositoryPath = getSourceRepositoryPath(context);
  if (!fs.existsSync(sourceRepositoryPath)) {
    fs.mkdirSync(sourceRepositoryPath, { recursive: true });
    sh("git init", { cwd: sourceRepositoryPath });
  } else {
    sh("git remote remove origin", { cwd: sourceRepositoryPath });
  }
  sh(
    `git remote add origin https://${githubToken}@github.com/${sourceRepository}`,
    {
      cwd: sourceRepositoryPath,
    },
  );
  sh("git fetch origin", { cwd: sourceRepositoryPath });
  sh("git reset --hard origin/main", { cwd: sourceRepositoryPath });

  const settingsJson = fs.readFileSync(
    path.join(sourceRepositoryPath, "settings.json"),
    "utf8",
  );

  await writeSettings(context, JSON.parse(settingsJson));
};

export const uploadSettings = async (context: vscode.ExtensionContext) => {
  const extensionSettings = await getExtensionSettings();
  const sourceRepository = extensionSettings.get("sourceRepository");
  if (!sourceRepository) {
    throw new Error("sync.sourceRepository is not set");
  }

  const githubToken = await (async () => {
    const token = await readGitHubToken(context);
    if (token !== "") {
      return token;
    }
    const newToken = await askGitHubToken();
    await writeGitHubToken(context, newToken);
    return newToken;
  })();

  const sourceRepositoryPath = getSourceRepositoryPath(context);
  if (fs.existsSync(sourceRepositoryPath)) {
    fs.rmSync(sourceRepositoryPath, { recursive: true, force: true });
  }
  fs.mkdirSync(sourceRepositoryPath, { recursive: true });
  sh("git init", { cwd: sourceRepositoryPath });
  sh(
    `git remote add origin https://${githubToken}@github.com/${sourceRepository}`,
    {
      cwd: sourceRepositoryPath,
    },
  );

  const settingsJson = await readSettings(context);
  fs.writeFileSync(
    path.join(sourceRepositoryPath, "settings.json"),
    settingsJson,
  );
  sh("git add settings.json", { cwd: sourceRepositoryPath });
  sh(`git commit -m "Update Settings"`, { cwd: sourceRepositoryPath });
  sh("git push origin main --force", { cwd: sourceRepositoryPath });
};
