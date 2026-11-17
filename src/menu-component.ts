/**
 * Menu state shared by the runtime and the editor inspector.
 *
 * Declared here (system-free) and registered from src/components.ts so the
 * scene can author explicit starting values for the menu and each world pod.
 */

import { createComponent, Types } from '@iwsdk/core';

/**
 * Marks a clickable world pod or its nameplate. The menu system reads
 * gameIndex on press, so pods and plates share one component and one query.
 */
export const GamePod = createComponent('GamePod', {
  gameIndex: {
    type: Types.Int8,
    default: 0,
    min: 0,
    max: 3,
    label: 'World Index',
    help: '0 Fractured Laws, 1 Save Earth, 2 Learn AI, 3 Roadmap.',
  },
});

/** Which world the platform menu currently has selected. */
export const MenuSelection = createComponent('MenuSelection', {
  selectedSlot: {
    type: Types.Int8,
    default: 0,
    min: 0,
    max: 3,
    label: 'Selected World',
  },
});
