export default function InlineAlert({ type = 'error', title, message }) {
  const bg =
    type === 'success'
      ? '#ecfdf5'
      : type === 'info'
        ? '#eff6ff'
        : '#fef2f2';
  const border =
    type === 'success'
      ? '#34d399'
      : type === 'info'
        ? '#60a5fa'
        : '#f87171';
  const color =
    type === 'success'
      ? '#065f46'
      : type === 'info'
        ? '#1d4ed8'
        : '#991b1b';

  return (
    <div
      style={{
        padding: 12,
        borderRadius: 12,
        background: bg,
        border: `1px solid ${border}`,
        color,
      }}
    >
      {title ? <div style={{ fontWeight: 800, marginBottom: 4 }}>{title}</div> : null}
      {message ? <div style={{ fontSize: 13 }}>{message}</div> : null}
    </div>
  );
}

