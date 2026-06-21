import { CONFIG } from '../config';

function buildHeaders(extraHeaders = {}) {
  return {
    'Content-Type': 'application/json',
    [CONFIG.apiVersionHeaderName]: CONFIG.apiVersionHeaderValue,
    ...extraHeaders,
  };
}

async function parseJsonSafe(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiRequest(path, { method = 'GET', headers, body, queryParams } = {}) {
  const url = new URL(CONFIG.apiBaseUrl + path);

  if (queryParams) {
    Object.entries(queryParams).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      url.searchParams.set(k, String(v));
    });
  }

  const res = await fetch(url.toString(), {
    method,
    headers: buildHeaders(headers),
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await parseJsonSafe(res);
    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${res.status}`;

    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return parseJsonSafe(res);
}

export const apiPaths = {
  usersBase: '/ambient-invisible-intelligence/users',
  objectsBase: '/ambient-invisible-intelligence/objects',
  relationsBase: '/objects',
  commandsBase: '/ambient-invisible-intelligence/commands',
  adminBase: '/ambient-invisible-intelligence/admin',
};

