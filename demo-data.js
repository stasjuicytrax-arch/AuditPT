export const demoEnd = '2026-11-22';

export const locations = [
  { id: 'dumskaya', label: 'Думская' },
  { id: 'leninskiy', label: 'Ленинский' },
  { id: 'komenda', label: 'Коменда' },
  { id: 'mayakovskaya', label: 'Маяковская' },
];

export const stages = [
  { id: 'request', label: 'Поступила заявка' },
  { id: 'contact', label: 'Связались с гостем' },
  { id: 'offer', label: 'Предложили зал' },
  { id: 'booking', label: 'Подтвердили бронь' },
];

export const reasons = [
  { id: 'price', label: 'Стоимость', script: 'Какой общий бюджет вам комфортен? Если время или локация гибкие, проверю варианты и пришлю полную стоимость по каждому.' },
  { id: 'time', label: 'Нет подходящего времени', script: 'Для вас важнее сохранить эту дату или начать именно в это время? Проверю ближайшие варианты и вернусь с конкретным предложением.' },
  { id: 'silent', label: 'Не удалось связаться', script: 'Здравствуйте! Вы оставляли заявку на зал Party Time. Если ещё актуально, ответьте удобным временем для связи. Могу прислать варианты сюда.' },
  { id: 'deposit', label: 'Условия депозита', script: 'Подскажите, что именно смущает — сумма, состав или условия оплаты? Я уточню правила для этого зала и объясню, что оплачивается отдельно.' },
  { id: 'location', label: 'Не подошла локация', script: 'Какой район или станция метро вам удобнее? Если время подходит, проверю залы в этой части города.' },
  { id: 'capacity', label: 'Не подошла вместимость', script: 'Сколько человек точно будет и нужна ли посадка за общим столом? Проверю залы с подходящей вместимостью и свободным временем.' },
  { id: 'unknown', label: 'Причина не подтверждена', script: 'Если удобно, подскажите, что повлияло на выбор? Это поможет нам точнее подбирать варианты. Спасибо, что обратились.' },
];

const examples = {
  price: { crmReason: 'Дорого', summary: 'Гости искали зал для дня рождения в рамках бюджета.', evidence: 'Для всей компании мы рассчитывали на меньшую сумму.', assessment: 'Гость назвал бюджет, но более доступный вариант в разговоре не предложен.' },
  time: { crmReason: 'Неудобная дата или время', summary: 'Компания хотела начать праздник в определённое время.', evidence: 'Позже начать не можем, часть гостей с детьми.', assessment: 'Ограничение по времени подтверждено. Можно было проверить ту же дату на соседней локации.' },
  silent: { crmReason: 'Нет связи', summary: 'После заявки не состоялся разговор.', evidence: '', assessment: 'Молчание клиента зафиксировано. Причина, по которой он не ответил, неизвестна.' },
  deposit: { crmReason: 'Отказ из-за депозита', summary: 'Гость уточнял, как считается депозит за зал.', evidence: 'Я не понял, депозит входит в заказ или это ещё сверху?', assessment: 'Есть вопрос об условиях. Явного отказа в этом фрагменте нет.' },
  location: { crmReason: 'Не подошла локация', summary: 'Клиенту было важно добраться до зала без пересадок.', evidence: 'Эта станция нам далеко, ищем ближе к северу города.', assessment: 'Гость указал ограничение по району. В диалоге можно уточнить удобные станции.' },
  capacity: { crmReason: 'Не подошёл зал', summary: 'Для праздника нужен общий стол и свободное место для программы.', evidence: 'Список вырос до двадцати человек. Нужно, чтобы все могли сесть.', assessment: 'Вместимость определяет решение. Нужна проверка зала с подходящей посадкой.' },
  unknown: { crmReason: 'Выбрали другое заведение', summary: 'Гость сообщил, что уже забронировал другую площадку.', evidence: 'Спасибо, мы уже определились с местом.', assessment: 'Факт ухода подтверждён. Причину выбора другой площадки гость не назвал.' },
};

const accepted = { crmReason: '', summary: 'Гость согласовал время и подтвердил бронирование.', evidence: 'Это время подходит, готовы бронировать.', assessment: 'Бронирование подтверждено в демонстрационной карточке.' };
const awaiting = { crmReason: '', summary: 'Пока нет подтверждённого решения гостя.', evidence: '', assessment: 'Заявка остаётся в работе. Итог ещё неизвестен.' };

const days = [
  ['09', 'offer:price', 'booking', 'request:silent', 'request'],
  ['10', 'booking', 'offer:time', 'contact:location', 'offer'],
  ['11', 'offer:price', 'booking', 'offer:deposit'],
  ['12', 'offer:capacity', 'contact', 'booking', 'offer:price', 'offer:unknown'],
  ['13', 'offer:time', 'booking', 'offer', 'request:silent', 'offer:price'],
  ['14', 'booking', 'offer:price', 'offer:time', 'booking', 'offer:deposit', 'contact'],
  ['15', 'offer:time', 'offer:unknown', 'booking', 'offer:capacity', 'request:silent'],
  ['16', 'offer:price', 'booking', 'contact:location', 'offer'],
  ['17', 'offer:deposit', 'offer:price', 'booking', 'offer:time', 'request'],
  ['18', 'booking', 'offer:capacity', 'offer:price', 'offer'],
  ['19', 'offer:price', 'offer:time', 'booking', 'request:silent', 'contact:location'],
  ['20', 'booking', 'offer:time', 'offer:deposit', 'booking', 'offer:price', 'offer:unknown'],
  ['21', 'offer:time', 'booking', 'offer:price', 'request:silent', 'booking', 'offer:capacity'],
  ['22', 'offer:price', 'offer:time', 'booking', 'offer:deposit', 'request:silent', 'offer:unknown', 'offer'],
];

export const cases = days.flatMap(([day, ...items], index) => items.map((item, slot) => {
  const [stage, reason = ''] = item.split(':');
  const outcome = stage === 'booking' ? 'booked' : reason ? 'lost' : 'open';
  const example = reason ? examples[reason] : outcome === 'booked' ? accepted : awaiting;

  return {
    id: `PT-${1050 + index * 10 + slot}`,
    date: `2026-11-${day}`,
    location: locations[(index * 3 + slot) % locations.length].id,
    stage,
    outcome,
    reason,
    contactMinutes: stage === 'request' || reason === 'silent' ? null : 2 + (index * 11 + slot * 4) % 23,
    ...example,
  };
}));
