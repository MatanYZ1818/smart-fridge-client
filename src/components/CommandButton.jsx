import { commandButtonKey } from '../lib/fridgeHelpers';

export default function CommandButton({
  device,
  command,
  activeKey,
  countdown,
  onClick,
  className = 'fridge-btn command-btn',
  title,
}) {
  const key = commandButtonKey(device, command);
  const isActive = activeKey === key;
  const isCountdown = isActive && countdown != null && countdown > 0;

  return (
    <button
      type="button"
      className={`${className}${isActive ? ' command-btn-busy' : ''}`}
      disabled={isActive}
      onClick={onClick}
      title={title || command.description || command.label}
      aria-busy={isActive}
    >
      {isCountdown ? (
        <span className="command-btn-content">
          <span>{command.label}</span>
          <span className="command-countdown" aria-live="polite">{countdown}</span>
        </span>
      ) : isActive ? (
        <span className="command-btn-content">
          <span className="command-spinner" aria-hidden />
          <span>מפעיל...</span>
        </span>
      ) : (
        command.label
      )}
    </button>
  );
}
