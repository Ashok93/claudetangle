import { SandboxCanvas } from './SandboxCanvas';
import { SandboxOverlay } from './SandboxOverlay';
import { theme } from '../../lib/theme';

export function SandboxMode() {
  return (
    <div className="h-full w-full relative" style={{ background: theme.bg.base }}>
      <SandboxCanvas />
      <SandboxOverlay />
    </div>
  );
}
