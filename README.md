# Metrix.Bar dashboards

[简体中文](README.zh-CN.md) · English

My dashboards for [Metrix.Bar](https://metrix.bar/), the menu bar and system tray dashboard app.

## Magpie

[`magpie/magpie.bar`](magpie/magpie.bar) controls a [magpie](https://github.com/yetone/magpie) that runs somewhere else, such as on a server, from your menu bar. It talks to magpie's web API the same way magpie's own page does.

- Switch each agent's model and reasoning effort, and connect or disconnect agents.
- See allowances grouped by provider, with a ring for each window and when it resets.
- The menu bar shows the first allowance's windows, such as `100% · 86%`, used or left as magpie is set to show them.
- Follows magpie's language (English or Simplified Chinese) and its Hide accounts privacy setting. Both can be changed in the dashboard's settings.

### Install

Open this link on a computer with Metrix.Bar:

```text
metrixbar://install?url=https://raw.githubusercontent.com/thedavidweng/metrix-bar-dashboards/main/magpie/magpie.bar&sha256=54696bec130e46afdade9f7bcecb6ba3d1a61dbc6c014890c1aadf356c0bbf82
```

Or download [`magpie.bar`](magpie/magpie.bar) and import it in Metrix.Bar.

### Set up

1. Open magpie's web page from the link it prints (magpie web, or Settings › Network and sharing › Browser access in the app). It looks like `http://HOST:PORT/?k=KEY`.
2. In the dashboard's settings, put `http://HOST:PORT` into **Magpie URL** and `KEY` into **Web Key**.

The key grants full control of that magpie, so keep it private. Metrix.Bar stores it in the system keychain.

## License

[AGPL-3.0-only](LICENSE)
