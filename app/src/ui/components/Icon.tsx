import { ICONS, type IconName } from '../icons.generated';

export function Icon({ name, class: cls = '', label }: { name: IconName; class?: string; label?: string }) {
  return (
    <svg
      class={`icon ${cls}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden={label ? undefined : 'true'}
      role={label ? 'img' : undefined}
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: ICONS[name] }}
    />
  );
}
