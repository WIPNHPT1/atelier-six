import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CommandPalette.module.css';
import { fuzzySearch } from '../../core/search/fuzzy';
import { getCommands, type Command, type CommandGroup } from './registerCommands';
import { copy } from '../../content/copy.en-GB';
import { cx } from '../cx';

const GROUP_ORDER: CommandGroup[] = ['Lessons', 'Chords', 'Drills', 'Settings', 'Actions'];
const RECENT_KEY = 'a6.commandPalette.recent';
const MAX_RECENT = 5;

function loadRecentIds(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is string => typeof entry === 'string');
  } catch {
    return [];
  }
}

function saveRecentId(id: string): void {
  const next = [id, ...loadRecentIds().filter((existing) => existing !== id)].slice(0, MAX_RECENT);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable (private mode, quota) - recents are a convenience, not critical
  }
}

function buildGroups(commands: Command[], query: string): Map<string, Command[]> {
  const groups = new Map<string, Command[]>();

  if (query.length === 0) {
    const recentCommands = loadRecentIds()
      .map((id) => commands.find((command) => command.id === id))
      .filter((command): command is Command => Boolean(command));
    if (recentCommands.length > 0) {
      groups.set(copy.commandPalette.recent, recentCommands);
    }
    for (const groupName of GROUP_ORDER) {
      const inGroup = commands.filter((command) => command.group === groupName);
      if (inGroup.length > 0) groups.set(groupName, inGroup);
    }
    return groups;
  }

  const results = fuzzySearch(query, commands, (command) =>
    [command.label, ...(command.keywords ?? [])].join(' '),
  );
  // The group holding the best match comes first, so a strong hit is never buried
  // under a long list of weaker ones (ties keep the usual group order).
  const best = (groupName: CommandGroup) =>
    Math.max(-Infinity, ...results.filter((r) => r.item.group === groupName).map((r) => r.score));
  const order = [...GROUP_ORDER].sort((a, b) => best(b) - best(a));
  for (const groupName of order) {
    const inGroup = results.filter((result) => result.item.group === groupName).map((r) => r.item);
    if (inGroup.length > 0) groups.set(groupName, inGroup);
  }
  return groups;
}

export type CommandPaletteProps = {
  onClose: () => void;
};

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [queryAtLastIndexReset, setQueryAtLastIndexReset] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo(() => getCommands(), []);
  const groups = useMemo(() => buildGroups(commands, query), [commands, query]);
  const flatCommands = useMemo(() => Array.from(groups.values()).flat(), [groups]);

  if (query !== queryAtLastIndexReset) {
    setQueryAtLastIndexReset(query);
    setActiveIndex(0);
  }

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function runActive() {
      const command = flatCommands[activeIndex];
      if (!command) return;
      saveRecentId(command.id);
      command.run({ navigate });
      onClose();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((current) => Math.min(current + 1, flatCommands.length - 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((current) => Math.max(current - 1, 0));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        runActive();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [flatCommands, activeIndex, navigate, onClose]);

  let flatIndex = -1;

  return (
    <>
      <button
        type="button"
        className={styles.backdrop}
        tabIndex={-1}
        aria-hidden
        onClick={onClose}
      />
      <div
        className={styles.palette}
        role="dialog"
        aria-modal="true"
        aria-label={copy.commandPalette.title}
      >
        <input
          ref={inputRef}
          className={styles.input}
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          placeholder={copy.commandPalette.placeholder}
          aria-label={copy.commandPalette.placeholder}
        />
        <div className={styles.results} role="listbox" aria-label={copy.commandPalette.title}>
          {flatCommands.length === 0 ? (
            <p className={styles.empty}>{copy.commandPalette.noResults}</p>
          ) : (
            Array.from(groups.entries()).map(([groupName, groupCommands]) => (
              <div className={styles.group} key={groupName}>
                <p className={styles.groupLabel}>{groupName}</p>
                {groupCommands.map((command) => {
                  flatIndex += 1;
                  const index = flatIndex;
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={command.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      className={cx(styles.result, isActive ? styles.active : undefined)}
                      onMouseEnter={() => {
                        setActiveIndex(index);
                      }}
                      onClick={() => {
                        saveRecentId(command.id);
                        command.run({ navigate });
                        onClose();
                      }}
                    >
                      {command.label}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
