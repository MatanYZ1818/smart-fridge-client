import * as ambientApi from './ambientApi';
import { CONFIG } from '../config';
import {
  matchesCoffee,
  matchesDishwasher,
  matchesFridge,
  matchesOven,
  matchesStorage,
} from './deviceAliases';
import { commandLabels, deviceDescriptions, statusLabels, ui } from '../strings/he';

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
  if (matchesFridge(alias) || category === 'cold-storage') return '🧊';
  if (matchesOven(alias) || category === 'cooking') return '🔥';
  if (matchesCoffee(alias) || category === 'drink-maker') return '☕';
  if (matchesDishwasher(alias) || category === 'cleaning') return '🍽️';
  if (matchesStorage(alias) || category === 'storage') return '📦';
  return '⚙️';
}

export function deviceDescription(object) {
  const category = object?.objectDetails?.category;
  if (category && deviceDescriptions[category]) {
    return deviceDescriptions[category];
  }
  return ui.defaultDeviceDescription;
}

export function getAvailableCommands(object) {
  const commands = object?.objectDetails?.availableCommands;
  if (Array.isArray(commands) && commands.length > 0) {
    return commands.map((cmd) => (
      typeof cmd === 'string'
        ? { name: cmd, label: commandLabel(cmd) }
        : { ...cmd, label: commandLabel(cmd.name) }
    ));
  }

  if (isContainer(object)) {
    return [
      { name: 'OPEN_DOOR', label: commandLabels.OPEN_DOOR },
      { name: 'CHECK_CONTENTS', label: commandLabels.CHECK_CONTENTS },
    ];
  }

  return [
    { name: 'TURN_ON', label: commandLabels.TURN_ON },
    { name: 'TURN_OFF', label: commandLabels.TURN_OFF },
  ];
}

export function commandLabel(commandName) {
  return commandLabels[commandName] || commandName;
}

export function isDishwasherDevice(device) {
  const category = device?.objectDetails?.category;
  const alias = device?.alias || '';
  return category === 'cleaning' || matchesDishwasher(alias);
}

export function isCoffeeMachineDevice(device) {
  const category = device?.objectDetails?.category;
  const alias = device?.alias || '';
  return category === 'drink-maker' || matchesCoffee(alias);
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
    list.find((o) => o.type === 'CONTAINER' && matchesFridge(o.alias || '')) ||
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
  if (!status) return ui.unknownStatus;
  return statusLabels[status.toUpperCase()] || status;
}

export function statusClass(status) {
  if (!status) return 'status-unknown';
  const s = status.toUpperCase();
  if (s === 'AVAILABLE' || s === 'ACTIVE' || s === 'ON' || s === 'READY') return 'status-ok';
  if (s === 'CONSUMED' || s === 'OFF') return 'status-warn';
  return 'status-neutral';
}
