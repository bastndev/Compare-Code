# Compare Code - Architecture

Compare Code is now a deprecation and migration shim. Its original comparison implementation has been integrated into [ATM](https://marketplace.visualstudio.com/items?itemName=bastndev.atm).

## Runtime flow

1. VS Code activates the extension after startup through `onStartupFinished`.
2. The extension checks whether `bastndev.atm` is installed.
3. If needed, it requests ATM installation through the VS Code extension API.
4. A warning guides the user to ATM and offers to open its Marketplace page.

The old comparison UI, commands, keybindings, and services are no longer part of this extension.
