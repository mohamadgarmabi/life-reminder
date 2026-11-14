import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { LANE_WIDTH, LANES, POOL, VEHICLES, type Traffic, type Weather } from '#/modules/games/utils/traffic'

/** Served from public/, cached by the service worker on first play (see vite.config.ts). */
const ASSETS = `${import.meta.env.BASE_URL}game-assets/traffic/`

/** Two lanes each way of the centre line plus a 1 m shoulder. */
const ROAD_HALF = 2 * LANE_WIDTH + 1
const ROAD_LENGTH = 700
/** The road starts this far behind the camera. */
const ROAD_BEHIND = 60
const DASH_PERIOD = 12 // 3 m paint, 9 m gap: highway standard
const POST_GAP = 4
const LAMP_GAP = 60
const TERRAIN_PERIOD = 480
const TERRAIN_LENGTH = TERRAIN_PERIOD * 3
const GRASS_TILE = 24
const ASPHALT_TILE = 4

type Options = {
  night: boolean
  weather: Weather
  /** Index into VEHICLES. */
  vehicle: number
  paint: string
  touch: boolean
  onProgress: (fraction: number) => void
  onContextLost: () => void
}

/** Fog start/end (m) per weather: rain and snow close the view right down. */
const FOG: Record<Weather, [number, number]> = {
  normal: [140, 1150],
  cloudy: [90, 700],
  rain: [35, 320],
  snow: [25, 260],
}

type CameraView = 'chase' | 'cockpit'

/** Driver's eye in each vehicle, as fractions of (width, height, length); x < 0 = left seat, z < 0 = towards the front. */
const COCKPIT: Record<(typeof VEHICLES)[number]['id'], [number, number, number]> = {
  hatch: [-0.21, 0.74, 0.06],
  sedan: [-0.21, 0.74, 0.08],
  classic: [-0.21, 0.74, 0.08],
  pickup: [-0.21, 0.72, -0.05],
  truck: [-0.22, 0.66, -0.36],
}

type TrafficScene = {
  /** Behind the car, or the driver's seat. */
  setView: (view: CameraView) => void
  /** Runs the render loop (and `step`) while playing; otherwise draws one still frame. */
  setPlaying: (on: boolean) => void
  dispose: () => void
}

/** Brightest pixel = sun direction; rows just above the horizon = fog colour (both in linear HDR). */
/** HDR sun pixels reach tens of thousands; mirrored on clear-coat paint they overflow the half-float buffer and bloom
 * turns the frame black. The directional light carries the sun's power, so reflections only need a bright disc. */
const SKY_CAP = 400

const readSky = (sky: THREE.DataTexture) => {
  const { data, width, height } = sky.image as { data: Float32Array; width: number; height: number }
  let best = -1
  let bestIndex = 0
  for (let i = 0; i < width * height; i++) {
    const lum = data[i * 4] * 0.2126 + data[i * 4 + 1] * 0.7152 + data[i * 4 + 2] * 0.0722
    if (lum > best) {
      best = lum
      bestIndex = i
    }
  }
  // Equirect lookup in three.js: u = atan2(z, x) / 2π + 0.5, v = asin(y) / π + 0.5; HDR rows run top to bottom.
  const toDir = (col: number, row: number) => {
    const phi = ((col + 0.5) / width - 0.5) * Math.PI * 2
    const lat = (0.5 - (row + 0.5) / height) * Math.PI
    return new THREE.Vector3(Math.cos(lat) * Math.cos(phi), Math.sin(lat), Math.cos(lat) * Math.sin(phi))
  }
  const sun = toDir(bestIndex % width, Math.floor(bestIndex / width))
  sun.y = Math.max(sun.y, 0.08)
  sun.normalize()

  const horizon = new THREE.Color(0, 0, 0)
  const from = Math.floor(height * 0.46)
  const to = Math.floor(height * 0.49)
  let n = 0
  for (let row = from; row < to; row++)
    for (let col = 0; col < width; col += 4) {
      const i = (row * width + col) * 4
      horizon.r += data[i]
      horizon.g += data[i + 1]
      horizon.b += data[i + 2]
      n++
    }
  horizon.multiplyScalar(1 / n)
  for (let i = 0; i < data.length; i++) if (data[i] > SKY_CAP) data[i] = SKY_CAP
  sky.needsUpdate = true
  return { sun, horizon }
}

/** Merges a model's meshes per material (local to `root`) so a traffic car costs ~15 draw calls instead of ~60. */
const bake = (root: THREE.Object3D, skip: Set<THREE.Object3D>) => {
  root.updateMatrixWorld(true)
  const inverse = root.matrixWorld.clone().invert()
  const byMaterial = new Map<THREE.Material, THREE.BufferGeometry[]>()
  const visit = (o: THREE.Object3D) => {
    if (skip.has(o)) return
    if (o instanceof THREE.Mesh && !Array.isArray(o.material)) {
      const g = (o.geometry as THREE.BufferGeometry).clone()
      g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse, o.matrixWorld))
      const list = byMaterial.get(o.material) ?? []
      list.push(g)
      byMaterial.set(o.material, list)
    }
    o.children.forEach(visit)
  }
  visit(root)
  const out = new THREE.Group()
  for (const [material, list] of byMaterial) {
    // mergeGeometries needs identical attribute sets and all-or-none indices.
    const shared = Object.keys(list[0].attributes).filter((k) => list.every((g) => k in g.attributes))
    const indexed = list.every((g) => g.index)
    const prepared = list.map((g) => {
      const p = indexed ? g : g.toNonIndexed()
      for (const k of Object.keys(p.attributes)) if (!shared.includes(k)) p.deleteAttribute(k)
      p.morphAttributes = {}
      return p
    })
    const merged = mergeGeometries(prepared, false)
    for (const g of merged ? [merged] : prepared) out.add(new THREE.Mesh(g, material))
  }
  return out
}

/** W-beam guardrail cross-section (x = outwards, y = up), extruded along the road. */
const guardrailGeometry = () => {
  const outer: [number, number][] = [
    [0, 0],
    [0.07, 0.04],
    [0.07, 0.12],
    [0.025, 0.155],
    [0.07, 0.19],
    [0.07, 0.27],
    [0, 0.31],
  ]
  const shape = new THREE.Shape()
  outer.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)))
  for (const [x, y] of [...outer].reverse()) shape.lineTo(x + 0.006, y)
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: ROAD_LENGTH, bevelEnabled: false, steps: 1 })
  geometry.translate(0, 0, -ROAD_LENGTH + ROAD_BEHIND)
  return geometry
}

/** Height of the land: flat by the road, rolling hills further out; periodic in z so it can loop. */
const landHeight = (x: number, z: number) => {
  const away = Math.abs(x)
  const rise = THREE.MathUtils.smoothstep(away, 30, 160)
  const k = (Math.PI * 2) / TERRAIN_PERIOD
  const n =
    0.55 +
    0.25 * Math.sin(x * 0.011 + z * k * 2) +
    0.15 * Math.sin(x * 0.027 - z * k * 5 + 1.3) +
    0.05 * Math.sin(x * 0.07 + z * k * 11)
  return rise * n * (18 + away * 0.06) - 0.06
}

const PRECIP_BOX = { x: 16, top: 11, near: 9, far: -50 }

/** Rain as velocity-aligned streaks, snow as soft drifting points; positions are relative to the player's car. */
const createPrecipitation = (kind: 'rain' | 'snow', touch: boolean, night: boolean) => {
  const count = (kind === 'rain' ? 1600 : 2600) * (touch ? 0.6 : 1)
  const drops = Array.from({ length: count }, () => ({ x: 0, y: 0, z: 0, phase: Math.random() * 6 }))
  const respawn = (d: (typeof drops)[number], anywhere: boolean) => {
    d.x = (Math.random() * 2 - 1) * PRECIP_BOX.x
    d.y = anywhere ? Math.random() * PRECIP_BOX.top : PRECIP_BOX.top
    d.z = anywhere ? PRECIP_BOX.far + Math.random() * (PRECIP_BOX.near - PRECIP_BOX.far) : PRECIP_BOX.far
  }
  drops.forEach((d) => respawn(d, true))
  const fall = kind === 'rain' ? 22 : 1.3
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * (kind === 'rain' ? 6 : 3))
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  let object: THREE.Object3D
  if (kind === 'rain') {
    object = new THREE.LineSegments(
      geometry,
      new THREE.LineBasicMaterial({ color: night ? '#7d8796' : '#c4ccd6', transparent: true, opacity: 0.4 }),
    )
  } else {
    const dot = document.createElement('canvas')
    dot.width = dot.height = 32
    const g = dot.getContext('2d')!
    const soft = g.createRadialGradient(16, 16, 0, 16, 16, 16)
    soft.addColorStop(0, 'rgba(255,255,255,1)')
    soft.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = soft
    g.fillRect(0, 0, 32, 32)
    object = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        map: new THREE.CanvasTexture(dot),
        size: 0.11,
        transparent: true,
        depthWrite: false,
        color: night ? '#c9d2e0' : '#ffffff',
      }),
    )
  }
  object.frustumCulled = false
  const update = (dt: number, speed: number, time: number) => {
    // Streak along the drop's motion relative to the car: down, and towards the camera as we drive.
    const len = Math.hypot(fall, speed) || 1
    const sx = (fall / len) * 0.7
    const sz = (speed / len) * 0.7
    drops.forEach((d, i) => {
      d.y -= fall * dt
      d.z += speed * dt
      if (kind === 'snow') d.x += Math.sin(time * 1.3 + d.phase) * 0.4 * dt
      if (d.y < 0 || d.z > PRECIP_BOX.near) respawn(d, false)
      if (kind === 'rain') {
        positions.set([d.x, d.y, d.z, d.x, d.y + sx, d.z - sz], i * 6)
      } else positions.set([d.x, d.y, d.z], i * 3)
    })
    geometry.attributes.position.needsUpdate = true
  }
  update(0, 0, 0)
  return { object, update }
}

/** Part names that mark a model's front or back; used to point every model's nose at -z. */
const FRONT_PART = /head ?light|hood|bumper_?front|front_?bumper|grill|bull ?bar|cabin/i
const REAR_PART = /tail ?light|stop ?light|reverse|bumper_?rear|rear|trunk|exhaust|box/i
/** Realistic car colours; multiplied over the models' white paint texture. */
const PAINTS = ['#f4f4f2', '#b9bcc0', '#1c1d20', '#4a4e54', '#1f3a68', '#8e1520', '#cbbd9a', '#2d4a3a', '#6d7a86']

const isAncestor = (a: THREE.Object3D, b: THREE.Object3D) => {
  for (let p = b.parent; p; p = p.parent) if (p === a) return true
  return false
}

const createTrafficScene = async (
  host: HTMLElement,
  getGame: () => Traffic,
  step: (dt: number) => void,
  { night, weather, vehicle, paint: playerPaint, touch, onProgress, onContextLost }: Options,
): Promise<TrafficScene> => {
  const dark = night
  const overcast = weather !== 'normal'
  // Phones: lower resolution, smaller shadows, no MSAA; same look otherwise.
  const quality = touch
    ? { pixelRatio: Math.min(devicePixelRatio, 1.5), shadow: 1024, msaa: 0 }
    : { pixelRatio: Math.min(devicePixelRatio, 2), shadow: 2048, msaa: 4 }

  const manager = new THREE.LoadingManager()
  manager.onProgress = (_url, loaded, total) => onProgress(loaded / total)
  const draco = new DRACOLoader(manager).setDecoderPath(`${ASSETS}draco/`)
  const gltfLoader = new GLTFLoader(manager).setDRACOLoader(draco)
  const textures = new THREE.TextureLoader(manager)
  const tex = (name: string, color = false) =>
    textures.loadAsync(`${ASSETS}${name}`).then((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      if (color) t.colorSpace = THREE.SRGBColorSpace
      return t
    })
  const [sky, carGltfs, asphaltDiff, asphaltNor, asphaltArm, grassDiff, grassNor, grassArm] = await Promise.all([
    new HDRLoader(manager)
      .setDataType(THREE.FloatType)
      .loadAsync(`${ASSETS}sky/${night ? 'night' : overcast ? 'overcast' : 'day'}.hdr`),
    Promise.all(VEHICLES.map((v) => gltfLoader.loadAsync(`${ASSETS}cars/${v.id}.glb`))),
    tex('tex/asphalt_diff.jpg', true),
    tex('tex/asphalt_nor_gl.jpg'),
    tex('tex/asphalt_arm.jpg'),
    tex('tex/grass_diff.jpg', true),
    tex('tex/grass_nor_gl.jpg'),
    tex('tex/grass_arm.jpg'),
  ])
  draco.dispose()

  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(quality.pixelRatio)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = night ? 1 : overcast ? 0.95 : 0.75
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.domElement.style.display = 'block'
  renderer.domElement.addEventListener('webglcontextlost', (e) => {
    e.preventDefault()
    onContextLost()
  })
  host.appendChild(renderer.domElement)
  const anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8)

  // ── Sky, image-based lighting and the sun that matches it ──
  const scene = new THREE.Scene()
  sky.mapping = THREE.EquirectangularReflectionMapping
  const { sun: skySun, horizon } = readSky(sky)
  // Turn the sky so the sun sits behind-left of the chase camera: the cars we look at are lit.
  const wanted = Math.atan2(0.75, -0.65)
  const turn = Math.atan2(skySun.z, skySun.x) - wanted
  const sunDir = skySun.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), turn)
  scene.background = sky
  // Poly Haven night skies are long exposures (nearly daylight); scale the sky down, not the exposure, so lamps and
  // headlights keep their real strength.
  const skyLevel = night ? 0.05 : 1
  scene.backgroundIntensity = skyLevel
  scene.backgroundRotation.y = turn
  scene.environmentRotation.y = turn
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envMap = pmrem.fromEquirectangular(sky).texture
  pmrem.dispose()
  scene.environment = envMap
  scene.environmentIntensity = night ? 0.06 : overcast ? 1.2 : 1
  scene.fog = new THREE.Fog(horizon.multiplyScalar(skyLevel), ...FOG[weather])

  // Sun by day, moonlight at night; under cloud it is weak and shadows are faint.
  const sun = new THREE.DirectionalLight(night ? '#9fb3d9' : '#fff4e0', night ? 0.35 : overcast ? 1 : 3.2)
  sun.castShadow = true
  sun.shadow.mapSize.setScalar(quality.shadow)
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 24, bottom: -24, near: 1, far: 140 })
  sun.shadow.bias = -0.0003
  sun.shadow.normalBias = 0.03
  scene.add(sun, sun.target)

  // ── Road ──
  const roadMaps = [asphaltDiff, asphaltNor, asphaltArm]
  for (const m of roadMaps) {
    m.repeat.set((ROAD_HALF * 2) / ASPHALT_TILE, ROAD_LENGTH / ASPHALT_TILE)
    m.anisotropy = anisotropy
  }
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(ROAD_HALF * 2, ROAD_LENGTH),
    new THREE.MeshStandardMaterial({
      map: asphaltDiff,
      normalMap: asphaltNor,
      normalScale: new THREE.Vector2(1.2, 1.2),
      aoMap: asphaltArm,
      roughnessMap: asphaltArm,
      metalnessMap: asphaltArm,
      // Wet asphalt is darker and far glossier.
      color: weather === 'rain' ? '#7a7a7e' : '#b8b8b8',
      roughness: weather === 'rain' ? 0.35 : 1,
      envMapIntensity: weather === 'rain' ? 1.6 : 1,
    }),
  )
  road.rotation.x = -Math.PI / 2
  road.position.z = ROAD_BEHIND - ROAD_LENGTH / 2
  road.receiveShadow = true
  scene.add(road)

  const paint = new THREE.MeshStandardMaterial({
    color: '#f2f1ea',
    roughness: 0.55,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  })
  for (const x of [-(2 * LANE_WIDTH + 0.15), 2 * LANE_WIDTH + 0.15]) {
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(0.2, ROAD_LENGTH), paint)
    edge.rotation.x = -Math.PI / 2
    edge.position.set(x, 0.005, ROAD_BEHIND - ROAD_LENGTH / 2)
    edge.receiveShadow = true
    scene.add(edge)
  }
  // Dashes, posts and lamps sit in groups that loop by one period: no per-object updates per frame.
  const looping: { group: THREE.Group; period: number }[] = []
  const loop = (period: number) => {
    const group = new THREE.Group()
    scene.add(group)
    looping.push({ group, period })
    return group
  }
  const dividers = LANES.slice(1).map((x, i) => (x + LANES[i]) / 2)
  const dashCount = Math.ceil(ROAD_LENGTH / DASH_PERIOD) + 1
  const dashes = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.15, 3), paint, dashCount * dividers.length)
  const m4 = new THREE.Matrix4()
  const flat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0))
  const one = new THREE.Vector3(1, 1, 1)
  dividers.forEach((x, d) => {
    for (let i = 0; i < dashCount; i++)
      dashes.setMatrixAt(
        d * dashCount + i,
        m4.compose(new THREE.Vector3(x, 0.005, ROAD_BEHIND - i * DASH_PERIOD), flat, one),
      )
  })
  dashes.receiveShadow = true
  loop(DASH_PERIOD).add(dashes)

  // ── Guardrails ──
  const steel = new THREE.MeshStandardMaterial({ color: '#c3c8cd', metalness: 0.85, roughness: 0.38 })
  const railGeometry = guardrailGeometry()
  for (const side of [-1, 1]) {
    const rail = new THREE.Mesh(railGeometry, steel)
    rail.position.set(side * (ROAD_HALF + 0.25), 0.42, 0)
    rail.scale.x = side
    rail.castShadow = true
    rail.receiveShadow = true
    scene.add(rail)
  }
  steel.side = THREE.DoubleSide
  const postCount = Math.ceil(ROAD_LENGTH / POST_GAP) + 1
  const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.85, 0.15), steel, postCount * 2)
  for (let i = 0; i < postCount * 2; i++)
    posts.setMatrixAt(
      i,
      m4.makeTranslation((i % 2 ? 1 : -1) * (ROAD_HALF + 0.38), 0.42, ROAD_BEHIND - Math.floor(i / 2) * POST_GAP),
    )
  posts.castShadow = true
  loop(POST_GAP).add(posts)

  // ── Street lamps: galvanised pole, curved arm, flat LED head; instanced (4 draw calls for all of them) ──
  const ARM = 2.4
  const POLE = 10
  const armCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0, POLE - 0.6, 0),
    new THREE.Vector3(0.1, POLE + 0.2, 0),
    new THREE.Vector3(ARM, POLE + 0.15, 0),
  )
  const lampParts = [
    { geometry: new THREE.CylinderGeometry(0.08, 0.14, POLE, 14).translate(0, POLE / 2, 0), material: steel },
    { geometry: new THREE.TubeGeometry(armCurve, 16, 0.05, 8), material: steel },
    {
      geometry: new THREE.BoxGeometry(0.75, 0.1, 0.32).translate(ARM + 0.25, POLE + 0.12, 0),
      material: new THREE.MeshStandardMaterial({ color: '#3a3f45', metalness: 0.6, roughness: 0.45 }),
    },
    {
      geometry: new THREE.PlaneGeometry(0.62, 0.24).rotateX(Math.PI / 2).translate(ARM + 0.25, POLE + 0.065, 0),
      material: new THREE.MeshStandardMaterial({
        color: '#fffaf0',
        emissive: '#ffe2b0',
        emissiveIntensity: dark ? 8 : 0.4,
      }),
    },
  ]
  const lampGroup = loop(LAMP_GAP)
  const lampCount = Math.ceil(ROAD_LENGTH / LAMP_GAP) + 1
  const turned = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
  const straight = new THREE.Quaternion()
  for (const { geometry, material } of lampParts) {
    const mesh = new THREE.InstancedMesh(geometry, material, lampCount * 2)
    for (let i = 0; i < lampCount * 2; i++) {
      // Left lamps' arms point +x (over the road); right lamps are turned around.
      const side = i % 2 ? 1 : -1
      const at = new THREE.Vector3(
        side * (ROAD_HALF + 1.4),
        0,
        ROAD_BEHIND - Math.floor(i / 2) * LAMP_GAP - (i % 2) * (LAMP_GAP / 2),
      )
      mesh.setMatrixAt(i, m4.compose(at, side < 0 ? straight : turned, one))
    }
    mesh.castShadow = material === steel
    lampGroup.add(mesh)
  }
  // At night the lamps nearest the car really light the road (the looping group keeps them nearest).
  if (night)
    for (let k = 0; k < (touch ? 3 : 6); k++) {
      const side = k % 2 ? 1 : -1
      const pool = new THREE.PointLight('#ffd9a0', 260, 38, 2)
      pool.position.set(side * (ROAD_HALF + 1.4 - ARM - 0.25), POLE - 0.3, ROAD_BEHIND - 30 - k * (LAMP_GAP / 2))
      lampGroup.add(pool)
    }

  // ── Land ──
  const grassMaps = [grassDiff, grassNor, grassArm]
  for (const m of grassMaps) {
    m.repeat.set(1600 / GRASS_TILE, TERRAIN_LENGTH / GRASS_TILE)
    m.anisotropy = anisotropy
  }
  const landGeometry = new THREE.PlaneGeometry(1600, TERRAIN_LENGTH, 160, 144).rotateX(-Math.PI / 2)
  const pos = landGeometry.attributes.position
  for (let i = 0; i < pos.count; i++) pos.setY(i, landHeight(pos.getX(i), pos.getZ(i)))
  landGeometry.computeVertexNormals()
  const land = new THREE.Mesh(
    landGeometry,
    weather === 'snow'
      ? // Snow cover: plain white with the terrain's bumps from the grass normal map.
        new THREE.MeshStandardMaterial({ color: '#eef2f7', normalMap: grassNor, roughness: 0.85 })
      : new THREE.MeshStandardMaterial({
          map: grassDiff,
          normalMap: grassNor,
          aoMap: grassArm,
          roughnessMap: grassArm,
          color: '#d6dccb',
        }),
  )
  land.receiveShadow = true
  const landGroup = loop(TERRAIN_PERIOD)
  land.position.z = ROAD_BEHIND + 40 - TERRAIN_LENGTH / 2
  landGroup.add(land)

  // ── Vehicles (CC BY 4.0 models by Daniel Zhabotinsky; credited in the game's start screen) ──
  const blob = document.createElement('canvas')
  blob.width = blob.height = 128
  const g2 = blob.getContext('2d')!
  const fade = g2.createRadialGradient(64, 64, 8, 64, 64, 64)
  fade.addColorStop(0, 'rgba(0,0,0,0.8)')
  fade.addColorStop(1, 'rgba(0,0,0,0)')
  g2.fillStyle = fade
  g2.fillRect(0, 0, 128, 128)
  const shadowTexture = new THREE.CanvasTexture(blob)
  const shadowMaterial = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  })
  const tailLights = new THREE.MeshStandardMaterial({
    color: '#300000',
    emissive: '#ff1f1f',
    emissiveIntensity: 1.3,
  })
  // In daylight the models' own textured lights read fine; the glow quads only show at dusk or when braking.
  tailLights.visible = dark
  const playerTail = tailLights.clone()
  const tailGeometry = new THREE.PlaneGeometry(0.24, 0.08)

  // Imported paint is plain PBR; real car paint has a clear coat over it.
  const clearcoat = new Map<THREE.Material, THREE.Material>()
  const toPaint = (m: THREE.MeshStandardMaterial) => {
    let paint = clearcoat.get(m)
    if (!paint) {
      paint = new THREE.MeshPhysicalMaterial({
        name: m.name,
        color: m.color,
        map: m.map,
        normalMap: m.normalMap,
        roughnessMap: m.roughnessMap,
        metalnessMap: m.metalnessMap,
        aoMap: m.aoMap,
        roughness: Math.min(m.roughness, 0.45),
        metalness: m.metalness,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
      })
      clearcoat.set(m, paint)
    }
    return paint
  }

  type Wheel = { pivot: THREE.Group; front: boolean }
  /** Normalises a model: length along z with the front at -z, real size, on the ground, wheels on axle pivots. */
  const prepare = (source: THREE.Object3D, spec: (typeof VEHICLES)[number], playerLights: THREE.Material) => {
    const model = source.clone(true)
    model.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return
      o.castShadow = true
      const m = o.material as THREE.MeshStandardMaterial
      if (/body/i.test(m.name) && !/bottom|interior/i.test(m.name)) o.material = toPaint(m)
    })
    const holder = new THREE.Group()
    const inner = new THREE.Group()
    inner.add(model)
    holder.add(inner)
    const box = new THREE.Box3()
    const fit = (turn: number) => {
      inner.scale.setScalar(1)
      inner.position.set(0, 0, 0)
      inner.rotation.y = 0
      holder.updateMatrixWorld(true)
      const size = box.setFromObject(holder).getSize(new THREE.Vector3())
      inner.rotation.y = (size.x > size.z ? Math.PI / 2 : 0) + turn
      holder.updateMatrixWorld(true)
      inner.scale.setScalar(spec.length / box.setFromObject(holder).getSize(new THREE.Vector3()).z)
      holder.updateMatrixWorld(true)
      const centre = box.setFromObject(holder).getCenter(new THREE.Vector3())
      inner.position.set(-centre.x, -box.min.y, -centre.z)
      holder.updateMatrixWorld(true)
      box.setFromObject(holder)
    }
    // Average z of named front parts vs rear parts: the front must end up at -z.
    const partZ = (pattern: RegExp) => {
      const zs: number[] = []
      model.traverse((o) => {
        if (o instanceof THREE.Mesh && pattern.test(o.name + ' ' + (o.parent?.name ?? '')))
          zs.push(new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3()).z)
      })
      return zs.length ? zs.reduce((a, b) => a + b, 0) / zs.length : 0
    }
    fit(0)
    if (partZ(FRONT_PART) > partZ(REAR_PART)) fit(Math.PI)

    // Top-most wheel nodes; a model with one node for all four wheels keeps them static.
    const found: THREE.Object3D[] = []
    model.traverse((o) => {
      if (/^(wheel|tire)/i.test(o.name) && !/steering/i.test(o.name) && !found.some((f) => f !== o && isAncestor(f, o)))
        found.push(o)
    })
    const wheels: Wheel[] = []
    if (found.length >= 4)
      for (const w of found) {
        const at = holder.worldToLocal(new THREE.Box3().setFromObject(w).getCenter(new THREE.Vector3()))
        const pivot = new THREE.Group()
        pivot.position.copy(at)
        pivot.rotation.order = 'YXZ'
        holder.add(pivot)
        pivot.attach(w)
        wheels.push({ pivot, front: at.z < 0 })
      }

    // Tail-light glow on the rear bumper, and a soft contact shadow under the body.
    const lightY = Math.min(box.max.y * 0.55, 0.85)
    for (const side of [-1, 1]) {
      const light = new THREE.Mesh(tailGeometry, playerLights)
      light.position.set(side * (spec.width / 2 - 0.28), lightY, box.max.z + 0.02)
      holder.add(light)
    }
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(spec.width * 1.3, spec.length * 1.15), shadowMaterial)
    shadow.rotation.x = -Math.PI / 2
    shadow.position.y = 0.02
    shadow.renderOrder = 2
    holder.add(shadow)
    return {
      holder,
      wheels,
      height: box.max.y,
      radius: wheels[0] ? new THREE.Box3().setFromObject(wheels[0].pivot).getSize(new THREE.Vector3()).y / 2 : 0.33,
    }
  }

  // Player: the full model, front wheels steer.
  const playerCar = prepare(carGltfs[vehicle].scene, VEHICLES[vehicle], playerTail)
  const paints = new Set(clearcoat.values())
  playerCar.holder.traverse((o) => {
    if (o instanceof THREE.Mesh && paints.has(o.material)) {
      o.material = (o.material as THREE.MeshPhysicalMaterial).clone()
      ;(o.material as THREE.MeshPhysicalMaterial).color.set(playerPaint)
    }
  })
  const player = new THREE.Group()
  player.rotation.order = 'YXZ'
  player.add(playerCar.holder)
  scene.add(player)
  const wheelRadius = playerCar.radius
  // Chase camera framing scales with the vehicle: further back and higher for a pickup or truck.
  const camBack = 3.9 + VEHICLES[vehicle].length
  const camUp = 2.3 + (playerCar.height - 1.45) * 1.1
  const lookUp = 0.9 + (playerCar.height - 1.45) * 0.5
  const seat = COCKPIT[VEHICLES[vehicle].id]
  const eye = new THREE.Vector3(
    seat[0] * VEHICLES[vehicle].width,
    seat[1] * playerCar.height,
    seat[2] * VEHICLES[vehicle].length,
  )
  const eyeWorld = new THREE.Vector3()
  let view: CameraView = 'chase'

  // Traffic: each vehicle type baked once (a handful of draw calls), then cloned into every pool slot.
  const templates = VEHICLES.map((spec, i) => {
    const { holder, wheels } = prepare(carGltfs[i].scene, spec, tailLights)
    const pivots = new Set<THREE.Object3D>(wheels.map((w) => w.pivot))
    const body = bake(holder, pivots)
    body.traverse((o) => o instanceof THREE.Mesh && (o.castShadow = o.material !== shadowMaterial))
    const bakedWheels = wheels.map(({ pivot }) => {
      const p = new THREE.Group()
      p.position.copy(pivot.position)
      p.add(bake(pivot, new Set()))
      return p
    })
    return { body, wheels: bakedWheels }
  })
  // Traffic models added their own paint materials while being prepared.
  for (const m of clearcoat.values()) paints.add(m)
  const slots = Array.from({ length: POOL }, (_, slot) => {
    const group = new THREE.Group()
    const variants = templates.map((t, k) => {
      const node = new THREE.Group()
      const wheels = t.wheels.map((w) => w.clone())
      const body = t.body.clone()
      // Each slot/vehicle pair gets its own paint colour.
      const colour = PAINTS[(slot * 7 + k * 3) % PAINTS.length]
      const tinted = new Map<THREE.Material, THREE.Material>()
      body.traverse((o) => {
        if (!(o instanceof THREE.Mesh) || !paints.has(o.material)) return
        const own = tinted.get(o.material) ?? (o.material as THREE.MeshPhysicalMaterial).clone()
        ;(own as THREE.MeshPhysicalMaterial).color.set(colour)
        tinted.set(o.material, own)
        o.material = own
      })
      node.add(body, ...wheels)
      node.visible = false
      group.add(node)
      return { node, wheels }
    })
    group.visible = false
    scene.add(group)
    return { group, variants, model: -1, lastX: 0 }
  })

  // Headlight beam at night.
  if (night) {
    const beam = new THREE.SpotLight('#fff1d6', 220, 80, 0.5, 0.45, 1.5)
    beam.position.set(0, 0.75, -VEHICLES[vehicle].length / 2)
    beam.target.position.set(0, 0, -35)
    player.add(beam, beam.target)
  }

  // ── Rain streaks or snowflakes in a box around the car; the world's motion carries them past ──
  const precip = weather === 'rain' || weather === 'snow' ? createPrecipitation(weather, touch, night) : null
  if (precip) scene.add(precip.object)

  // ── Camera and post-processing ──
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 2500)
  camera.rotation.order = 'YXZ'
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: quality.msaa })
  const composer = new EffectComposer(renderer, target)
  composer.addPass(new RenderPass(scene, camera))
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), dark ? 0.45 : 0.18, 0.45, dark ? 3 : 1.4)
  composer.addPass(bloom)
  composer.addPass(new OutputPass())

  const timer = new THREE.Timer()
  let spin = 0
  let crashTime = 0
  let camX = getGame().x
  let lastSpeed = getGame().speed

  const draw = (dt: number) => {
    if (dt) step(dt)
    const r = getGame()
    const t = timer.getElapsed()
    const pace = THREE.MathUtils.clamp((r.speed - 20) / 38, 0, 1)
    spin += (r.speed * dt) / wheelRadius
    crashTime = r.alive ? 0 : crashTime + dt

    // Player: yaw from lateral speed, slight body roll, spin-out after a crash.
    const lateral = r.steer * (3 + r.speed * 0.12)
    const yaw = r.alive ? -Math.atan2(lateral, Math.max(r.speed, 6)) : 0.9 * (1 - Math.exp(-crashTime * 3))
    player.position.set(r.x, 0, 0)
    player.rotation.set(0, yaw, r.alive ? -r.steer * 0.025 * (0.3 + pace) : 0)
    for (const { pivot, front } of playerCar.wheels) {
      pivot.rotation.x = -spin
      pivot.rotation.y = front ? -r.steer * 0.32 : 0
    }
    // Brake lights flare while the car is slowing down.
    const braking = dt > 0 && r.speed < lastSpeed - 4 * dt
    lastSpeed = r.speed
    playerTail.visible = dark || braking
    playerTail.emissiveIntensity = braking ? 3 : 1.3

    r.cars.forEach((c, i) => {
      const slot = slots[i]
      slot.group.visible = c.active
      if (!c.active) return
      if (slot.model !== c.model) {
        slot.model = c.model
        slot.variants.forEach((v, k) => (v.node.visible = k === c.model))
      }
      const vx = dt ? (c.x - slot.lastX) / dt : 0
      slot.lastX = c.x
      slot.group.position.set(c.x, 0, c.z)
      slot.group.rotation.y = -Math.atan2(vx, Math.max(c.speed, 6))
      const roll = (spin * c.speed) / Math.max(r.speed, 1)
      for (const w of slot.variants[c.model].wheels) w.rotation.x = -roll
    })

    for (const m of roadMaps) m.offset.y = (r.distance / ASPHALT_TILE) % 1
    for (const { group, period } of looping) group.position.z = r.distance % period

    camX += (r.x * 0.8 - camX) * Math.min(1, dt * 4)
    const buzz = r.alive ? Math.sin(t * 53) * 0.008 * pace : Math.sin(crashTime * 40) * 0.05 * Math.exp(-crashTime * 4)
    if (view === 'cockpit') {
      // Driver's seat: turns and leans with the car, eyes slightly down the road.
      eyeWorld.copy(eye).applyEuler(player.rotation).add(player.position)
      camera.position.set(eyeWorld.x, eyeWorld.y + buzz * 0.6, eyeWorld.z)
      camera.rotation.set(-0.05, player.rotation.y, player.rotation.z * 1.4)
      camera.near = 0.03
      camera.fov = 64 + pace * 10
    } else {
      // Chase camera: lags the car sideways, widens with speed, a little road buzz.
      camera.position.set(camX, camUp + buzz, camBack + pace * 0.6)
      camera.lookAt(camX * 0.85 + r.steer * 0.5, lookUp, -18)
      camera.rotateZ(-r.steer * 0.02)
      camera.near = 0.1
      camera.fov = 52 + pace * 16
    }
    camera.updateProjectionMatrix()

    // Shadow camera follows the car so shadows stay sharp where we look.
    sun.target.position.set(r.x, 0, -8)
    sun.position.copy(sunDir).multiplyScalar(70).add(sun.target.position)
    precip?.update(dt, r.speed, t)
    composer.render(dt)
  }

  const tick = (time: number) => {
    timer.update(time)
    // Clamped so a dropped frame or a background tab can't skip the car through traffic.
    draw(Math.min(timer.getDelta(), 1 / 30))
  }

  const resize = new ResizeObserver(() => {
    const { clientWidth: w, clientHeight: h } = host
    if (!w || !h) return
    renderer.setSize(w, h)
    composer.setPixelRatio(quality.pixelRatio)
    composer.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    draw(0)
  })
  resize.observe(host)

  return {
    setView: (next) => {
      view = next
      draw(0)
    },
    setPlaying: (on) => {
      timer.reset()
      renderer.setAnimationLoop(on ? tick : null)
      if (!on) draw(0)
    },
    dispose: () => {
      resize.disconnect()
      renderer.setAnimationLoop(null)
      const owned = new Set<{ dispose: () => void }>([sky, envMap, target, shadowTexture, ...roadMaps, ...grassMaps])
      scene.traverse((o) => {
        if (!(o instanceof THREE.Mesh)) return
        owned.add(o.geometry)
        for (const m of [o.material].flat() as THREE.Material[]) owned.add(m)
      })
      owned.forEach((d) => d.dispose())
      composer.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}

export { createTrafficScene }
export type { TrafficScene, CameraView }
