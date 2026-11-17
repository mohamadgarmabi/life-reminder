// Keys are prefixed with 'database.' (or 'common.' / 'nav.' in shell) so module dictionaries never collide.
const fa = {
  'database.unsupported': 'مرورگر شما از IndexedDB پشتیبانی نمی‌کند یا دسترسی به آن مسدود است.',
  'database.blocked': 'برنامه در تب دیگری باز است. آن تب را ببندید تا پایگاه داده به‌روز شود.',
}

const en: Record<keyof typeof fa, string> = {
  'database.unsupported': 'Your browser doesn’t support IndexedDB, or access to it is blocked.',
  'database.blocked': 'The app is open in another tab. Close that tab so the database can update.',
}

const messages = { fa, en }

export default messages
