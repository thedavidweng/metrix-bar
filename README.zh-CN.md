# Metrix.Bar 看板

简体中文 · [English](README.md)

我给 [Metrix.Bar](https://metrix.bar/)（菜单栏与系统托盘看板应用）写的看板。

## Magpie

[`magpie/magpie.bar`](magpie/magpie.bar) 让你在菜单栏里控制部署在别处（比如服务器上）的 [magpie](https://github.com/yetone/magpie)。它和 magpie 自己的网页一样调用 magpie 的 Web API。

- 切换每个 Agent 的模型和推理强度，接入或断开 Agent。
- 按供应商查看额度，每个窗口一个圆环，并显示重置时间。
- 菜单栏显示第一项额度的各窗口，比如 `100% · 86%`，显示已用还是剩余跟随 magpie 的设置。
- 界面语言（English 或简体中文）和账号打码跟随 magpie 的设置，也可以在看板设置里单独修改。

### 安装

在装有 Metrix.Bar 的电脑上打开这个链接：

```text
metrixbar://install?url=https://raw.githubusercontent.com/thedavidweng/metrix-bar-dashboards/main/magpie/magpie.bar&sha256=54696bec130e46afdade9f7bcecb6ba3d1a61dbc6c014890c1aadf356c0bbf82
```

也可以下载 [`magpie.bar`](magpie/magpie.bar)，再在 Metrix.Bar 里导入。

### 配置

1. 用 magpie 打印的链接打开它的网页（magpie web，或 App 里的 设置 › 网络与共享 › 浏览器访问），链接形如 `http://HOST:PORT/?k=KEY`。
2. 在看板设置里，把 `http://HOST:PORT` 填进 **Magpie URL**，把 `KEY` 填进 **Web Key**。

这个 Key 能完全控制那台 magpie，请妥善保管。Metrix.Bar 会把它存在系统钥匙串里。

## 许可证

[AGPL-3.0-only](LICENSE)
