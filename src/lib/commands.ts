import type * as vscode from "vscode";
import * as path from "node:path";
import * as fs from "node:fs";
import {
  askGitHubToken,
  getSettings,
  getSourceRepositoryPath,
  readGitHubToken,
  writeGitHubToken,
  writeSettings,
} from "./vscode";
import { sh } from "./util";

export const downloadSettings = async (context: vscode.ExtensionContext) => {
  const settings = await getSettings();
  const sourceRepository = settings.get("sourceRepository");
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
