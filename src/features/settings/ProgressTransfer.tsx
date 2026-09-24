import { useRef, useState } from 'react';
import { copy } from '../../content/copy.en-GB';
import { Button } from '../../ui/Button';
import { Panel } from '../../ui/Panel';
import { Text } from '../../ui/Text';
import { useProgress } from '../progress/store';
import styles from './SettingsPage.module.css';

const FILE_NAME = 'atelier-six-progress.json';

type Status = 'idle' | 'imported' | 'failed';

// Export/import progress as a JSON file, so it can move between devices without accounts.
export function ProgressTransfer() {
  const exportJson = useProgress((s) => s.exportJson);
  const importJson = useProgress((s) => s.importJson);
  const load = useProgress((s) => s.load);
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>('idle');

  async function download() {
    await load();
    const blob = new Blob([exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = FILE_NAME;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function upload(file: File) {
    const ok = await importJson(await file.text());
    setStatus(ok ? 'imported' : 'failed');
  }

  return (
    <Panel>
      <div className={styles.row}>
        <div>
          <Text>{copy.settings.progress}</Text>
          <Text dim size="small">
            {copy.settings.progressHint}
          </Text>
        </div>
        <div className={styles.actions}>
          <Button
            variant="quiet"
            onClick={() => {
              void download();
            }}
          >
            {copy.settings.exportProgress}
          </Button>
          <Button
            variant="quiet"
            onClick={() => {
              fileRef.current?.click();
            }}
          >
            {copy.settings.importProgress}
          </Button>
          <input
            ref={fileRef}
            className={styles.file}
            type="file"
            accept="application/json,.json"
            aria-label={copy.settings.importProgress}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.target.value = '';
            }}
          />
        </div>
      </div>
      {status === 'idle' ? null : (
        <Text role="status" dim={status === 'failed'}>
          {status === 'imported' ? copy.settings.importDone : copy.settings.importFailed}
        </Text>
      )}
    </Panel>
  );
}
