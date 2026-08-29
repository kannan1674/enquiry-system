#!/usr/bin/env node
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const [, , command, ...args] = process.argv;

if (!command) {
  console.error('Usage: node scripts/run-next.js <command> [args...]');
  process.exit(1);
}

const resolveRealPath = directory => {
  if (fs.realpathSync.native) {
    return fs.realpathSync.native(directory);
  }

  return fs.realpathSync(directory);
};

const projectRoot = resolveRealPath(path.join(__dirname, '..'));

const resolveNextInvocation = () => {
  const binaryName = process.platform === 'win32' ? 'next.cmd' : 'next';
  const binaryPath = path.join(projectRoot, 'node_modules', '.bin', binaryName);
  const cliScriptPath = path.join(projectRoot, 'node_modules', 'next', 'dist', 'bin', 'next');

  // On Windows, spawning the generated `.cmd` script can fail with EINVAL when
  // the project lives on a different drive than the shell the user is running
  // the command from. Falling back to the underlying Node CLI avoids that.
  if (process.platform === 'win32' && fs.existsSync(cliScriptPath)) {
    return {
      command: process.execPath,
      args: [cliScriptPath],
      displayPath: cliScriptPath,
    };
  }

  if (fs.existsSync(binaryPath)) {
    return {
      command: binaryPath,
      args: [],
      displayPath: binaryPath,
    };
  }

  if (fs.existsSync(cliScriptPath)) {
    return {
      command: process.execPath,
      args: [cliScriptPath],
      displayPath: cliScriptPath,
    };
  }

  return {
    command: binaryPath,
    args: [],
    displayPath: binaryPath,
  };
};

const { command: nextCommand, args: nextArgs, displayPath } = resolveNextInvocation();

if (!fs.existsSync(displayPath)) {
  console.error(
    `Unable to locate the Next.js CLI at ${displayPath}. Have you run \`npm install\`?`,
  );
  process.exit(1);
}

// Ensure all process variables use the same casing for the project root.
// On Windows the shell the user runs `npm run dev` from might have a different
// casing (e.g. `fancyparivahan_web`) than the canonical path on disk
// (`FancyParivahan_Web`). Webpack treats those as two different module roots
// which results in the "multiple modules with names that only differ in
// casing" warning and ultimately a blank screen during development.
const ensureConsistentCasing = () => {
  const cwd = process.cwd();

  if (cwd && cwd.toLowerCase() === projectRoot.toLowerCase() && cwd !== projectRoot) {
    // `process.chdir` updates `process.cwd()` for the current process, but some
    // tooling (Next.js/webpack) relies on environment variables such as PWD and
    // INIT_CWD. Keeping those in sync prevents them from observing both path
    // variants.
    process.chdir(projectRoot);
  }

  // Always normalise the environment variables so every child process observes
  // the canonical path casing, regardless of how the command was invoked.
  process.env.PWD = projectRoot;
  process.env.INIT_CWD = projectRoot;
};

ensureConsistentCasing();

const child = spawn(nextCommand, [...nextArgs, command, ...args], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', code => {
  process.exit(code ?? 0);
});

child.on('error', error => {
  console.error('Failed to start Next.js command:', error);
  process.exit(1);
});

