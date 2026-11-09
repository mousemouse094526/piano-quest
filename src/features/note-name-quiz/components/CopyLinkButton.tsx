import { Check, Link } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { browserShareDeps, COPIED_SHOWN_MS, copyText } from '../hooks/shareOrCopy';

type CopyStatus = 'idle' | 'copied' | 'failed';

/**
 * D44: copies the page URL, which holds every setting (D16), so a teacher can send it in
 * one click. It never touches the Round. Focus stays put through the Mode bar's
 * onMouseDown, as for every control there.
 */
export function CopyLinkButton() {
  // A new object on every copy, so a second click restarts the timer even when the status is the same.
  const [shown, setShown] = useState<{ status: CopyStatus }>({ status: 'idle' });
  const { status } = shown;

  useEffect(() => {
    if (shown.status === 'idle') return;
    const id = window.setTimeout(() => setShown({ status: 'idle' }), COPIED_SHOWN_MS);
    return () => window.clearTimeout(id);
  }, [shown]);

  async function copy() {
    // share-results D7: the same copier as the share button, never a share sheet. Inside the
    // click: Safari and Firefox allow writing only on a user gesture.
    setShown({ status: await copyText(window.location.href, browserShareDeps().writeText) });
  }

  return (
    <span className="relative">
      <Button
        variant="ghost"
        aria-label="คัดลอกลิงก์"
        className="size-11 text-muted-foreground"
        onClick={copy}
      >
        {status === 'copied' ? (
          <Check aria-hidden="true" className="text-brand" />
        ) : (
          <Link aria-hidden="true" />
        )}
      </Button>
      {/* Under the button, out of the flow, so the Mode bar stays one line from `lg` (D30). */}
      <span
        role="status"
        className="absolute top-full left-1/2 -translate-x-1/2 whitespace-nowrap text-muted-foreground text-xs"
      >
        {status === 'copied' && 'คัดลอกแล้ว'}
        {status === 'failed' && 'คัดลอกไม่ได้'}
      </span>
    </span>
  );
}
