# Metrix.Bar 看板

简体中文 · [English](README.md)

我给 [Metrix.Bar](https://metrix.bar/)（菜单栏与系统托盘看板应用）写的看板。这个仓库本身也是一个 Metrix.Bar 看板源，从这里安装的看板可以收到更新。

## 看板

| 看板              | 用途                                                                             | 文件                                     |
| ----------------- | -------------------------------------------------------------------------------- | ---------------------------------------- |
| [Magpie](magpie/) | 控制部署在别处的 [magpie](https://github.com/yetone/magpie)：Agent、模型和额度。 | [`magpie/magpie.bar`](magpie/magpie.bar) |

## 安装

在 Metrix.Bar 的 **设置 → 看板源（Registries）** 里添加：

```text
https://raw.githubusercontent.com/thedavidweng/metrix-bar/main/index.json
```

也可以打开这个链接添加：

```text
metrixbar://registry/add?url=https%3A%2F%2Fraw.githubusercontent.com%2Fthedavidweng%2Fmetrix-bar%2Fmain%2Findex.json
```

想只装某个看板、并跟着这个源更新，就打开它的安装链接，比如 Magpie：

```text
metrixbar://install/magpie?registry_url=https%3A%2F%2Fraw.githubusercontent.com%2Fthedavidweng%2Fmetrix-bar%2Fmain%2Findex.json
```

也可以直接导入 `.bar` 文件，但直接导入的看板收不到更新。

## Magpie

在菜单栏里控制部署在另一台机器上的 magpie：切换 Agent 的模型、接入 Agent、查看额度。截图、配置和设置项见 [magpie/README.zh-CN.md](magpie/README.zh-CN.md)。

## 新增或更新看板

每个看板放在以它的 `id` 命名的目录里。文件内容一变就要提高 `version`，先用 Metrix.Bar 本地 API（`/v0/validate` 和 `/v0/check`）检查，再用官方构建脚本重新生成 `index.json`：

```sh
curl -fsS https://metrix.bar/dashboards/build.js -o /tmp/build.js
node /tmp/build.js --input . --output "$(mktemp -d)/out" --id thedavidweng --name "David Weng's Dashboards"
```

把生成的 `index.json` 复制到仓库根目录。CI 会重新生成它，已提交的版本过期时会失败。

## 许可证

[AGPL-3.0-only](LICENSE)
