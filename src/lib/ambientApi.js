import { CONFIG } from '../config';
import { apiRequest, apiPaths } from './apiClient';

export async function loginUser({ email, password }) {
  return apiRequest(
    `${apiPaths.usersBase}/login/${encodeURIComponent(CONFIG.systemId)}/${encodeURIComponent(email)}`,
    { method: 'GET', queryParams: { password } }
  );
}

export async function registerUser({ email, password, role, username, avatar }) {
  return apiRequest(`${apiPaths.usersBase}`, {
    method: 'POST',
    body: {
      email,
      password,
      role,
      username,
      avatar,
    },
  });
}

export async function updateUser({ email, existingPassword, update }) {
  return apiRequest(
    `${apiPaths.usersBase}/${encodeURIComponent(CONFIG.systemId)}/${encodeURIComponent(email)}`,
    {
      method: 'PUT',
      queryParams: { password: existingPassword },
      body: {
        email,
        password: update.password, // may be undefined
        role: update.role,
        username: update.username,
        avatar: update.avatar,
      },
    }
  );
}

function stripUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  );
}

export async function getAllObjects() {
  return apiRequest(`${apiPaths.objectsBase}`);
}

export async function getObject({ objectId }) {
  return apiRequest(`${apiPaths.objectsBase}/${encodeURIComponent(CONFIG.systemId)}/${encodeURIComponent(objectId)}`);
}

export async function createObject(payload) {
  // payload includes: type, alias, status?, active?, location?, objectDetails?
  return apiRequest(`${apiPaths.objectsBase}`, {
    method: 'POST',
    body: payload,
  });
}

export async function updateObject({ objectId, payload }) {
  const body = stripUndefined(payload);
  return apiRequest(
    `${apiPaths.objectsBase}/${encodeURIComponent(CONFIG.systemId)}/${encodeURIComponent(objectId)}`,
    { method: 'PUT', body }
  );
}

export async function getChildren({ parentObjectId }) {
  return apiRequest(
    `${apiPaths.relationsBase}/${encodeURIComponent(CONFIG.systemId)}/${encodeURIComponent(parentObjectId)}/children`
  );
}

export async function getParents({ childObjectId }) {
  return apiRequest(
    `${apiPaths.relationsBase}/${encodeURIComponent(CONFIG.systemId)}/${encodeURIComponent(childObjectId)}/parents`
  );
}

export async function bindChild({ parentObjectId, childObjectId }) {
  return apiRequest(
    `${apiPaths.relationsBase}/${encodeURIComponent(CONFIG.systemId)}/${encodeURIComponent(parentObjectId)}/children`,
    {
      method: 'PUT',
      body: {
        childId: {
          systemID: CONFIG.systemId,
          objectId: childObjectId,
        },
      },
    }
  );
}

export async function invokeCommand({ commandBoundary }) {
  return apiRequest(`${apiPaths.commandsBase}`, {
    method: 'POST',
    body: commandBoundary,
  });
}

// Admin
export async function adminExportUsers() {
  return apiRequest(`${apiPaths.adminBase}/users`);
}

export async function adminDeleteAllUsers() {
  return apiRequest(`${apiPaths.adminBase}/users`, { method: 'DELETE' });
}

export async function adminExportCommands() {
  return apiRequest(`${apiPaths.adminBase}/commands`);
}

export async function adminDeleteAllCommands() {
  return apiRequest(`${apiPaths.adminBase}/commands`, { method: 'DELETE' });
}

export async function adminDeleteAllObjects() {
  return apiRequest(`${apiPaths.adminBase}/objects`, { method: 'DELETE' });
}

