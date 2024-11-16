import { execSync, type ExecOptions } from "node:child_process";

export const sh = (command: string, options: ExecOptions) => {
  execSync(command, options);
};
