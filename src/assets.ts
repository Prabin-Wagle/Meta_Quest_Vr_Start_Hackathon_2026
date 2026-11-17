/**
 * NEXUS asset manifest.
 *
 * The runtime and the editor each import this module in their own realm, so it
 * must stay deterministic and side-effect free: no World, DOM or timers.
 */

import { AssetType, defineAssets } from '@iwsdk/core';
import {
  createApprenticeCharacter,
  createSproutCharacter,
  createSynapseCharacter,
} from './scene-assets/characters.scene-asset.js';
import {
  createMenuPlatform,
  createVoidShard,
} from './scene-assets/menu.scene-asset.js';

const publicAssetUrl = (filePath: string): string =>
  `${import.meta.env.BASE_URL}${filePath.replace(/^\/+/u, '')}`;

const uikitml = (fileName: string, name: string) => ({
  url: publicAssetUrl(`ui/${fileName}`),
  type: AssetType.UIKitML,
  name,
});

export default defineAssets({
  'menu-platform': createMenuPlatform(),
  'void-shard': createVoidShard(),
  'character-fracture': createApprenticeCharacter(),
  'character-earth': createSproutCharacter(),
  'character-ai': createSynapseCharacter(),
  'main-menu': uikitml('main-menu.uikitml', 'NEXUS Menu'),
  'pod-plate': uikitml('pod-plate.uikitml', 'World Nameplate'),
});
