import { type ExecOptions, execSync } from "node:child_process";

export const sh = (command: string, options: ExecOptions) => {
  execSync(command, options);
};
