import { getSportIcon } from '../utils/sportIcons';

export default function SportIcon({ sport, size = 'text-sm' }) {
  return (
    <span className={`${size} leading-none`} role="img" aria-label={sport}>
      {getSportIcon(sport)}
    </span>
  );
}
