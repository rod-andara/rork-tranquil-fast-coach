type OfflineJob = { type: 'upsertFast'; payload: Record<string, unknown> };

const queue: OfflineJob[] = [];

export function enqueueOffline(job: OfflineJob) {
  queue.push(job);
  console.log('[offline] queued', job.type);
}

export function flushQueue() {
  console.log('[offline] flush not implemented in stub, jobs:', queue.length);
}
