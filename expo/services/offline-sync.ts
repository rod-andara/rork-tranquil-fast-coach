type OfflineJob = { type: 'upsertFast'; payload: Record<string, unknown> };

const queue: OfflineJob[] = [];

export function enqueueOffline(job: OfflineJob) {
  queue.push(job);
  if (__DEV__) console.log('[offline] queued', job.type);
}

export function flushQueue() {
  if (__DEV__) console.log('[offline] flush not implemented in stub, jobs:', queue.length);
}
