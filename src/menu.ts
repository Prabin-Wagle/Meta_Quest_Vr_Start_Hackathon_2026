/**
 * NEXUS platform menu.
 *
 * Three worlds stand on the platform as low-poly characters. Aiming at a
 * character (or its nameplate) selects that world and updates the detail panel;
 * pressing it again runs the world's action. The panel, the plates and the
 * mascots all read from the single GAMES table below.
 */

import {
  createSystem,
  type Entity,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
  Pressed,
  UIKit,
  UIKitMLAsset,
  VisibilityState,
} from '@iwsdk/core';
import { GamePod, MenuSelection } from './menu-component.js';

interface GameDef {
  key: string;
  slot: number;
  /** Copy for the detail strip. */
  eyebrow: string;
  title: string;
  blurb: string;
  /** Element id of the pre-typeset formula block for this world. */
  formulaBlock: string;
  progress: string;
  /** Copy for the nameplate under the mascot. */
  shortName: string;
  tag: string;
  state: string;
  /** A world with no built islands still opens its detail, not its content. */
  playable: boolean;
  status: string;
  enterNote: string;
}

const GAMES: GameDef[] = [
  {
    key: 'fracture',
    slot: 0,
    eyebrow: 'WORLD 01 // CLASSICAL MECHANICS',
    title: 'Fractured Laws',
    blurb:
      'A fracture broke six laws of physics across six floating islands. Rebuild every machine, collect the Law Cores and find out who broke them on purpose.',
    formulaBlock: 'formula-fracture',
    progress: '6 islands / 0 of 6 Law Cores',
    shortName: 'FRACTURED LAWS',
    tag: 'CLASSICAL MECHANICS',
    state: 'PLAY',
    playable: true,
    status: 'Every machine can be fixed more than one way.',
    enterNote: 'Launching Fractured Laws…',
  },
  {
    key: 'earth',
    slot: 1,
    eyebrow: 'WORLD 02 // ENVIRONMENT AND CLIMATE',
    title: 'Save Earth',
    blurb:
      'Balance a planet that is running out of margin. Tune the carbon budget, restore habitats and keep the climate inside the band that life can survive.',
    formulaBlock: 'formula-earth',
    progress: '4 biomes / carbon budget balanced',
    shortName: 'SAVE EARTH',
    tag: 'ENVIRONMENT & CLIMATE',
    state: 'PLAY',
    playable: true,
    status: 'Restore the planet, one biome at a time.',
    enterNote: 'Launching Save Earth…',
  },
  {
    key: 'ai',
    slot: 2,
    eyebrow: 'WORLD 03 // ARTIFICIAL INTELLIGENCE',
    title: 'Learn AI',
    blurb:
      'Train a mind you can watch. Feed it examples, adjust the weights and see why a model guesses right, guesses wrong, or copies you instead of learning.',
    formulaBlock: 'formula-ai',
    progress: '3 models / backprop sandbox open',
    shortName: 'LEARN AI',
    tag: 'ARTIFICIAL INTELLIGENCE',
    state: 'PLAY',
    playable: true,
    status: 'Teach a model. Then watch it make mistakes you can fix.',
    enterNote: 'Launching Learn AI…',
  },
];

/** Worlds that are planned but not yet built. */
const ROADMAP: { key: string; shortName: string; note: string }[] = [
  { key: 'bio', shortName: 'BIO', note: 'cells & systems' },
  { key: 'solar', shortName: 'SOLAR', note: 'the inner system' },
  { key: 'chem', shortName: 'CHEM', note: 'reactions & bonds' },
];

const PLATE_BG = '#101A2B';
const PLATE_BG_SELECTED = '#1D3350';
const PLATE_BORDER = '#24344C';
const PLATE_BORDER_SELECTED = '#5FD3C4';
const NAME_READY = '#EEF3FA';
const NAME_DIM = '#8FA3BD';
const ACTION_BG = '#5FD3C4';
const ACTION_TEXT = '#06131A';
const ACTION_BG_SOON = '#1A2536';
const ACTION_TEXT_SOON = '#7E93AE';
const ACTION_BG_DONE = '#F2C14E';

const POD_COUNT = GAMES.length;
const SHARD_COUNT = 10;

interface PlateView {
  slot: number;
  root: UIKit.Text | null;
  name: UIKit.Text | null;
  tag: UIKit.Text | null;
  state: UIKit.Text | null;
  num: UIKit.Text | null;
}

interface PodView {
  slot: number;
  object: Object3D;
  character: Object3D | null;
  baseY: number;
  phase: number;
  glow: MeshStandardMaterial | null;
}

interface ShardView {
  object: Object3D;
  baseY: number;
  phase: number;
}

export class MenuSystem extends createSystem({
  menu: { required: [MenuSelection] },
  pressedPod: { required: [GamePod, Pressed] },
}) {
  private panel: UIKitMLAsset | null = null;
  private plates: PlateView[] = [];
  private pods: PodView[] = [];
  private shards: ShardView[] = [];
  private selected = GAMES[0];

  private detailIndex: UIKit.Text | null = null;
  private detailTitle: UIKit.Text | null = null;
  private detailBody: UIKit.Text | null = null;
  private formulaBlocks: { id: string; el: UIKit.Text }[] = [];
  private progressEl: UIKit.Text | null = null;
  private actionEl: UIKit.Text | null = null;
  private statusEl: UIKit.Text | null = null;
  private roadmapEl: UIKit.Text | null = null;

  init(): void {
    this.panel = this.world.getSceneObject<UIKitMLAsset>('main-menu') ?? null;
    if (this.panel == null) {
      console.warn('[menu] main-menu panel is missing from the scene');
      return;
    }

    this.resolveDetail();
    this.resolvePlates();
    this.resolvePods();
    this.resolveShards();
    this.wireControls();

    const menuEntity = this.queries.menu.entities.values().next().value;
    const startSlot = menuEntity?.getValue(MenuSelection, 'selectedSlot') ?? 0;
    this.select(GAMES[startSlot] ?? GAMES[0]);
  }

  update(delta: number, time: number): void {
    for (let index = 0; index < this.pods.length; index += 1) {
      const pod = this.pods[index];
      if (pod.character == null) continue;
      pod.character.position.y =
        pod.baseY + Math.sin(time * 0.9 + pod.phase) * 0.018;
      pod.character.rotation.y = Math.sin(time * 0.35 + pod.phase) * 0.22;
    }

    for (let index = 0; index < this.shards.length; index += 1) {
      const shard = this.shards[index];
      shard.object.rotation.y += delta * 0.22;
      shard.object.rotation.x += delta * 0.09;
      shard.object.position.y =
        shard.baseY + Math.sin(time * 0.45 + shard.phase) * 0.12;
    }
  }

  private element(id: string): UIKit.Text | null {
    return this.panel?.getElementById<UIKit.Text>(id) ?? null;
  }

  private resolveDetail(): void {
    this.detailIndex = this.element('detail-index');
    this.detailTitle = this.element('detail-title');
    this.detailBody = this.element('detail-body');
    for (const game of GAMES) {
      const el = this.element(game.formulaBlock);
      if (el != null) this.formulaBlocks.push({ id: game.formulaBlock, el });
    }
    this.progressEl = this.element('progress');
    this.actionEl = this.element('action-btn');
    this.statusEl = this.element('status-msg');
    this.roadmapEl = this.element('roadmap-list');

    // Populate the roadmap (future plan) list once.
    if (this.roadmapEl != null) {
      this.roadmapEl.setProperties({
        text: ROADMAP.map((item) => `${item.shortName} — ${item.note}`).join('  •  '),
      });
    }

    if (this.actionEl != null) this.actionEl.name = 'ActionBtn';
    if (this.statusEl != null) this.statusEl.name = 'StatusMsg';
  }

  private resolvePlates(): void {
    for (const game of GAMES) {
      const plate = this.world.getSceneObject<UIKitMLAsset>(
        `plate-${game.key}`,
      );
      if (plate == null) {
        console.warn(`[menu] missing nameplate plate-${game.key}`);
        continue;
      }
      const view: PlateView = {
        slot: game.slot,
        root: plate.getElementById<UIKit.Text>('plate-root') ?? null,
        name: plate.getElementById<UIKit.Text>('plate-name') ?? null,
        tag: plate.getElementById<UIKit.Text>('plate-tag') ?? null,
        state: plate.getElementById<UIKit.Text>('plate-state') ?? null,
        num: plate.getElementById<UIKit.Text>('plate-num') ?? null,
      };
      view.num?.setProperties({ text: `0${game.slot + 1}` });
      view.name?.setProperties({ text: game.shortName });
      view.tag?.setProperties({ text: game.tag });
      view.state?.setProperties({ text: game.state });
      view.name?.setProperties({ color: game.playable ? NAME_READY : NAME_DIM });
      this.plates.push(view);
    }
  }

  private resolvePods(): void {
    for (const game of GAMES) {
      const object = this.world.getSceneObject<Object3D>(`pod-${game.key}`);
      if (object == null) {
        console.warn(`[menu] missing world pod pod-${game.key}`);
        continue;
      }
      const character = object.getObjectByName('character') ?? null;
      // Each placement shares the prototype materials, so the accent ring is
      // cloned once per pod before its emissive intensity changes.
      const glowMesh = object.getObjectByName('glow');
      let glow: MeshStandardMaterial | null = null;
      if (glowMesh instanceof Mesh) {
        const source = Array.isArray(glowMesh.material)
          ? glowMesh.material[0]
          : glowMesh.material;
        const clone = source.clone();
        glowMesh.material = clone;
        if (clone instanceof MeshStandardMaterial) glow = clone;
      }
      this.pods.push({
        slot: game.slot,
        object,
        character,
        baseY: character?.position.y ?? 0,
        phase: game.slot * 1.1,
        glow,
      });
    }
  }

  private resolveShards(): void {
    for (let index = 0; index < SHARD_COUNT; index += 1) {
      const object = this.world.getSceneObject<Object3D>(
        `void-shard-${String(index + 1).padStart(2, '0')}`,
      );
      if (object == null) continue;
      this.shards.push({
        object,
        baseY: object.position.y,
        phase: index * 0.7,
      });
    }
  }

  private wireControls(): void {
    this.cleanupFuncs.push(
      this.queries.pressedPod.subscribe('qualify', (entity) =>
        this.onPodPressed(entity),
      ),
    );

    if (this.actionEl != null) {
      const onAction = () => this.enterWorld();
      this.actionEl.addEventListener('click', onAction);
      this.cleanupFuncs.push(() =>
        this.actionEl?.removeEventListener('click', onAction),
      );
    }

    const xrButton = this.element('xr-button');
    const exitButton = this.element('exit-button');

    if (!this.world.xrEnabled) {
      xrButton?.setProperties({ display: 'none' });
      exitButton?.setProperties({ display: 'none' });
      return;
    }

    const launchXR = () => this.world.launchXR();
    const exitXR = () => this.world.exitXR();
    xrButton?.addEventListener('click', launchXR);
    exitButton?.addEventListener('click', exitXR);
    if (xrButton != null) {
      this.cleanupFuncs.push(() =>
        xrButton.removeEventListener('click', launchXR),
      );
    }
    if (exitButton != null) {
      this.cleanupFuncs.push(() =>
        exitButton.removeEventListener('click', exitXR),
      );
    }

    this.cleanupFuncs.push(
      this.world.visibilityState.subscribe((visibilityState) => {
        const inBrowser = visibilityState === VisibilityState.NonImmersive;
        xrButton?.setProperties({ display: inBrowser ? 'flex' : 'none' });
        exitButton?.setProperties({ display: inBrowser ? 'none' : 'flex' });
      }),
    );
  }

  private onPodPressed(entity: Entity): void {
    const slot = entity.getValue(GamePod, 'gameIndex') ?? -1;
    const game = GAMES[slot];
    if (game == null) return;
    if (game.slot === this.selected.slot) {
      this.enterWorld();
      return;
    }
    this.select(game);
  }

  private select(game: GameDef): void {
    this.selected = game;

    this.detailIndex?.setProperties({ text: game.eyebrow });
    this.detailTitle?.setProperties({ text: game.title });
    this.detailBody?.setProperties({ text: game.blurb });
    for (const block of this.formulaBlocks) {
      block.el.setProperties({
        display: block.id === game.formulaBlock ? 'flex' : 'none',
      });
    }
    this.progressEl?.setProperties({ text: game.progress });
    this.actionEl?.setProperties({
      text: game.playable ? 'Enter World' : 'In Build',
      backgroundColor: game.playable ? ACTION_BG : ACTION_BG_SOON,
      color: game.playable ? ACTION_TEXT : ACTION_TEXT_SOON,
    });
    this.setStatus(game.status);

    for (const plate of this.plates) {
      const selected = plate.slot === game.slot;
      const dim = !selected && !GAMES[plate.slot].playable;
      plate.root?.setProperties({
        backgroundColor: selected ? PLATE_BG_SELECTED : PLATE_BG,
        borderColor: selected ? PLATE_BORDER_SELECTED : PLATE_BORDER,
      });
      plate.name?.setProperties({
        color: selected ? NAME_READY : dim ? NAME_DIM : '#D5E1F0',
      });
      plate.state?.setProperties({ color: selected ? '#5FD3C4' : '#8AA0BA' });
    }

    for (const pod of this.pods) {
      const selected = pod.slot === game.slot;
      pod.object.scale.setScalar(selected ? 1.06 : 1);
      if (pod.glow != null) pod.glow.emissiveIntensity = selected ? 1.3 : 0.3;
    }

    const menuEntity = this.queries.menu.entities.values().next().value;
    menuEntity?.setValue(MenuSelection, 'selectedSlot', game.slot);
  }

  private enterWorld(): void {
    const game = this.selected;
    this.actionEl?.setProperties({
      text: 'Loading…',
      backgroundColor: ACTION_BG_DONE,
      color: ACTION_TEXT,
    });
    this.setStatus(game.enterNote);
  }

  private setStatus(text: string): void {
    this.statusEl?.setProperties({ text });
  }
}
