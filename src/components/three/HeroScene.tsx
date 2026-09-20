import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { useCoarsePointer, usePrefersReducedMotion } from "../../lib/hooks";

/* ====================================================================
   HeroScene — the cinematic 3D hero.

   A burnished-gold shell emblem (ray fan radiating from a centre ring)
   detonates in real time into slow-motion shell bursts — fan, ring,
   peony and willow patterns — while golden embers drift across the
   whole frame. Everything particle-related is integrated on the GPU
   (analytic ballistics with linear drag), so per-frame CPU work is
   a handful of uniform writes.

   QUALITY TIERS
   ─────────────
   · Fine pointer (desktop): 2,400 sparks + 600 embers, Bloom /
     Chromatic Aberration / Noise / Vignette post chain, damped
     cursor + scroll camera pan, cursor "breeze" on particles.
   · Coarse pointer (touch): 900 sparks + 240 embers, no post chain,
     no pointer listeners, fixed camera, capped DPR.
   · prefers-reduced-motion: a single static frame of a mid-flight
     cascade with fixed lighting (`frameloop="demand"`).
   · Off-screen: the render loop is paused entirely (IntersectionObserver)
     so scrolling the rest of the page is never contended.
   ==================================================================== */

const SHELLS = 6; // simultaneous burst slots (slot 0 = the emblem)
const DRAG = 0.9; // linear air drag coefficient
const FOCUS_Z = 6.8; // camera distance to the emblem (focal plane)

/** 0 = peony sphere · 1 = ring · 2 = fan (emblem motif) · 3 = willow */
type Pattern = 0 | 1 | 2 | 3;
const CENTRAL_CYCLE: Pattern[] = [2, 1, 0, 2, 1, 3];
const GRAVITY: Record<Pattern, number> = { 0: 0.26, 1: 0.2, 2: 0.3, 3: 0.78 };

/** Mutable stage state shared between DOM listeners and R3F loops. */
interface StageState {
  pointer: THREE.Vector2; // raw cursor, NDC (-1..1)
  pointerSmooth: THREE.Vector2; // critically damped cursor
  scroll: number; // 0..1 across the hero height
  flash: number; // 1 at each central burst, decays
  center: THREE.Vector3; // emblem / central burst origin
  aspect: number;
}

/* ------------------------------------------------------------------ */
/* Spark shaders — analytic drag ballistics + fake bokeh + strobe     */
/* ------------------------------------------------------------------ */
const SPARK_VERT = /* glsl */ `
  #define SHELLS ${SHELLS}
  attribute float aShell;
  attribute float aSize;
  attribute float aSeed;
  attribute float aDelay;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uFocus;
  uniform vec2  uPointer;
  uniform float uBurst[SHELLS];
  uniform float uDuration[SHELLS];
  uniform float uGrav[SHELLS];
  uniform float uTint[SHELLS];
  uniform vec3  uOrigin[SHELLS];
  varying float vLife;
  varying float vSeed;
  varying float vTint;
  varying float vBlur;
  varying float vAge;

  const float K = ${DRAG.toFixed(2)};

  void main() {
    int s = int(aShell + 0.5);
    float age = uTime - uBurst[s] - aDelay;
    float dur = uDuration[s];
    vSeed = aSeed;

    // Not yet launched / burnt out → clip away entirely
    if (age < 0.0 || age > dur) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      gl_PointSize = 0.0;
      vLife = 1.0; vTint = 0.0; vBlur = 0.0; vAge = 0.0;
      return;
    }

    float life = age / dur;
    vec3 g = vec3(0.0, -uGrav[s], 0.0);
    float e = (1.0 - exp(-K * age)) / K;

    // \`position\` carries the launch velocity (see geometry setup).
    // Closed-form motion under gravity with linear drag:
    vec3 p = uOrigin[s] + (position - g / K) * e + (g / K) * age;

    // Organic sway + a subtle cursor "breeze" on the older sparks
    p.x += sin(age * 1.7 + aSeed * 6.2831) * 0.05 * age;
    p.z += cos(age * 1.3 + aSeed * 4.0) * 0.03 * age;
    p.xy += uPointer * 0.42 * life * (0.4 + 0.6 * aSeed);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = -mv.z;

    // Per-particle circle of confusion (depth-of-field without a depth pass)
    float coc = clamp(abs(dist - uFocus) / 6.5, 0.0, 1.0);
    float ignition = 1.0 + 2.6 * exp(-age * 7.0);
    float size = aSize * uPixelRatio * (170.0 / dist)
               * (0.35 + 0.65 * (1.0 - life)) * ignition * (1.0 + coc * 1.7);

    gl_PointSize = max(size, 1.0);
    gl_Position = projectionMatrix * mv;
    vLife = life; vTint = uTint[s]; vBlur = coc; vAge = age;
  }
`;

const SPARK_FRAG = /* glsl */ `
  uniform float uTime;
  varying float vLife;
  varying float vSeed;
  varying float vTint;
  varying float vBlur;
  varying float vAge;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv) * 2.0;
    if (d > 1.0) discard;

    // Soft disc — softer and flatter as the bokeh grows
    float disc = 1.0 - smoothstep(mix(0.35, 0.9, vBlur), 1.0, d);
    float core = 1.0 - smoothstep(0.0, 0.32, d);
    float shape = disc * 0.55 + core * (1.0 - vBlur * 0.7);

    // Twinkle that hardens into a strobe-star crackle late in life
    float tw = 0.75 + 0.25 * sin(uTime * (7.0 + vSeed * 13.0) + vSeed * 60.0);
    float strobe = step(0.45, fract(uTime * (5.0 + vSeed * 9.0) + vSeed));
    tw = mix(tw, strobe, smoothstep(0.55, 0.9, vLife) * 0.75);

    vec3 ivory = vec3(1.00, 0.96, 0.86);
    vec3 gold  = vec3(1.00, 0.80, 0.36);
    vec3 amber = vec3(1.00, 0.50, 0.14);
    vec3 crim  = vec3(0.96, 0.16, 0.14);
    vec3 hue   = mix(gold, crim, vTint);
    vec3 ember = mix(amber, crim * 0.7, vTint);

    // White-hot ignition → brand hue → dying ember
    vec3 col = mix(ivory, hue, smoothstep(0.0, 0.22, vLife));
    col = mix(col, ember, smoothstep(0.5, 1.0, vLife));

    float fade = 1.0 - smoothstep(0.55, 1.0, vLife);
    float alpha = shape * fade * tw / (1.0 + vBlur * 1.8);
    if (alpha < 0.005) discard;

    // HDR overshoot feeds the Bloom pass for the theatrical flare
    float hdr = 1.3 + 3.2 * exp(-vAge * 2.2) + 0.6 * (1.0 - vLife);
    gl_FragColor = vec4(col * hdr, alpha);
  }
`;

/* ------------------------------------------------------------------ */
/* Ember shaders — ambient golden drift across the whole frame        */
/* ------------------------------------------------------------------ */
const EMBER_VERT = /* glsl */ `
  attribute float aSeed;
  attribute float aSize;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uFocus;
  uniform vec2  uPointer;
  varying float vSeed;
  varying float vBlur;

  void main() {
    vec3 p = position;
    float speed = 0.12 + aSeed * 0.22;
    p.y = mod(position.y + uTime * speed + 40.0, 9.0) - 4.5;       // slow rise, wrap
    p.x += sin(uTime * 0.35 + aSeed * 6.2831) * 0.35;               // lateral sway
    p.z += cos(uTime * 0.27 + aSeed * 3.1) * 0.2;

    // Cursor parallax — nearer embers shift more (subtle, desktop only)
    float near = clamp((p.z + 6.0) / 9.0, 0.0, 1.0);
    p.xy += uPointer * (0.12 + 0.45 * near);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = -mv.z;
    float coc = clamp(abs(dist - uFocus) / 6.5, 0.0, 1.0);
    gl_PointSize = aSize * uPixelRatio * (120.0 / dist) * (1.0 + coc * 1.8);
    gl_Position = projectionMatrix * mv;
    vSeed = aSeed; vBlur = coc;
  }
`;

const EMBER_FRAG = /* glsl */ `
  uniform float uTime;
  varying float vSeed;
  varying float vBlur;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv) * 2.0;
    if (d > 1.0) discard;
    float disc = 1.0 - smoothstep(mix(0.2, 0.8, vBlur), 1.0, d);
    float tw = 0.55 + 0.45 * sin(uTime * (1.5 + vSeed * 3.0) + vSeed * 40.0);
    float alpha = disc * tw * 0.55 / (1.0 + vBlur * 1.5);
    if (alpha < 0.004) discard;
    vec3 col = mix(vec3(1.0, 0.78, 0.35), vec3(1.0, 0.92, 0.70), vSeed);
    gl_FragColor = vec4(col * 1.5, alpha);
  }
`;

/* ------------------------------------------------------------------ */
/* Anamorphic streak — horizontal lens flare that blooms on ignition  */
/* ------------------------------------------------------------------ */
const STREAK_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const STREAK_FRAG = /* glsl */ `
  uniform float uIntensity;
  varying vec2 vUv;
  void main() {
    float x = abs(vUv.x - 0.5) * 2.0;
    float y = abs(vUv.y - 0.5) * 2.0;
    float a = pow(1.0 - x, 3.0) * pow(1.0 - y, 1.2) * uIntensity;
    if (a < 0.003) discard;
    vec3 col = mix(vec3(1.0, 0.86, 0.55), vec3(0.78, 0.86, 1.0), x * 0.55);
    gl_FragColor = vec4(col * 2.0, a);
  }
`;

/* ------------------------------------------------------------------ */
/* Burst pattern generator — writes launch velocities for one shell   */
/* ------------------------------------------------------------------ */
function fillBurst(vel: Float32Array, start: number, count: number, pattern: Pattern, radius: number) {
  for (let i = 0; i < count; i++) {
    const o = (start + i) * 3;
    let dx = 0;
    let dy = 0;
    let dz = 0;
    let reach = radius;

    if (pattern === 1) {
      // Ring — the centre-ring motif, faced toward the lens
      const a = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.05;
      dx = Math.cos(a);
      dy = Math.sin(a);
      dz = (Math.random() - 0.5) * 0.14;
      reach = radius * (0.92 + Math.random() * 0.16);
    } else if (pattern === 2) {
      // Fan — nine filled rays fanning upward, exactly like the emblem
      const ray = Math.floor(Math.random() * 9);
      const a = (ray / 8 - 0.5) * 2.9 + (Math.random() - 0.5) * 0.11;
      dx = Math.sin(a);
      dy = Math.cos(a);
      dz = (Math.random() - 0.5) * 0.2;
      reach = radius * (0.3 + 0.7 * Math.random());
    } else {
      // Peony / willow — uniform sphere, lens-flattened in depth
      const u = Math.random() * 2 - 1;
      const ph = Math.random() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      dx = r * Math.cos(ph);
      dy = u;
      dz = r * Math.sin(ph) * 0.6;
      reach = pattern === 3 ? radius * (0.75 + 0.25 * Math.random()) : radius * (0.55 + 0.45 * Math.pow(Math.random(), 0.7));
    }

    // Terminal displacement under linear drag ≈ v0 / K  →  v0 = reach · K
    vel[o] = dx * reach * DRAG;
    vel[o + 1] = dy * reach * DRAG;
    vel[o + 2] = dz * reach * DRAG;
  }
}

/* ------------------------------------------------------------------ */
/* Responsive stage layout — keeps the emblem clear of the title card */
/* ------------------------------------------------------------------ */
function useStageLayout() {
  const size = useThree((s) => s.size);
  const aspect = size.width / Math.max(1, size.height);
  return useMemo(
    () => ({
      aspect,
      offsetX: aspect >= 1.5 ? 2.0 : aspect >= 1.05 ? 1.15 : 0, // emblem sits right of the copy on wide screens
      camZ: aspect < 1 ? Math.min(11.5, (FOCUS_Z / aspect) * 0.8) : FOCUS_Z, // pull back on portrait
      lookY: aspect < 0.9 ? -1.1 : 0.1, // lift the scene above the mobile title block
    }),
    [aspect],
  );
}

/* ------------------------------------------------------------------ */
/* Sparks — six burst slots scheduled on the CPU, integrated on GPU   */
/* ------------------------------------------------------------------ */
function Sparks({ perShell, stage, reduced }: { perShell: number; stage: StageState; reduced: boolean }) {
  const count = perShell * SHELLS;
  const velAttr = useRef<THREE.BufferAttribute>(null);

  const sim = useMemo(() => {
    const vel = new Float32Array(count * 3);
    const shellIdx = new Float32Array(count);
    const sizes = new Float32Array(count);
    const seeds = new Float32Array(count);
    const delays = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      shellIdx[i] = Math.floor(i / perShell);
      sizes[i] = 0.6 + Math.pow(Math.random(), 2.4) * 2.2;
      seeds[i] = Math.random();
      delays[i] = Math.random() * 0.12;
    }

    const uniforms = {
      uTime: { value: reduced ? 2.1 : 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uFocus: { value: FOCUS_Z },
      uPointer: { value: new THREE.Vector2() },
      uBurst: { value: new Float32Array(SHELLS).fill(-1e3) },
      uDuration: { value: new Float32Array(SHELLS).fill(4.5) },
      uGrav: { value: new Float32Array(SHELLS).fill(0.26) },
      uTint: { value: new Float32Array(SHELLS).fill(0) },
      uOrigin: { value: Array.from({ length: SHELLS }, () => new THREE.Vector3()) },
    };

    const shells = Array.from({ length: SHELLS }, (_, s) => ({
      burst: -1e3,
      next: s === 0 ? 0.7 : 1.1 + s * 0.85,
      duration: 4.5,
      flashed: true,
      cycle: 0,
    }));

    /** (Re)launch one burst slot at `time` — central slot fires from the emblem. */
    const launch = (s: number, time: number, attr: THREE.BufferAttribute | null) => {
      const sh = shells[s];
      const central = s === 0;
      const pattern: Pattern = central
        ? CENTRAL_CYCLE[sh.cycle % CENTRAL_CYCLE.length]
        : Math.random() < 0.22
          ? 3
          : (Math.floor(Math.random() * 3) as Pattern);
      const radius = central ? 2.3 : 0.7 + Math.random() * 0.8;

      fillBurst(vel, s * perShell, perShell, pattern, radius);

      sh.burst = time;
      sh.duration = pattern === 3 ? 5.4 : central ? 4.8 : 3.4 + Math.random();
      sh.next = time + sh.duration + (central ? 0.35 : 0.3 + Math.random() * 1.6);
      sh.flashed = false;

      uniforms.uBurst.value[s] = time;
      uniforms.uDuration.value[s] = sh.duration;
      uniforms.uGrav.value[s] = GRAVITY[pattern];
      uniforms.uTint.value[s] = central ? (sh.cycle % 2 === 0 ? 0 : 0.45) : [0, 0, 0.4, 1][Math.floor(Math.random() * 4)];

      const origin = uniforms.uOrigin.value[s];
      if (central) {
        origin.copy(stage.center);
      } else {
        const spread = stage.aspect < 1 ? 1.4 : 3.2;
        const side = Math.random() < 0.5 ? -1 : 1;
        origin.set(
          stage.center.x + side * (1.8 + Math.random() * spread),
          -0.6 + Math.random() * 3.0,
          -2.5 - Math.random() * 5,
        );
      }
      sh.cycle++;
      if (attr) attr.needsUpdate = true;
    };

    // Opening cue: the emblem detonates 0.7 s after the stage lights up.
    launch(0, 0.7, null);
    // Reduced motion → pre-scatter every slot for one still frame.
    if (reduced) {
      launch(0, 0, null);
      for (let s = 1; s < SHELLS; s++) launch(s, -(0.5 + s * 0.55), null);
    }

    return { vel, shellIdx, sizes, seeds, delays, uniforms, shells, launch };
  }, [count, perShell, reduced, stage]);

  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    const u = sim.uniforms;
    u.uTime.value = t;
    u.uPointer.value.copy(stage.pointerSmooth);
    for (let s = 0; s < SHELLS; s++) {
      const sh = sim.shells[s];
      if (t >= sh.next) sim.launch(s, t, velAttr.current);
      if (s === 0 && !sh.flashed && t >= sh.burst) {
        stage.flash = 1; // drives the key light + anamorphic streak
        sh.flashed = true;
      }
    }
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry key={`${count}-${reduced ? "s" : "a"}`}>
        {/* NOTE: the `position` attribute stores launch VELOCITY; the
            vertex shader reconstructs position analytically each frame. */}
        <bufferAttribute ref={velAttr} attach="attributes-position" args={[sim.vel, 3]} usage={THREE.DynamicDrawUsage} />
        <bufferAttribute attach="attributes-aShell" args={[sim.shellIdx, 1]} />
        <bufferAttribute attach="attributes-aSize" args={[sim.sizes, 1]} />
        <bufferAttribute attach="attributes-aSeed" args={[sim.seeds, 1]} />
        <bufferAttribute attach="attributes-aDelay" args={[sim.delays, 1]} />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        depthTest
        blending={THREE.AdditiveBlending}
        vertexShader={SPARK_VERT}
        fragmentShader={SPARK_FRAG}
        uniforms={sim.uniforms}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/* Embers — ambient golden drift, fully shader-animated               */
/* ------------------------------------------------------------------ */
function Embers({ count, stage, reduced }: { count: number; stage: StageState; reduced: boolean }) {
  const data = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = -7 + Math.random() * 16;
      positions[i * 3 + 1] = -4.5 + Math.random() * 9;
      positions[i * 3 + 2] = -6 + Math.random() * 9;
      seeds[i] = Math.random();
      sizes[i] = 0.35 + Math.pow(Math.random(), 2) * 1.3;
    }
    return { positions, seeds, sizes };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: reduced ? 12.0 : 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uFocus: { value: FOCUS_Z },
      uPointer: { value: new THREE.Vector2() },
    }),
    [reduced],
  );

  useFrame((state) => {
    if (reduced) return;
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uPointer.value.copy(stage.pointerSmooth);
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry key={count}>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[data.seeds, 1]} />
        <bufferAttribute attach="attributes-aSize" args={[data.sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={EMBER_VERT}
        fragmentShader={EMBER_FRAG}
        uniforms={uniforms}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/* Emblem — golden ray fan radiating from the centre ring motif       */
/* ------------------------------------------------------------------ */
const RAY_COUNT = 15;

function Emblem3D({ stage, reduced }: { stage: StageState; reduced: boolean }) {
  const group = useRef<THREE.Group>(null!);
  const rays = useRef<THREE.Group>(null!);
  const orbitA = useRef<THREE.Mesh>(null!);
  const orbitB = useRef<THREE.Mesh>(null!);
  const keyLight = useRef<THREE.PointLight>(null!);

  const rayAngles = useMemo(() => Array.from({ length: RAY_COUNT }, (_, i) => (i / (RAY_COUNT - 1) - 0.5) * 2.7), []);

  const goldMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#d4af37", metalness: 1, roughness: 0.26, emissive: "#7a5c16", emissiveIntensity: 0.55 }),
    [],
  );
  const crimsonMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#5e0a0c", metalness: 0.4, roughness: 0.4, emissive: "#8b0000", emissiveIntensity: 1.4 }),
    [],
  );
  const streakMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: STREAK_VERT,
        fragmentShader: STREAK_FRAG,
        uniforms: { uIntensity: { value: 0.22 } },
      }),
    [],
  );

  useFrame((state, delta) => {
    // Ignition flash → key light, emissive gold and anamorphic streak
    stage.flash = Math.max(0, stage.flash - stage.flash * 2.8 * delta);
    const f = stage.flash;
    keyLight.current.intensity = 24 + f * 90;
    goldMat.emissiveIntensity = 0.55 + f * 1.8;
    crimsonMat.emissiveIntensity = 1.4 + f * 2.5;
    streakMat.uniforms.uIntensity.value = 0.22 + f * 1.4;

    if (reduced) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = Math.sin(t * 0.11) * 0.22;
    group.current.rotation.z = Math.sin(t * 0.15) * 0.06;
    rays.current.scale.setScalar(1 + Math.sin(t * 1.3) * 0.04 + f * 0.1);
    orbitA.current.rotation.x = Math.sin(t * 0.2) * 0.3;
    orbitB.current.rotation.z = t * 0.2;
  });

  return (
    <group ref={group}>
      {/* Key light lives at the firing point so bursts light the emblem */}
      <pointLight ref={keyLight} position={[0, 0.2, 0.9]} intensity={24} distance={18} decay={2} color="#ffd27a" />

      {/* Centre ring motif */}
      <mesh material={goldMat}>
        <torusGeometry args={[0.44, 0.04, 12, 72]} />
      </mesh>
      {/* White-hot core */}
      <mesh>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshBasicMaterial color="#fff1c8" />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshBasicMaterial color="#ffd27a" transparent opacity={0.16} />
      </mesh>

      {/* Ray fan radiating from the ring, crimson shells at each tip */}
      <group ref={rays}>
        {rayAngles.map((a, i) => (
          <group key={i} rotation={[0, 0, -a]}>
            <mesh material={goldMat} position={[0, 0.9, 0]}>
              <coneGeometry args={[0.042, 0.72, 6]} />
            </mesh>
            <mesh material={crimsonMat} position={[0, 1.32, 0]}>
              <sphereGeometry args={[0.058, 12, 12]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Gilded orbits */}
      <mesh ref={orbitA}>
        <torusGeometry args={[1.5, 0.012, 8, 96]} />
        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.35} emissive="#6b4e12" emissiveIntensity={0.5} transparent opacity={0.85} />
      </mesh>
      <mesh ref={orbitB} rotation={[0.35, 0, 0]}>
        <torusGeometry args={[1.85, 0.006, 8, 120]} />
        <meshBasicMaterial color="#d4af37" transparent opacity={0.32} />
      </mesh>

      {/* Anamorphic streak */}
      <mesh material={streakMat} position={[0, 0, 0.05]}>
        <planeGeometry args={[7.5, 0.1]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Camera rig — damped cursor + scroll pan; static on touch/reduced   */
/* ------------------------------------------------------------------ */
function CameraRig({ stage, interactive }: { stage: StageState; interactive: boolean }) {
  const layout = useStageLayout();

  useEffect(() => {
    stage.center.set(layout.offsetX, 0, 0);
    stage.aspect = layout.aspect;
  }, [layout, stage]);

  useFrame((state, delta) => {
    const cam = state.camera;
    const cx = layout.offsetX * 0.5;
    if (!interactive) {
      cam.position.set(cx, 0.55, layout.camZ);
      cam.lookAt(cx, layout.lookY, 0);
      return;
    }
    stage.pointerSmooth.x = THREE.MathUtils.damp(stage.pointerSmooth.x, stage.pointer.x, 3, delta);
    stage.pointerSmooth.y = THREE.MathUtils.damp(stage.pointerSmooth.y, stage.pointer.y, 3, delta);
    const t = state.clock.elapsedTime;
    const tx = cx + stage.pointerSmooth.x * 0.7 + Math.sin(t * 0.1) * 0.25;
    const ty = 0.55 + stage.pointerSmooth.y * 0.35 + Math.cos(t * 0.13) * 0.12 + stage.scroll * 1.4;
    cam.position.x = THREE.MathUtils.damp(cam.position.x, tx, 2.2, delta);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, ty, 2.2, delta);
    cam.position.z = layout.camZ;
    cam.lookAt(cx, layout.lookY + stage.scroll * 0.5, 0);
  });
  return null;
}

/** Positions the emblem at the responsive stage centre. */
function EmblemAnchor({ stage, reduced }: { stage: StageState; reduced: boolean }) {
  const layout = useStageLayout();
  return (
    <group position={[layout.offsetX, 0, 0]}>
      <Float speed={reduced ? 0 : 1.1} rotationIntensity={reduced ? 0 : 0.15} floatIntensity={reduced ? 0 : 0.45}>
        <Emblem3D stage={stage} reduced={reduced} />
      </Float>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Top-level stage                                                     */
/* ------------------------------------------------------------------ */
export default function HeroScene() {
  const coarse = useCoarsePointer();
  const reduced = usePrefersReducedMotion();
  const highTier = !coarse && !reduced; // full post chain + cursor/scroll parallax

  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  const stage = useMemo<StageState>(
    () => ({
      pointer: new THREE.Vector2(),
      pointerSmooth: new THREE.Vector2(),
      scroll: 0,
      flash: 0,
      center: new THREE.Vector3(),
      aspect: 1.6,
    }),
    [],
  );

  // Pointer + scroll listeners — fine-pointer devices only.
  useEffect(() => {
    if (!highTier) return;
    const onMove = (e: PointerEvent) => {
      stage.pointer.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    };
    const onScroll = () => {
      stage.scroll = Math.min(1, window.scrollY / Math.max(1, window.innerHeight));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [highTier, stage]);

  // Pause the render loop when the hero leaves the viewport.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.02 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const caOffset = useMemo(() => new THREE.Vector2(0.0011, 0.0015), []);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <Canvas
        dpr={coarse ? [1, 1.5] : [1, 1.75]}
        camera={{ position: [0, 0.55, FOCUS_Z], fov: 40, near: 0.5, far: 60 }}
        gl={{ antialias: !highTier, powerPreference: "high-performance", alpha: false }}
        frameloop={reduced ? "demand" : inView ? "always" : "never"}
      >
        <color attach="background" args={["#08090c"]} />
        <fog attach="fog" args={["#0a0b12", 12, 30]} />

        {/* Nocturnal fill + Venetian rim */}
        <ambientLight intensity={0.5} color="#454a63" />
        <pointLight position={[5, 2.5, 2]} intensity={9} distance={14} decay={2} color="#9a1b1e" />
        <pointLight position={[-4, -1.5, 3]} intensity={4} distance={12} decay={2} color="#d4af37" />

        <CameraRig stage={stage} interactive={highTier} />
        <EmblemAnchor stage={stage} reduced={reduced} />
        <Sparks perShell={coarse ? 150 : 400} stage={stage} reduced={reduced} />
        <Embers count={coarse ? 240 : 600} stage={stage} reduced={reduced} />

        {/* Theatrical post chain — desktop fine-pointer only */}
        {highTier && (
          <EffectComposer multisampling={0}>
            <Bloom intensity={1.1} luminanceThreshold={0.2} luminanceSmoothing={0.25} mipmapBlur radius={0.7} />
            <ChromaticAberration offset={caOffset} radialModulation modulationOffset={0.5} />
            <Noise opacity={0.035} premultiply />
            <Vignette offset={0.16} darkness={0.9} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
