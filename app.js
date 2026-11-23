import { cases, demoEnd, locations, reasons, stages } from './demo-data.js';

const number = new Intl.NumberFormat('ru-RU');
const percentage = new Intl.NumberFormat('ru-RU', { style: 'percent', maximumFractionDigits: 1 });
const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const listLimit = 6;
const firstDay = cases.reduce((earliest, entry) => entry.date < earliest ? entry.date : earliest, demoEnd);
const stageOrder = new Map(stages.map(({ id }, index) => [id, index]));
const locationsById = new Map(locations.map(location => [location.id, location.label]));
const reasonsById = new Map(reasons.map(reason => [reason.id, reason]));
const stagesById = new Map(stages.map(stage => [stage.id, stage.label]));
const unknownReason = { id: 'unknown', label: 'Причина не установлена', script: '' };

const get = id => document.getElementById(id);
const reasonFor = entry => reasonsById.get(entry.reason) ?? unknownReason;
const locationFor = entry => locationsById.get(entry.location) ?? 'Локация не указана';
const filters = get('filters');
const period = get('period');
const location = get('location');
const reasonChart = get('reason-chart');
const funnelChart = get('funnel-chart');
const caseList = get('case-list');
const resetReason = get('reset-reason');
const dialog = get('case-dialog');
const trendChart = get('trend-chart');

let reasonFilter = null;
let currentPage = 0;
let closedCases = [];

function element(tag, className, label) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (label !== undefined) node.textContent = label;
  return node;
}

function shiftDay(day, days) {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function printDay(day) {
  return dateFormat.format(new Date(`${day}T00:00:00Z`));
}

function periodBounds() {
  switch (period.value) {
    case 'recent': return [shiftDay(demoEnd, -6), demoEnd];
    case 'previous': return [shiftDay(demoEnd, -13), shiftDay(demoEnd, -7)];
    default: return [firstDay, demoEnd];
  }
}

function setText(id, value) {
  get(id).textContent = value;
}

function bar(kind, value) {
  const track = element('span', `${kind}-track`);
  const fill = element('span', `${kind}-fill`);
  track.setAttribute('aria-hidden', 'true');
  fill.style.setProperty('--fill', `${Math.round(value * 1000) / 10}%`);
  track.append(fill);
  return track;
}

function groupReasons(refused) {
  const groups = new Map();
  for (const entry of refused) {
    const reason = reasonFor(entry);
    const group = groups.get(reason.id) ?? { ...reason, count: 0 };
    group.count += 1;
    groups.set(reason.id, group);
  }
  return [...groups.values()].sort((first, second) => second.count - first.count || first.label.localeCompare(second.label, 'ru'));
}

function showReasons(groups, total) {
  setText('reasons-count', `Всего ${number.format(total)}`);
  get('reason-empty').hidden = total > 0;
  reasonChart.replaceChildren(...groups.map(({ id, label, count }) => {
    const item = element('li');
    const button = element('button', 'reason-row');
    const icon = element('span', 'reason-arrow', '›');
    button.type = 'button';
    button.dataset.reason = id;
    button.setAttribute('aria-controls', 'case-list');
    button.setAttribute('aria-pressed', 'false');
    icon.setAttribute('aria-hidden', 'true');
    button.append(element('span', 'reason-label', label), bar('reason', count / total), element('strong', 'reason-amount', number.format(count)), icon);
    item.append(button);
    return item;
  }));
}

function showFunnel(records) {
  funnelChart.replaceChildren(...stages.map(({ id, label }, index) => {
    const item = element('li');
    const meta = element('div', 'funnel-meta');
    const count = records.filter(entry => (stageOrder.get(entry.stage) ?? -1) >= index).length;
    meta.append(element('span', '', label), element('strong', '', number.format(count)));
    item.dataset.stage = id;
    item.append(meta, bar('funnel', records.length ? count / records.length : 0));
    return item;
  }));
}

function showTrend(records, start, end) {
  const counts = new Map();
  for (const entry of records) {
    const daily = counts.get(entry.date) ?? { total: 0, lost: 0 };
    daily.total += 1;
    if (entry.outcome === 'lost') daily.lost += 1;
    counts.set(entry.date, daily);
  }
  const days = [];
  for (let day = start; day <= end; day = shiftDay(day, 1)) {
    days.push({ day, ...(counts.get(day) ?? { total: 0, lost: 0 }) });
  }
  const maximum = Math.max(1, ...days.map(({ total }) => total));
  trendChart.style.setProperty('--columns', days.length);
  trendChart.replaceChildren(...days.map(({ day, total, lost }, index) => {
    const item = element('li', 'trend-day');
    const bars = element('span', 'trend-bars');
    const allBar = element('span', 'trend-bar');
    const lostBar = element('span', 'trend-bar trend-bar-lost');
    const label = printDay(day);
    const tickClass = index === 0 || index === days.length - 1 || index % 4 === 0 ? 'trend-tick' : 'trend-tick trend-tick-minor';
    const context = `${label}. Всего заявок ${total}, закрыто без брони ${lost}.`;
    bars.setAttribute('aria-hidden', 'true');
    allBar.style.setProperty('--height', `${total / maximum * 100}%`);
    lostBar.style.setProperty('--height', `${lost / maximum * 100}%`);
    bars.append(allBar, lostBar);
    const tick = element('span', tickClass, day.slice(-2));
    tick.setAttribute('aria-hidden', 'true');
    item.title = context;
    item.append(element('span', 'sr-only', context), bars, tick);
    return item;
  }));
}

function openCase(entry) {
  const reason = reasonFor(entry);
  setText('dialog-title', `Заявка ${entry.id}`);
  setText('dialog-meta', `${locationFor(entry)} · ${printDay(entry.date)} · Демо`);
  setText('dialog-summary', entry.summary);
  setText('dialog-crm', entry.crmReason || 'Не указана');
  setText('dialog-reason', reason.label);
  setText('dialog-stage', stagesById.get(entry.stage) ?? 'Не указан');
  setText('dialog-contact', entry.contactMinutes == null ? 'Нет данных' : `${number.format(entry.contactMinutes)} мин`);
  setText('dialog-evidence', entry.evidence);
  get('dialog-evidence').hidden = !entry.evidence;
  get('dialog-no-evidence').hidden = Boolean(entry.evidence);
  setText('dialog-assessment', entry.assessment);
  setText('dialog-script', reason.script);
  get('dialog-script-section').hidden = !reason.script;
  dialog.showModal();
}

function caseRow(entry) {
  const row = element('li', 'case-row');
  const identity = element('span', 'case-identity');
  const date = element('time', '', printDay(entry.date));
  const open = element('button', 'button button-quiet case-open', 'Открыть');
  date.dateTime = entry.date;
  identity.append(element('strong', '', entry.id), date);
  open.type = 'button';
  open.setAttribute('aria-label', `Открыть заявку ${entry.id}`);
  open.setAttribute('aria-haspopup', 'dialog');
  open.addEventListener('click', () => openCase(entry));
  row.append(identity, element('span', 'case-location', locationFor(entry)), element('span', 'case-reason', reasonFor(entry).label), open);
  return row;
}

function showCases() {
  const results = closedCases.filter(entry => !reasonFilter || reasonFor(entry).id === reasonFilter);
  const active = reasonsById.get(reasonFilter) ?? unknownReason;
  const totalPages = Math.ceil(results.length / listLimit);
  const start = currentPage * listLimit;
  const label = reasonFilter ? active.label : 'Закрытые без брони';
  resetReason.hidden = !reasonFilter;
  setText('case-summary', `${label} · ${number.format(results.length)}`);
  get('case-labels').hidden = results.length === 0;
  get('case-empty').hidden = results.length > 0;
  caseList.replaceChildren(...results.slice(start, start + listLimit).map(caseRow));
  get('pagination').hidden = totalPages < 2;
  get('page-prev').disabled = currentPage === 0;
  get('page-next').disabled = currentPage + 1 >= totalPages;
  const end = Math.min(start + listLimit, results.length);
  setText('page-status', results.length === 0 ? '' : `${start + 1}–${end} из ${results.length}`);
}

function selectReason(id) {
  reasonFilter = reasonFilter === id ? null : id;
  currentPage = 0;
  for (const button of reasonChart.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(reasonFilter === button.dataset.reason));
  }
  showCases();
}

function showDashboard() {
  const [start, end] = periodBounds();
  const records = cases.filter(entry => entry.date >= start && entry.date <= end && (location.value === 'all' || entry.location === location.value));
  const booked = records.filter(entry => entry.outcome === 'booked').length;
  closedCases = records.filter(entry => entry.outcome === 'lost').sort((first, second) => second.date.localeCompare(first.date) || second.id.localeCompare(first.id));
  const groups = groupReasons(closedCases);
  reasonFilter = null;
  currentPage = 0;

  setText('count-total', number.format(records.length));
  setText('count-booked', number.format(booked));
  setText('count-lost', number.format(closedCases.length));
  setText('booking-rate', records.length ? percentage.format(booked / records.length) : '—');
  const dates = `${printDay(start)} — ${printDay(end)}`;
  const finding = groups.length ? `Чаще всего в выборке: ${groups[0].label.toLocaleLowerCase('ru')} (${number.format(groups[0].count)}).` : 'Закрытых без брони заявок нет.';
  setText('finding', `${dates} · ${finding}`);

  showReasons(groups, closedCases.length);
  showFunnel(records);
  showCases();
  showTrend(records, start, end);
}

for (const branch of locations) {
  const choice = element('option', '', branch.label);
  choice.value = branch.id;
  location.append(choice);
}

filters.addEventListener('submit', event => event.preventDefault());
filters.addEventListener('change', showDashboard);
reasonChart.addEventListener('click', event => {
  const button = event.target.closest('[data-reason]');
  if (!button) return;
  selectReason(button.dataset.reason);
  if (reasonFilter) {
    get('cases-title').focus({ preventScroll: true });
    get('cases').scrollIntoView({ block: 'start' });
  }
});
resetReason.addEventListener('click', () => {
  const selected = reasonChart.querySelector('[aria-pressed="true"]');
  selectReason(null);
  selected?.focus();
});
get('page-prev').addEventListener('click', () => {
  currentPage -= 1;
  showCases();
  if (get('page-prev').disabled) get('page-next').focus();
});
get('page-next').addEventListener('click', () => {
  currentPage += 1;
  showCases();
  if (get('page-next').disabled) get('page-prev').focus();
});

showDashboard();
