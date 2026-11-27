# Changelog

All notable changes to this project are documented in this file.

## [1.3.0] - 2026-11-26

### Added
- **Notch support (`notch="true"`)**: Displays the Magpie icon and primary quota percentage in the compact notch wings, and expands to show allowance cards, wired agents, and today's usage.
- **Tray model-switching submenus**: Right-clicking the menu bar icon now lists connected (wired) agents with grouped model submenus (`tray.menu`) and a `CmdOrCtrl+R` shortcut for Refresh.
- **Quota alerts (`notifyAlerts`)**: Sends desktop notifications when a tracked allowance drops below 10% left (once per reset cycle) or resets; clicking a notification refreshes the dashboard.
- **Adaptive polling & output demand**: Uses `$metrix.schedule()` to poll every 30s when a tracked allowance is within 5 minutes of resetting (and 60s on errors), and `$metrix.outputs()` to build only enabled surfaces (`panel`, `widget` families, `notch`).
- **Custom ordering & Magpie `usageOrder` sync**: Allowances now follow Magpie's `settings.usageOrder` by default; both quota cards and agent rows support right-click reordering (`Pin to top`, `Move up`, `Move down`, `Reset order`) persisted in `localStorage`.
- **Per-card, per-window, and per-agent hiding**: Right-click any quota card or agent row to hide the entire card, individual quota windows (e.g. `5 hour`, `7 day`), or individual agents from the overview, with a collapsible hidden-items bar and `Restore all` action.
- **Expanded configuration options**:
  - `agentFilter`: Filter agents by `All`, `Connected only`, or `Installed only`.
  - `tray` (`Today's usage` mode): Show today's spend directly in the menu bar alongside `Allowance` and `Icon only`.
  - `notchSections` & `notchCards`: Control whether Notch follows panel toggles or independently shows `Allowances only`, `Agents only`, `Today's usage only`, or `Everything`, and cap visible Notch allowance cards (`2` / `4` / `6`).

### Improved
- **Settings & docs clarity + i18n**: Simplified `<inputs>` labels/descriptions and localized `<docs>` setup instructions across English, Simplified Chinese, Traditional Chinese, Japanese, Korean, and German.
- **Notch compact spacing**: Added outer horizontal padding (`8 DIP`) to Notch compact wings so the icon and percentage sit cleanly inside the rounded edges.
- **Error formatting**: Extract `data.error.message` when Magpie returns structured error objects instead of displaying `[object Object]`.

## [1.2.0] - 2026-11-16

### Added
- Support connecting to local Magpie via `~/.config/magpie/web-page.json` in addition to remote Magpie URLs.
- System widgets (`small`, `medium`, `large`) with read-only allowance rings.
- Multi-language support (`en`, `zh`, `zh-TW`, `ja`, `ko`, `de`) and account masking.
