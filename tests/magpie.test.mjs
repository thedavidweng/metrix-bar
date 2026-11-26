import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const bar = await readFile(new URL('../magpie/magpie.bar', import.meta.url), 'utf8');
const script = bar.match(/<script\b[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/script>/)[1]
  .replace('export default {', 'globalThis.dashboard = {');

function worker({ appLanguage = 'system', systemLanguage = 'en-US', left = false, windowName = '5 hour', platform = 'darwin' } = {}) {
  const state = { settings: { lang: appLanguage, quotaLeft: left, trayUsages: ['provider|person@example.test'] }, agents: [] };
  const quotas = [{ provider: 'provider', name: 'Provider', user: 'person@example.test', alias: 'A+B', windows: [
    { name: windowName, used: 40, resetsAt: '2030-01-01T12:00:00Z' },
    { name: '7 day', used: 90, resetsAt: '2030-01-07T12:00:00Z' },
  ] }];
  const context = vm.createContext({
    URL, navigator: { language: systemLanguage },
    $metrix: { platform, secret: () => 'test-key', invalidate() {} },
    fetch: async url => ({ ok: true, status: 200, text: async () => JSON.stringify(url.endsWith('/state') ? state : quotas) }),
  });
  vm.runInContext(script, context);
  return { dashboard: context.dashboard, context };
}

const inputs = { source: 'remote', host: 'http://magpie.test', hideAccounts: 'on' };

for (const [language, section] of [['en', 'AGENTS'], ['zh', 'Agent'], ['zh-TW', 'Agent'], ['ja', 'エージェント'], ['ko', '에이전트'], ['de', 'AGENTEN']]) {
  test(`renders ${language} and preserves quota values`, async () => {
    const { dashboard } = worker();
    const env = { inputs: { ...inputs, lang: language } };
    await dashboard.scheduled(env);
    const view = dashboard.render(env);
    assert.match(JSON.stringify(view.panel), new RegExp(section));
    assert.equal(view.tray.title, '40% · 90%');
    assert.ok(view.widget.small && view.widget.medium && view.widget.large);
  });
}

test('follows magpie language and resolves system language tags', async () => {
  for (const [appLanguage, systemLanguage, expected] of [['zh-TW', 'en-US', 'zh-TW'], ['ja', 'en-US', 'ja'], ['system', 'zh-Hant-HK', 'zh-TW'], ['system', 'ko-KR', 'ko']]) {
    const { dashboard, context } = worker({ appLanguage, systemLanguage });
    const env = { inputs };
    await dashboard.scheduled(env);
    dashboard.render(env);
    assert.equal(vm.runInContext("lang", context), expected, `${appLanguage} / ${systemLanguage}`);
  }
});

test('widget uses remaining quota and never includes account names', async () => {
  const { dashboard } = worker({ left: true, windowName: 'person@example.test' });
  const env = { inputs: { ...inputs, hideAccounts: 'off' } };
  await dashboard.scheduled(env);
  const view = dashboard.render(env);
  const widget = JSON.stringify(view.widget);
  assert.match(widget, /60% left/);
  assert.doesNotMatch(widget, /person@example\.test|A\+B|test-key/);
});

test('account names with regular-expression characters are masked', async () => {
  const { dashboard, context } = worker();
  await dashboard.scheduled({ inputs });
  assert.equal(vm.runInContext('hideIn("A+B", "provider")', context), '•••');
  assert.equal(vm.runInContext('hideIn("AXXB", "provider")', context), 'AXXB');
});

// Widget trees have a smaller, read-only component and property set than panels.
test('widget trees use the portable read-only component subset', async () => {
  const allowed = {
    Column: ['gap', 'alignItems'], Row: ['gap', 'alignItems'], Grid: ['columns', 'gap'],
    Text: ['fontSize', 'fontWeight', 'color', 'maxLines'], Icon: ['svg', 'size'],
    Chart: ['type', 'width', 'height', 'innerRadius', 'data'], Spacer: [],
  };
  for (const platform of ['darwin', 'windows', 'linux']) {
    const { dashboard } = worker({ platform });
    const env = { inputs };
    await dashboard.scheduled(env);
    const { widget } = dashboard.render(env);
    const check = node => {
      if (typeof node === 'string') return;
      assert.ok(Object.hasOwn(allowed, node.type), node.type);
      for (const prop of Object.keys(node.props)) assert.ok(allowed[node.type].includes(prop), `${node.type}.${prop}`);
    for (const child of node.children) check(child);
    };
    Object.values(widget).forEach(check);
  }
});

test('tray menu includes wired agent model submenus and respects outputs/notch', async () => {
  const wiredAgents = [{
    id: 'codex', name: 'Codex', wired: true,
    fields: [{ key: 'model', value: 'gpt-5', options: [{ value: 'gpt-5', label: 'GPT-5' }, { value: 'o3', label: 'o3' }] }],
  }];
  const state = { settings: { lang: 'en', quotaLeft: false, trayUsages: ['provider|person@example.test'] }, agents: wiredAgents };
  const quotas = [{ provider: 'provider', name: 'Provider', user: 'person@example.test', windows: [
    { name: '5 hour', used: 40, resetsAt: new Date(Date.now() + 120000).toISOString() },
  ] }];
  const schedules = [];
  const context = vm.createContext({
    URL, navigator: { language: 'en-US' },
    $metrix: {
      platform: 'darwin',
      secret: () => 'test-key',
      invalidate() {},
      caniuse: async cap => cap === 'render.notch',
      outputs: () => ({ tray: true, panel: false, notch: 'compact', widget: { known: true, families: ['small'] } }),
      schedule: ms => schedules.push(ms),
    },
    fetch: async url => ({ ok: true, status: 200, text: async () => JSON.stringify(url.endsWith('/state') ? state : quotas) }),
  });
  vm.runInContext(script, context);
  const env = { inputs: { ...inputs, lang: 'en' } };
  await context.dashboard.scheduled(env);
  const view = context.dashboard.render(env);
  assert.ok(view.tray.menu.some(item => item.label && item.label.startsWith('Codex') && Array.isArray(item.items) && item.items.length === 2));
  assert.equal(view.panel, undefined);
  assert.deepEqual(Object.keys(view.widget), ['small']);
  assert.ok(view.notch && view.notch.compact && view.notch.expanded);
  assert.equal(schedules.at(-1), 30000);
});

test('allowances follow magpie usageOrder and support context-menu reordering', async () => {
  const store = new Map();
  const state = { settings: { lang: 'en', usageOrder: ['codex', 'openrouter'] }, agents: [] };
  const quotas = [
    { provider: 'openrouter', name: 'OpenRouter', balance: '$10.00', windows: [] },
    { provider: 'codex', name: 'Codex', user: 'a@b.test', windows: [{ name: '5 hour', used: 20 }] },
  ];
  const context = vm.createContext({
    URL, navigator: { language: 'en-US' },
    localStorage: {
      getItem: k => store.get(k) ?? null,
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: k => store.delete(k),
    },
    $metrix: { platform: 'darwin', secret: () => 'test-key', invalidate() {} },
    fetch: async url => ({ ok: true, status: 200, text: async () => JSON.stringify(url.endsWith('/state') ? state : quotas) }),
  });
  vm.runInContext(script, context);
  const env = { inputs: { ...inputs, lang: 'en' } };
  await context.dashboard.scheduled(env);
  const ordered = Array.from(vm.runInContext('orderedQuotasList(quotas).map(q => q.provider)', context));
  assert.deepEqual(ordered, ['codex', 'openrouter']);
  const view = context.dashboard.render(env);
  const serialized = JSON.stringify(view.panel);
  assert.match(serialized, /Pin to top/);
});

test('supports agents-only, usage-only, agentFilter, and notchSections modes', async () => {
  const state = {
    settings: { lang: 'en' },
    agents: [
      { id: 'codex', name: 'Codex', wired: true, fields: [] },
      { id: 'claude', name: 'Claude', wired: false, cliMissing: true, fields: [] },
    ],
  };
  const quotas = [{ provider: 'codex', name: 'Codex', windows: [{ name: '5 hour', used: 25 }] }];
  const usage = { calls: 12, input: 1000, output: 500, cost: 1.5 };
  const context = vm.createContext({
    URL, navigator: { language: 'en-US' },
    $metrix: {
      platform: 'darwin', secret: () => 'test-key', invalidate() {},
      caniuse: async cap => cap === 'render.notch',
      outputs: () => ({ tray: true, panel: true, notch: 'expanded', widget: { known: true, families: [] } }),
    },
    fetch: async url => ({
      ok: true, status: 200,
      text: async () => JSON.stringify(url.includes('/usage/quotas') ? quotas : url.includes('/usage?period=today') ? usage : state),
    }),
  });
  vm.runInContext(script, context);

  // Usage-only in tray, panel, and notch
  const usageEnv = { inputs: { ...inputs, lang: 'en', showAgents: false, showAllowances: false, showUsage: true, tray: 'usage', notchSections: 'usage' } };
  await context.dashboard.scheduled(usageEnv);
  const usageView = context.dashboard.render(usageEnv);
  assert.equal(usageView.tray.title, '$1.50');
  assert.match(JSON.stringify(usageView.panel), /USAGE TODAY/);
  assert.doesNotMatch(JSON.stringify(usageView.panel), /ALLOWANCES|AGENTS/);
  assert.match(JSON.stringify(usageView.notch.expanded), /USAGE TODAY/);

  // Agents-only with wired filter
  const agentsEnv = { inputs: { ...inputs, lang: 'en', showAgents: true, showAllowances: false, showUsage: false, agentFilter: 'wired', notchSections: 'agents' } };
  const agentsView = context.dashboard.render(agentsEnv);
  const agentsPanel = JSON.stringify(agentsView.panel);
  assert.match(agentsPanel, /Codex/);
  assert.doesNotMatch(agentsPanel, /Claude/);
  assert.match(JSON.stringify(agentsView.notch.expanded), /Codex/);
});

test('supports hiding individual quota cards, windows, and agents', async () => {
  const store = new Map();
  const state = { settings: { lang: 'en' }, agents: [{ id: 'codex', name: 'Codex', wired: true, fields: [] }] };
  const quotas = [
    { provider: 'factory', name: 'Factory', user: 'a@b.test', windows: [{ name: '5 hour', used: 10 }, { name: '7 day', used: 20 }] },
    { provider: 'codex', name: 'Codex', user: 'c@d.test', windows: [{ name: '5 hour', used: 30 }] },
  ];
  const context = vm.createContext({
    URL, navigator: { language: 'en-US' },
    localStorage: {
      getItem: k => store.get(k) ?? null,
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: k => store.delete(k),
    },
    $metrix: { platform: 'darwin', secret: () => 'test-key', invalidate() {} },
    fetch: async url => ({ ok: true, status: 200, text: async () => JSON.stringify(url.includes('/usage/quotas') ? quotas : state) }),
  });
  vm.runInContext(script, context);
  const env = { inputs: { ...inputs, lang: 'en' } };
  await context.dashboard.scheduled(env);
  vm.runInContext('toggleSetItem("magpie:hiddenCards", hiddenCards, "codex|c@d.test")', context);
  vm.runInContext('toggleSetItem("magpie:hiddenWindows", hiddenWindows, "factory|a@b.test||5 hour")', context);
  vm.runInContext('toggleSetItem("magpie:hiddenAgents", hiddenAgents, "codex")', context);
  const view = context.dashboard.render(env);
  const panelJson = JSON.stringify(view.panel);
  assert.match(panelJson, /Hide from overview/);
  assert.match(panelJson, /Show 5 hour/);
  assert.match(panelJson, /2 hidden/);
  assert.match(panelJson, /1 hidden/);
  assert.doesNotMatch(panelJson, /c@d\.test/);
});
