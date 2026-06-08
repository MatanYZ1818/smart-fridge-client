import { useEffect, useMemo, useState } from 'react';

function safeStringify(value) {
  if (value === undefined) return '';
  if (value === null) return '';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '';
  }
}

export default function JsonTextarea({
  label,
  value,
  onChange,
  placeholder = '{\n  "key": "value"\n}',
  required = false,
}) {
  const initial = useMemo(() => safeStringify(value), [value]);
  const [text, setText] = useState(initial);
  const [error, setError] = useState(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setText(initial);
      setError(null);
    }, 0);
    return () => clearTimeout(id);
  }, [initial]);

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <textarea
        value={text}
        onChange={(e) => {
          const next = e.target.value;
          setText(next);
          setError(null);

          if (!next.trim()) {
            if (!required) onChange(undefined);
            return;
          }

          try {
            const parsed = JSON.parse(next);
            onChange(parsed);
          } catch {
            setError('Invalid JSON');
          }
        }}
        rows={6}
        placeholder={placeholder}
        style={{
          width: '100%',
          borderRadius: 12,
          border: error ? '1px solid #f87171' : '1px solid #e5e7eb',
          padding: 10,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          fontSize: 12,
        }}
      />
      {error ? (
        <div style={{ color: '#b91c1c', fontSize: 12, marginTop: 6 }}>{error}</div>
      ) : null}
    </div>
  );
}

