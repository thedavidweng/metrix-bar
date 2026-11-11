# Metrix.Bar dashboards

[简体中文](README.zh-CN.md) · English

My dashboards for [Metrix.Bar](https://metrix.bar/), the menu bar and system tray dashboard app. This repository is also a Metrix.Bar registry, so dashboards installed from it get updates.

## Dashboards

| Dashboard | Use it to | Install |
| --- | --- | --- |
| [Magpie](#magpie) | Control a [magpie](https://github.com/yetone/magpie) running elsewhere: agents, models, and allowances. | [`magpie/magpie.bar`](magpie/magpie.bar) |

## Install

Add this registry in Metrix.Bar under **Settings → Registries**:

```text
https://raw.githubusercontent.com/thedavidweng/metrix-bar/main/index.json
```

Or open this link to add it:

```text
metrixbar://registry/add?url=https%3A%2F%2Fraw.githubusercontent.com%2Fthedavidweng%2Fmetrix-bar%2Fmain%2Findex.json
```

To install one dashboard and keep it linked to this registry's updates, open its install link, such as Magpie's:

```text
metrixbar://install/magpie?registry_url=https%3A%2F%2Fraw.githubusercontent.com%2Fthedavidweng%2Fmetrix-bar%2Fmain%2Findex.json
```

You can also import a `.bar` file directly. A direct import does not receive updates.

## Magpie

[`magpie/magpie.bar`](magpie/magpie.bar) controls a magpie that runs somewhere else, such as on a server, from your menu bar. It talks to magpie's web API the same way magpie's own page does.

- Switch each agent's model and reasoning effort, and connect or disconnect agents.
- See allowances grouped by provider, with a ring for each window and when it resets.
- The menu bar shows the first allowance's windows, such as `100% · 86%`, used or left as magpie is set to show them.
- Follows magpie's language (English or Simplified Chinese) and its Hide accounts privacy setting. Both can be changed in the dashboard's settings.

To set it up:

1. Open magpie's web page from the link it prints (magpie web, or Settings › Network and sharing › Browser access in the app). It looks like `http://HOST:PORT/?k=KEY`.
2. In the dashboard's settings, put `http://HOST:PORT` into **Magpie URL** and `KEY` into **Web Key**.

The key grants full control of that magpie, so keep it private. Metrix.Bar stores it in the system keychain.

## Add or update a dashboard

Each dashboard lives in a directory named after its `id`. Raise its `version` whenever its bytes change, check it with the Metrix.Bar local API (`/v0/validate` and `/v0/check`), then rebuild `index.json` with the official builder:

```sh
curl -fsS https://metrix.bar/dashboards/build.js -o /tmp/build.js
node /tmp/build.js --input . --output "$(mktemp -d)/out" --id thedavidweng --name "David Weng's Dashboards"
```

Copy the generated `index.json` to the repository root. CI rebuilds it and fails when the committed one is out of date.

## License

[AGPL-3.0-only](LICENSE)
