import { Entry } from "@napi-rs/keyring";
import type { Plugin, PluginOptions, Config } from "@opencode-ai/plugin"
import { OpencodeClient } from "@opencode-ai/sdk";

function deepSetVal(client: OpencodeClient, obj: any, secrets: Map<string, string | null>): void {
  if (Array.isArray(obj)) {
    obj.forEach((item, index, array) => {
      if (typeof item === "string") {
      const match = item.match(/^\{keyring:(\w+)\}$/)
      if (match) {
        if (secrets.has(match[1])) {
          array[index] = secrets.get(match[1])
        } else {
          const secret = loadFromKeychain(client, match[1])
          secrets.set(match[1], secret);

          array[index] = secrets.get(match[1])
        }
      }
    } else {
      deepSetVal(client, item, secrets)
    }
    });
    return;
  }

  for (const [key, childValue] of Object.entries(obj)) {
    if (typeof childValue === "string") {
      const match = childValue.match(/^\{keyring:(\w+)\}$/)
      if (match) {
        if (secrets.has(match[1])) {
          (obj as Record<string, unknown>)[key] = secrets.get(match[1])
        } else {
          const secret = loadFromKeychain(client, match[1])
          secrets.set(match[1], secret);

          (obj as Record<string, unknown>)[key] = secrets.get(match[1])
        }
      }
    } else {
      deepSetVal(client, childValue, secrets)
    }
  }
}

function loadFromKeychain(client: OpencodeClient, varName: string): string | null {
  try {
    client.app.log(
      {
        body:{
          level: "debug",
          message: `Loading "${varName}" from keyring`,
          service: "keyring-plugin"
        }
      }
    )
    const keychain = new Entry("opencode-plugin-keyring", varName);
    const result = keychain.getPassword();
    if (result == null) {
      client.app.log(
      {
        body:{
          level: "warn",
          message: `Cannot find "${varName}" in keyring`,
          service: "keyring-plugin"
        }
      })
    }
    return result == null ? result : result.trim()
  } catch {
    client.app.log(
      {
        body:{
          level: "warn",
          message: `Failed to find "${varName}" in keyring`,
          service: "keyring-plugin"
        }
      })
    return null
  }
}

export const KeyringPlugin: Plugin = async ({ client }, _options?: PluginOptions) => {
  await client.app.log({
    body: {
      level: "info",
      message: "Initalize keyring plugin",
      service: "keyring-plugin"
    }
  })

  return {
    config: async (input: Config) => {
      deepSetVal(client, input, new Map<string, string>())
    }
  }
}