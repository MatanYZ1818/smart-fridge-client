import * as ambientApi from './ambientApi';
import { CONFIG } from '../config';

const PRODUCT_TYPE = 'PRODUCT';
const CONTAINER_TYPE = 'CONTAINER';

export function buildInvoker(user) {
  return {
    userId: {
      email: user.userId.email,
      systemID: user.userId.systemID,
    },
  };
}

export function buildTarget(objectId) {
  return {
    id: {
      systemID: CONFIG.systemId,
      objectId,
    },
  };
}

export function isProduct(object) {
  return object?.type?.toUpperCase() === PRODUCT_TYPE;
}

export function isContainer(object) {
  return object?.type?.toUpperCase() === CONTAINER_TYPE;
}

export function deviceIcon(object) {
  const alias = object?.alias || '';
  const category = object?.objectDetails?.category;
  if (/fridge|refrigerator|מקרר/i.test(alias) || category === 'cold-storage') return '🧊';
  if (/oven|תנור/i.test(alias) || category === 'cooking') return '🔥';
  if (/coffee|קפה/i.test(alias) || category === 'drink-maker') return '☕';
  if (/dishwasher|מדיח/i.test(alias) || category === 'cleaning') return '🍽️';
  if (/pantry|cabinet|ארון|מזווה/i.test(alias) || category === 'storage') return '📦';
  return '⚙️';
}

export function deviceDescription(object) {
  return object?.objectDetails?.description || 'מכשיר חכם שמחובר למערכת';
}

export function getAvailableCommands(object) {
  const commands = object?.objectDetails?.availableCommands;
  if (Array.isArray(commands) && commands.length > 0) {
    return commands.map((cmd) => (
      typeof cmd === 'string'
        ? { name: cmd, label: commandLabel(cmd) }
        : { label: commandLabel(cmd.name), ...cmd }
    ));
  }

  if (isContainer(object)) {
    return [
      { name: 'OPEN_DOOR', label: 'פתח דלת' },
      { name: 'CHECK_CONTENTS', label: 'בדוק תכולה' },
    ];
  }

  return [
    { name: 'TURN_ON', label: 'הפעל' },
    { name: 'TURN_OFF', label: 'כבה' },
  ];
}

export function commandLabel(commandName) {
  const map = {
    OPEN_DOOR: 'פתח דלת',
    CLOSE_DOOR: 'סגור דלת',
    CHECK_CONTENTS: 'בדוק תכולה',
    SET_TEMPERATURE: 'כוון טמפרטורה',
    START_COOLING: 'הפעל קירור',
    PREHEAT: 'חימום מוקדם',
    TURN_ON: 'הפעל',
    TURN_OFF: 'כבה',
    START_BREW: 'הכן קפה',
    START_WASH: 'הפעל שטיפה',
    ECO_MODE: 'מצב חסכוני',
  };
  return map[commandName] || commandName;
}

export function isDishwasherDevice(device) {
  const category = device?.objectDetails?.category;
  const alias = device?.alias || '';
  return category === 'cleaning' || /dishwasher|מדיח/i.test(alias);
}

export function isCoffeeMachineDevice(device) {
  const category = device?.objectDetails?.category;
  const alias = device?.alias || '';
  return category === 'drink-maker' || /coffee|קפה/i.test(alias);
}

/** Returns countdown seconds for long-running device activations, or null for instant feedback only. */
export function getCommandRunDuration(device, command) {
  const name = command?.name;
  if (!name || !device) return null;

  if (isDishwasherDevice(device)) {
    if (name === 'START_WASH') return 45;
    if (name === 'ECO_MODE') return 60;
  }

  if (isCoffeeMachineDevice(device)) {
    if (name === 'START_BREW') return 20;
    if (name === 'TURN_ON') return 5;
  }

  return null;
}

export function commandButtonKey(device, command) {
  return `${device.id.objectId}:${command.name}`;
}

export async function loadDevicesDashboard() {
  const objects = await ambientApi.getAllObjects();
  const list = Array.isArray(objects) ? objects : [];
  const devices = list.filter((o) => !isProduct(o));
  const products = list.filter(isProduct);

  const devicesWithContents = await Promise.all(
    devices.map(async (device) => {
      try {
        const children = await ambientApi.getChildren({ parentObjectId: device.id.objectId });
        return {
          ...device,
          contents: Array.isArray(children) ? children : [],
        };
      } catch {
        return { ...device, contents: [] };
      }
    })
  );

  return { devices: devicesWithContents, products };
}

export async function getDeviceDetails({ objectId }) {
  const [device, children, parents] = await Promise.all([
    ambientApi.getObject({ objectId }),
    ambientApi.getChildren({ parentObjectId: objectId }).catch(() => []),
    ambientApi.getParents({ childObjectId: objectId }).catch(() => []),
  ]);

  return {
    device,
    contents: Array.isArray(children) ? children : [],
    parents: Array.isArray(parents) ? parents : [],
  };
}

export async function invokeDeviceCommand({ user, device, command }) {
  return ambientApi.invokeCommand({
    commandBoundary: {
      command: command.name,
      targetObject: buildTarget(device.id.objectId),
      invokedBy: buildInvoker(user),
      commandAttributes: {
        source: 'smart-devices-ui',
        label: command.label,
      },
    },
  });
}

export async function findRefrigerator() {
  const objects = await ambientApi.getAllObjects();
  const list = Array.isArray(objects) ? objects : [];
  return (
    list.find((o) => o.alias === 'Refrigerator') ||
    list.find((o) => o.type === 'CONTAINER' && /fridge|refrigerator|מקרר/i.test(o.alias || '')) ||
    list.find((o) => o.type === 'CONTAINER') ||
    null
  );
}

export async function loadFridgeData() {
  const fridge = await findRefrigerator();
  if (!fridge?.id?.objectId) {
    return { fridge: null, products: [], allProducts: [] };
  }

  const [children, allObjects] = await Promise.all([
    ambientApi.getChildren({ parentObjectId: fridge.id.objectId }),
    ambientApi.getAllObjects(),
  ]);

  const kids = Array.isArray(children) ? children : [];
  const all = Array.isArray(allObjects) ? allObjects : [];
  const products = kids.filter((o) => o.type === 'PRODUCT');

  return { fridge, products, allProducts: all.filter((o) => o.type === 'PRODUCT') };
}

export async function openFridgeDoor({ user, fridge }) {
  return ambientApi.invokeCommand({
    commandBoundary: {
      command: 'OPEN_DOOR',
      targetObject: buildTarget(fridge.id.objectId),
      invokedBy: buildInvoker(user),
      commandAttributes: { source: 'smart-fridge-ui' },
    },
  });
}

export async function markProductStatus({ objectId, status }) {
  return ambientApi.updateObject({
    objectId,
    payload: { status },
  });
}

export async function addProductToFridge({ user, fridge, alias, status = 'AVAILABLE' }) {
  return addItemToDevice({ user, device: fridge, alias, status });
}

export async function addItemToDevice({ user, device, alias, status = 'AVAILABLE' }) {
  const created = await ambientApi.createObject({
    type: 'PRODUCT',
    alias: alias.trim(),
    status,
    active: true,
    objectDetails: { addedAt: new Date().toISOString() },
    createdBy: { userId: buildInvoker(user).userId },
  });

  await ambientApi.bindChild({
    parentObjectId: device.id.objectId,
    childObjectId: created.id.objectId,
  });

  return created;
}

export function statusLabel(status) {
  if (!status) return 'לא ידוע';
  const map = {
    AVAILABLE: 'זמין',
    CONSUMED: 'נגמר',
    ACTIVE: 'פעיל',
    READY: 'מוכן',
    ON: 'פועל',
    OFF: 'כבוי',
  };
  return map[status.toUpperCase()] || status;
}

export function statusClass(status) {
  if (!status) return 'status-unknown';
  const s = status.toUpperCase();
  if (s === 'AVAILABLE' || s === 'ACTIVE' || s === 'ON' || s === 'READY') return 'status-ok';
  if (s === 'CONSUMED' || s === 'OFF') return 'status-warn';
  return 'status-neutral';
}
