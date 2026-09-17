# opencode-plugin-keyring

> [!WARNING]
> It was tested only on macos but probably will work on other platforms supported by `@napi-rs/keyring`

A universal OpenCode plugin for dynamically load secrets from credential store.

Originally inspired by [opencode-plugin-keychain](https://github.com/TiansuYu/opencode-plugin-keychain/tree/main), but rewritten to use `@napi-rs/keyring` to access credential store.



## Usage

Add the plugin to your `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "opencode-plugin-keyring@latest"
  ]
}
```

Then for each secret you want to store add to your credential store entry named `opencode-plugin-keyring` with username of your choise. For purpose of example let it be `FOO_SECRET`

Then in config add where you want to use secret from credential store `"apiKey": "{keyring:FOO_SECRET}"`.
On startup, the plugin will load `FOO_SECRET` from credential store and set `apiKey` value to it.

