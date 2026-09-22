const isProd = process.env.NODE_ENV === 'production'

type Args = unknown[]

export const logger = {
  /** Log de debug — silencieux en production. */
  debug: (...args: Args) => {
    if (!isProd) console.log(...args)
  },
  /** Log d'info — silencieux en production. */
  info: (...args: Args) => {
    if (!isProd) console.log(...args)
  },
  /** Avertissement — toujours affiché. */
  warn: (...args: Args) => {
    console.warn(...args)
  },
  /** Erreur — toujours affichée et envoyée à un service externe en prod (à brancher). */
  error: (...args: Args) => {
    console.error(...args)
    // TODO: brancher Sentry / Logtail en production.
  },
}
