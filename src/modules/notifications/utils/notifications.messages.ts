// Keys are prefixed with 'notifications.' (or 'common.' / 'nav.' in shell) so module dictionaries never collide.
const fa = {
  'notifications.installmentTitle': 'قسط {title}',
  'notifications.installmentBody': '{amount} — سررسید {when} ({date})',
  'notifications.plantTitle': 'آبیاری {name}',
  'notifications.plantBody': '{every} — موعد آبیاری {when}',
  'notifications.summaryTitle': 'یادآورهای معوق',
  'notifications.summaryBody': '{n} مورد در انتظار شماست',
}

const en: Record<keyof typeof fa, string> = {
  'notifications.installmentTitle': 'Installment: {title}',
  'notifications.installmentBody': '{amount} — due {when} ({date})',
  'notifications.plantTitle': 'Water {name}',
  'notifications.plantBody': '{every} — watering due {when}',
  'notifications.summaryTitle': 'Missed reminders',
  'notifications.summaryBody': '{n} items are waiting for you',
}

const messages = { fa, en }

export default messages
