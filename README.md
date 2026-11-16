# Metrix.Bar dashboards

[简体中文](README.zh-CN.md) · English

My dashboards for [Metrix.Bar](https://metrix.bar/), the menu bar and system tray dashboard app. This repository is also a Metrix.Bar registry, so dashboards installed from it get updates.

## Dashboards

| Dashboard         | Use it to                                                                                               | File                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| [Magpie](magpie/) | Control [magpie](https://github.com/yetone/magpie) on this computer or elsewhere: agents, models, and allowances. | [`magpie/magpie.bar`](magpie/magpie.bar) |

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

Control magpie on this computer or another machine from your menu bar: switch agents' models, connect agents, and watch allowances. See [magpie/README.md](magpie/README.md) for screenshots, setup and settings.

## Add or update a dashboard

Each dashboard lives in a directory named after its `id`. Raise its `version` whenever its bytes change, check it with the Metrix.Bar local API (`/v0/validate` and `/v0/check`), then rebuild `index.json` with the official builder:

```sh
curl -fsS https://metrix.bar/dashboards/build.js -o /tmp/build.js
node /tmp/build.js --input . --output "$(mktemp -d)/out" --id thedavidweng --name "David Weng's Dashboards"
```

Copy the generated `index.json` to the repository root. CI runs Magpie’s tests and checks that the committed index is current. To run the language, widget, and account-masking tests locally, use `node --test tests/magpie.test.mjs`.

## License

[AGPL-3.0-only](LICENSE)
