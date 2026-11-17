/**
 * The three world mascots of the NEXUS menu: one simple low-poly character
 * per game, each standing on a matching pedestal.
 *
 * Each factory returns a parentless Group whose origin is at floor contact.
 * Named children the menu system relies on:
 *   'character' — the mascot, bobbed while the menu is open
 *   'glow'      — the pedestal accent ring, brightened when selected
 *
 * Keep this module free of World, DOM and timers: the runtime and the editor
 * each evaluate it in their own realm.
 */

import {
  BoxGeometry,
  BufferGeometry,
  CylinderGeometry,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  OctahedronGeometry,
  SphereGeometry,
  TorusGeometry,
} from '@iwsdk/core';

const PEDESTAL_HEIGHT = 0.42;

const pedestalMaterial = new MeshStandardMaterial({
  color: '#111B2B',
  roughness: 0.82,
  metalness: 0.22,
  flatShading: true,
});

/** Clay apprentice: warm stone body, teal apprentice markings. */
const clay = new MeshStandardMaterial({
  color: '#E6DAC4',
  roughness: 0.88,
  flatShading: true,
});
const clayDark = new MeshStandardMaterial({
  color: '#B9A88C',
  roughness: 0.92,
  flatShading: true,
});
const tealGlow = new MeshStandardMaterial({
  color: '#0B1B22',
  roughness: 0.4,
  metalness: 0.2,
  emissive: '#43DFCB',
  emissiveIntensity: 1.15,
});

/** Sprout: mossy body, bright leaf, exposed soil. */
const sproutGreen = new MeshStandardMaterial({
  color: '#6FB45F',
  roughness: 0.82,
  flatShading: true,
});
const leafGreen = new MeshStandardMaterial({
  color: '#A8D96F',
  roughness: 0.68,
  flatShading: true,
});
const soil = new MeshStandardMaterial({
  color: '#4A3B2E',
  roughness: 0.96,
  flatShading: true,
});
const eyeDark = new MeshStandardMaterial({
  color: '#16202B',
  roughness: 0.45,
});

/** Synapse: a floating violet core inside three rings. */
const violet = new MeshStandardMaterial({
  color: '#7B5BD6',
  roughness: 0.32,
  emissive: '#8B6BF0',
  emissiveIntensity: 0.75,
  flatShading: true,
});
const cageMaterial = new MeshStandardMaterial({
  color: '#0E1624',
  roughness: 0.4,
  metalness: 0.5,
  emissive: '#A98BF5',
  emissiveIntensity: 0.55,
});

function glowMaterial(color: string): MeshStandardMaterial {
  return new MeshStandardMaterial({
    color: '#0A121B',
    roughness: 0.35,
    metalness: 0.3,
    emissive: color,
    emissiveIntensity: 0.35,
  });
}

function mesh(
  geometry: BufferGeometry,
  material: MeshStandardMaterial,
  x = 0,
  y = 0,
  z = 0,
): Mesh {
  const next = new Mesh(geometry, material);
  next.position.set(x, y, z);
  return next;
}

/** Low twelve-sided plinth with a glowing accent ring near the top. */
function pedestal(accent: string): Group {
  const group = new Group();

  const base = mesh(
    new CylinderGeometry(0.44, 0.5, 0.3, 12),
    pedestalMaterial,
    0,
    0.15,
  );
  const top = mesh(
    new CylinderGeometry(0.42, 0.42, 0.12, 12),
    pedestalMaterial,
    0,
    0.36,
  );
  const band = mesh(
    new CylinderGeometry(0.425, 0.44, 0.02, 12),
    pedestalMaterial,
    0,
    0.3,
  );
  const glow = mesh(new TorusGeometry(0.4, 0.014, 6, 48), glowMaterial(accent));
  glow.name = 'glow';
  glow.rotation.x = Math.PI / 2;
  glow.position.y = PEDESTAL_HEIGHT + 0.002;

  group.add(base, top, band, glow);
  return group;
}

/** Character group seated on the pedestal; the system bobs this child. */
function characterGroup(): Group {
  const character = new Group();
  character.name = 'character';
  character.position.y = PEDESTAL_HEIGHT;
  return character;
}

/**
 * WORLD 01 - Fractured Laws. A small clay apprentice with a visor and a
 * glowing core in its chest.
 */
export function createApprenticeCharacter(): Group {
  const root = new Group();
  root.add(pedestal('#43DFCB'));

  const character = characterGroup();

  character.add(
    mesh(new BoxGeometry(0.075, 0.14, 0.075), clayDark, -0.062, 0.07),
    mesh(new BoxGeometry(0.075, 0.14, 0.075), clayDark, 0.062, 0.07),
    mesh(new CylinderGeometry(0.085, 0.115, 0.28, 6), clay, 0, 0.27),
    mesh(new IcosahedronGeometry(0.12, 0), clay, 0, 0.52),
    mesh(new BoxGeometry(0.17, 0.05, 0.03), tealGlow, 0, 0.545, 0.082),
    mesh(new OctahedronGeometry(0.05, 0), clayDark, -0.145, 0.32),
    mesh(new OctahedronGeometry(0.05, 0), clayDark, 0.145, 0.32),
    mesh(new OctahedronGeometry(0.045, 0), tealGlow, 0, 0.3, 0.078),
  );

  root.add(character);
  return root;
}

/**
 * WORLD 02 - Save Earth. A rounded sprout body with two leaves, an orbit ring
 * and stubby soil feet.
 */
export function createSproutCharacter(): Group {
  const root = new Group();
  root.add(pedestal('#8FDC6A'));

  const character = characterGroup();

  const body = mesh(new IcosahedronGeometry(0.19, 0), sproutGreen, 0, 0.24);
  body.scale.set(1, 0.95, 1);

  const stalk = mesh(new CylinderGeometry(0.016, 0.022, 0.15, 5), leafGreen, 0, 0.45);

  const leafLeft = mesh(new OctahedronGeometry(0.1, 0), leafGreen, -0.1, 0.5);
  leafLeft.scale.set(1.6, 0.3, 0.8);
  leafLeft.rotation.z = -0.55;

  const leafRight = mesh(new OctahedronGeometry(0.1, 0), leafGreen, 0.11, 0.54);
  leafRight.scale.set(2.1, 0.32, 0.9);
  leafRight.rotation.z = 0.4;

  const orbit = mesh(new TorusGeometry(0.27, 0.012, 6, 40), glowMaterial('#8FDC6A'));
  orbit.rotation.set(1.25, 0, 0.32);
  orbit.position.y = 0.24;

  character.add(
    mesh(new CylinderGeometry(0.17, 0.11, 0.06, 8), soil, 0, 0.03),
    body,
    mesh(new SphereGeometry(0.03, 8, 6), eyeDark, -0.068, 0.27, 0.155),
    mesh(new SphereGeometry(0.03, 8, 6), eyeDark, 0.068, 0.27, 0.155),
    orbit,
    stalk,
    leafLeft,
    leafRight,
  );

  root.add(character);
  return root;
}

/**
 * WORLD 03 - Learn AI. A hovering violet core held inside three thin rings,
 * with a small thruster pad underneath so it still reads as placed.
 */
export function createSynapseCharacter(): Group {
  const root = new Group();
  root.add(pedestal('#9C7BF5'));

  const character = characterGroup();

  const pad = mesh(new CylinderGeometry(0.15, 0.2, 0.03, 10), cageMaterial, 0, 0.02);
  const core = mesh(new OctahedronGeometry(0.15, 0), violet, 0, 0.3);

  const ringA = mesh(new TorusGeometry(0.235, 0.008, 6, 40), cageMaterial, 0, 0.3);
  const ringB = mesh(new TorusGeometry(0.215, 0.008, 6, 40), cageMaterial, 0, 0.3);
  ringB.rotation.set(1.05, 0.4, 0);
  const ringC = mesh(new TorusGeometry(0.2, 0.008, 6, 40), cageMaterial, 0, 0.3);
  ringC.rotation.set(0.5, 0, 1.2);

  character.add(
    pad,
    core,
    ringA,
    ringB,
    ringC,
    mesh(new OctahedronGeometry(0.028, 0), violet, 0.235, 0.3),
    mesh(new OctahedronGeometry(0.026, 0), violet, -0.12, 0.44, 0.16),
  );

  root.add(character);
  return root;
}
