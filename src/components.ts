/**
 * Component manifest shared by the runtime and the editor inspector.
 * Keep this module free of systems, DOM and renderer imports.
 */

import { defineComponents } from '@iwsdk/core';
import { GamePod, MenuSelection } from './menu-component.js';

export default defineComponents([GamePod, MenuSelection]);
