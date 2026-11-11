import { labels } from './harness.js';

const DONE = new Set(['copied', 'linked']);

function plural(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/** Success line for an install, or null when nothing was installed. */
export function successMessage(results, harnessIds) {
  const done = results.filter((r) => DONE.has(r.result));
  if (!done.length) return null;
  const skills = done.filter((r) => r.item.kind === 'skill').length;
  const rules = done.length - skills;
  const parts = [skills && plural(skills, 'skill'), rules && plural(rules, 'rule')].filter(Boolean);
  return `Installed ${parts.join(' and ')} for ${labels(harnessIds)}.`;
}
