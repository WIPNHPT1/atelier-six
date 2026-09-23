import type { NavigateFunction } from 'react-router-dom'

export type CommandGroup = 'Lessons' | 'Chords' | 'Drills' | 'Settings' | 'Actions'

export type CommandContext = {
  navigate: NavigateFunction
}

export type Command = {
  id: string
  group: CommandGroup
  label: string
  keywords?: string[]
  run: (ctx: CommandContext) => void
}

const registry = new Map<string, Command>()

export function registerCommands(commands: Command[]): () => void {
  for (const command of commands) {
    registry.set(command.id, command)
  }
  return () => {
    for (const command of commands) {
      registry.delete(command.id)
    }
  }
}

export function getCommands(): Command[] {
  return Array.from(registry.values())
}

export function clearCommands(): void {
  registry.clear()
}
