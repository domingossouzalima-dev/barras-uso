import { atom, read, update } from 'claude-code'
import type { Register, SessionRateLimit } from 'claude-code'

import type { Uso } from '../types'

const LARGURA = 8

const uso = atom(
  { plugin: 'barras-uso', key: 'uso' } as const,
  { contexto: null, cincoHoras: null, semanal: null } as Uso,
)

const janela = (limites: SessionRateLimit[], kind: string): number | null =>
  limites.find(l => l.kind === kind)?.percentUsed ?? null

const medir = (contexto: number | undefined, limites: SessionRateLimit[]): Uso => ({
  contexto: contexto ?? null,
  cincoHoras: janela(limites, 'five_hour'),
  semanal: janela(limites, 'seven_day'),
})

export const barra = (percentual: number | null): string => {
  const p = Math.max(0, Math.min(100, percentual ?? 0))
  const cheios = Math.round((p / 100) * LARGURA)
  return '█'.repeat(cheios) + '░'.repeat(LARGURA - cheios)
}

const texto = (percentual: number | null): string =>
  percentual === null ? '  --' : `${Math.round(percentual)}%`.padStart(4)

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const { context, rateLimits } = await $.session.usage()
    await update($, uso, () => medir(context.percent, rateLimits))
    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    await update($, uso, () => medir(e.context.percent, e.rateLimits))
    return next(e)
  })

  on('ui.render', { component: 'PromptHint' }, async ($, e, next) => {
    const v = await read($, uso)
    const partes: [string, number | null][] = [
      ['Ctx', v.contexto],
      ['5h', v.cincoHoras],
      ['Sem', v.semanal],
    ]
    const tail = partes.map(([rotulo, p]) => `${rotulo} ${barra(p)} ${texto(p).trim()}`).join('  ')

    return next({ ...e, props: { ...e.props, tail: `  ${tail}` } })
  })
}
