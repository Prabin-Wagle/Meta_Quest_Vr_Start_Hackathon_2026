/**
 * NEXUS menu set: the exam platform the player stands on, and the drifting
 * void shards that give the dark backdrop some depth.
 *
 * Registered in src/assets.ts and placed by public/scenes/main.iwsdk.scene.json.
 * Keep this module free of World, DOM and timers: the runtime and the editor
 * each evaluate it in their own realm.
 */

import {
  createSceneMaterial,
  createScenePrimitiveObject,
  Group,
  Mesh,
  MeshStandardMaterial,
  OctahedronGeometry,
} from '@iwsdk/core';

/** Dark slate the platform is cut from. */
const plateMaterial = createSceneMaterial({
  id: 'nexus-plate',
  model: 'standard',
  baseColor: '#0E1624',
  roughness: 0.84,
  metalness: 0.18,
});

/** Faint teal inlays. Kept dim so the panel stays the brightest surface. */
const inlayMaterial = createSceneMaterial({
  id: 'nexus-inlay',
  model: 'standard',
  baseColor: '#0A1018',
  roughness: 0.5,
  metalness: 0.4,
  emissive: '#37C7B4',
  emissiveIntensity: 0.45,
});

/** Brighter teal for the outer rim, which reads as the platform edge. */
const rimMaterial = createSceneMaterial({
  id: 'nexus-rim',
  model: 'standard',
  baseColor: '#0B121C',
  roughness: 0.35,
  metalness: 0.5,
  emissive: '#48E0CB',
  emissiveIntensity: 0.7,
});

/** Broken-off world debris drifting in the void. */
const voidMaterial = new MeshStandardMaterial({
  color: '#16202F',
  roughness: 0.75,
  metalness: 0.25,
  emissive: '#2C6E86',
  emissiveIntensity: 0.14,
  flatShading: true,
});

/**
 * Circular exam plate, origin at floor contact so the player stands on y = 0.
 * A rising cone of slab, two dim rings, radial spokes and a bright outer rim.
 * The scene fades the outer edge into the void with DomeFade.
 */
export function createMenuPlatform(
  radius = 6,
  thickness = 0.36,
  spokes = 12,
): Group {
  const platform = new Group();

  const plate = createScenePrimitiveObject(
    {
      geometry: {
        type: 'cylinder',
        radiusTop: radius,
        radiusBottom: radius * 0.92,
        height: thickness,
        segments: 96,
      },
    },
    plateMaterial,
  );
  plate.position.y = -thickness / 2;
  platform.add(plate);

  // Rings that frame the standing area without crowding the player's feet.
  const rings: [number, number][] = [
    [2.05, 0.016],
    [3.55, 0.01],
  ];
  for (const [ringRadius, tube] of rings) {
    const ring = createScenePrimitiveObject(
      {
        geometry: {
          type: 'torus',
          radius: ringRadius,
          tube,
          radialSegments: 6,
          tubularSegments: 192,
        },
      },
      inlayMaterial,
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.006;
    platform.add(ring);
  }

  const rim = createScenePrimitiveObject(
    {
      geometry: {
        type: 'torus',
        radius: radius - 0.22,
        tube: 0.022,
        radialSegments: 8,
        tubularSegments: 192,
      },
    },
    rimMaterial,
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.004;
  platform.add(rim);

  // Radial inlays run from the first ring to just inside the rim.
  const inner = 2.2;
  const outer = radius - 0.45;
  const length = outer - inner;
  for (let index = 0; index < spokes; index += 1) {
    const angle = (index / spokes) * Math.PI * 2;
    const spoke = createScenePrimitiveObject(
      { geometry: { type: 'box', size: [0.012, 0.006, length] } },
      inlayMaterial,
    );
    spoke.position.set(
      Math.sin(angle) * (inner + length / 2),
      0.005,
      Math.cos(angle) * (inner + length / 2),
    );
    spoke.rotation.y = angle;
    platform.add(spoke);
  }

  return platform;
}

/**
 * A single facet of broken world, origin at its center so the scene can hang
 * it in the air. The menu system rotates and bobs these.
 */
export function createVoidShard(size = 0.17): Mesh {
  const shard = new Mesh(new OctahedronGeometry(size, 0), voidMaterial);
  shard.scale.set(0.78, 1.4, 0.62);
  return shard;
}
