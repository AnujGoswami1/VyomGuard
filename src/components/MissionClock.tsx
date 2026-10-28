/**
 * MissionClock Component
 *
 * Displays live UTC time and mission elapsed time since page load.
 * Updates every second via setInterval.
 * Formatted in JetBrains Mono with cyan text for the space aesthetic.
 */

import React, { useEffect, useState } from 'react';

/** Page load timestamp for elapsed time calculation */
const PAGE_LOAD_TIME = Date.now();

/**
 * Live UTC clock and mission elapsed time display.
 */
export const MissionClock: React.FC = () => {
  const [utcString, setUtcString] = useState('');
  const [elapsed, setElapsed] = useState('T+ 00:00:00');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const year = now.getUTCFullYear();
      const month = String(now.getUTCMonth() + 1).padStart(2, '0');
      const day = String(now.getUTCDate()).padStart(2, '0');
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcString(`${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`);

      const totalSec = Math.floor((Date.now() - PAGE_LOAD_TIME) / 1000);
      const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
      const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
      const s = String(totalSec % 60).padStart(2, '0');
      setElapsed(`T+ ${h}:${m}:${s}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="font-mono-data text-vs-cyan text-sm">{utcString}</span>
      <span className="font-mono-data text-vs-text-secondary text-xs">{elapsed}</span>
    </div>
  );
};
