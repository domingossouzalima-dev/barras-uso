export type Uso = {
  contexto: number | null
  cincoHoras: number | null
  semanal: number | null
}

declare module 'claude-code' {
  interface PluginState {
    'barras-uso': { uso: Uso }
  }
}
