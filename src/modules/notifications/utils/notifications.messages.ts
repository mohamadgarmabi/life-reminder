// Keys are prefixed with 'notifications.' (or 'common.' / 'nav.' in shell) so module dictionaries never collide.
const fa = {
  'notifications.installmentTitle': 'قسط {title}',
  'notifications.installmentBody': '{amount} — سررسید {when} ({date})',
  'notifications.plantTitle': 'آبیاری {name}',
  'notifications.plantBody': '{every} — موعد آبیاری {when}',
  'notifications.mistTitle': 'پاشش آب {name}',
  'notifications.mistBody': '{every} — موعد پاشش {when}',
  'notifications.summaryTitle': 'یادآورهای معوق',
  'notifications.summaryBody': '{n} مورد در انتظار شماست',
  'notifications.center.title': 'اعلان‌ها',
  'notifications.center.description': 'تاریخچهٔ اعلان‌های نمایش‌داده‌شده',
  'notifications.center.clear': 'پاک کردن نشان',
  'notifications.center.clearFailed': 'پاک کردن اعلان‌ها ممکن نشد',
  'notifications.center.empty': 'هنوز اعلانی نیامده',
}

const en: Record<keyof typeof fa, string> = {
  'notifications.installmentTitle': 'Installment: {title}',
  'notifications.installmentBody': '{amount} — due {when} ({date})',
  'notifications.plantTitle': 'Water {name}',
  'notifications.plantBody': '{every} — watering due {when}',
  'notifications.mistTitle': 'Mist {name}',
  'notifications.mistBody': '{every} — misting due {when}',
  'notifications.summaryTitle': 'Missed reminders',
  'notifications.summaryBody': '{n} items are waiting for you',
  'notifications.center.title': 'Notifications',
  'notifications.center.description': 'History of shown notifications',
  'notifications.center.clear': 'Clear badge',
  'notifications.center.clearFailed': 'Couldn’t clear notifications',
  'notifications.center.empty': 'No notifications yet',
}

const messages = { fa, en }

export default messages
