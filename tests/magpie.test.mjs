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
