import { exec } from 'child_process';

export const generate = () =>
  new Promise((resolve, reject) => {
    const child = exec('npx graphql-codegen', (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });

    child.stdout?.pipe(process.stdout);
    child.stderr?.pipe(process.stderr);
  });
