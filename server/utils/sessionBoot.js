import { randomUUID } from 'crypto';
import { readFileSync } from 'fs';
const readContainerStart = () => {
  try {
    const stat = readFileSync('/proc/1/stat', 'utf8');
    // Field 22 is the start time; the process name (field 2) may contain spaces
    const fields = stat.slice(stat.lastIndexOf(')') + 2).split(' ');
    const startTime = fields[19];
    const bootTime = readFileSync('/proc/stat', 'utf8').match(/^btime (\d+)/m)?.[1];
    return startTime && bootTime ? `${bootTime}-${startTime}` : null;
  } catch {
    return null;
  }
};

export const BOOT_ID = readContainerStart() ?? randomUUID();
