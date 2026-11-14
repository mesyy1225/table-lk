import React, { useEffect, useRef, useState } from "react";
import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  RepeatWrapping,
  Scene,
  ShadowMaterial,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import TableSketch from "./TableSketch";
import { cn } from "@/lib/utils";

export type LegStyle = "loop" | "four";

/** A table to draw. Sizes are in inches. */
export interface TableSpec {
  length: number;
  width: number;
  height: number;
  topHex: string;
  topGrain?: boolean;
  frameHex: string;
  legs: LegStyle;
}

interface TableSceneProps {
  spec: TableSpec;
  className?: string;
  /** Slowly turn the table until the visitor drags it. */
  autoRotate?: boolean;
  /** Draw the length, width and height measurements. */
  dimensions?: boolean;
  /** Called the first time the visitor drags the model. */
  onInteract?: () => void;
}

// Real construction, in inches: 1.5" square steel tube, 15 mm board (drawn slightly thicker so it reads).
const TUBE = 1.5;
const TOP_T = 0.75;
const INSET_X = 2;
const INSET_Z = 1.5;
const FOV = 32;

/** Paints a wood-grain board in the given colour, with the grain running along the table's length. */
const grainTexture = (hex: string) => {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const light = new Color(hex).getHSL({ h: 0, s: 0, l: 0 }).l > 0.6;
  for (let i = 0; i < 220; i++) {
    const y = Math.random() * canvas.height;
    const drift = (Math.random() - 0.5) * 26;
    const dark = Math.random() > 0.28;
    const alpha = (light ? 0.035 : 0.07) + Math.random() * (light ? 0.07 : 0.13);
    ctx.strokeStyle = dark ? `rgba(70, 38, 14, ${alpha})` : `rgba(255, 236, 205, ${alpha * 0.8})`;
    ctx.lineWidth = 0.6 + Math.random() * 2.4;
    ctx.beginPath();
    ctx.moveTo(-10, y);
    ctx.bezierCurveTo(canvas.width * 0.3, y + drift, canvas.width * 0.65, y - drift, canvas.width + 10, y + drift * 0.4);
    ctx.stroke();
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
};

/** A small text plate used for the measurements. */
const makeLabel = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 112;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  const sprite = new Sprite(new SpriteMaterial({ map: texture, depthTest: false, transparent: true }));
  sprite.renderOrder = 10;
  let current = "";
  const setText = (text: string) => {
    if (text === current) return;
    current = text;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#101a2b";
    ctx.beginPath();
    ctx.roundRect(8, 16, canvas.width - 16, canvas.height - 32, 40);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = '600 46px "Hanken Grotesk Variable", system-ui, sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 3);
    texture.needsUpdate = true;
  };
  return { sprite, setText, dispose: () => (texture.dispose(), sprite.material.dispose()) };
};

/**
 * Live 3D model of a Table LK table: a board top on a square-tube steel frame.
 * Drag to turn it (a sideways drag on touch, so the page still scrolls up and down).
 * Sizes and colours glide to new values when the spec changes.
 */
const TableScene: React.FC<TableSceneProps> = ({ spec, className, autoRotate = false, dimensions = false, onInteract }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const applyRef = useRef<(spec: TableSpec, dims: boolean) => void>();
  const interactRef = useRef(onInteract);
  interactRef.current = onInteract;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      setFailed(true);
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    host.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const scene = new Scene();
    const camera = new PerspectiveCamera(FOV, 1, 1, 2000);
    camera.position.set(95, 62, 120);

    scene.add(new HemisphereLight(0xffffff, 0xb9b3a8, 1.15));
    scene.add(new AmbientLight(0xffffff, 0.35));
    const sun = new DirectionalLight(0xffffff, 2.1);
    sun.position.set(70, 130, 60);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = sun.shadow.camera.bottom = -110;
    sun.shadow.camera.right = sun.shadow.camera.top = 110;
    sun.shadow.camera.far = 400;
    sun.shadow.radius = 6;
    sun.shadow.bias = -0.0004;
    scene.add(sun);

    const floor = new Mesh(new PlaneGeometry(900, 900), new ShadowMaterial({ opacity: 0.2 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const box = new BoxGeometry(1, 1, 1);
    const topMat = new MeshStandardMaterial({ color: 0xffffff, roughness: 0.62, metalness: 0 });
    const frameMat = new MeshStandardMaterial({ color: 0x17181b, roughness: 0.42, metalness: 0.35 });
    const table = new Group();
    const top = new Mesh(box, topMat);
    top.castShadow = true;
    top.receiveShadow = true;
    table.add(top);
    const tubes = Array.from({ length: 10 }, () => {
      const m = new Mesh(box, frameMat);
      m.castShadow = true;
      table.add(m);
      return m;
    });
    scene.add(table);

    // Measurements: three ruled lines with end ticks, each carrying a label.
    const dimGroup = new Group();
    const lineGeo = new BufferGeometry();
    const lines = new LineSegments(lineGeo, new LineBasicMaterial({ color: 0x101a2b, transparent: true, opacity: 0.55 }));
    dimGroup.add(lines);
    const labels = [makeLabel(), makeLabel(), makeLabel()];
    labels.forEach((l) => dimGroup.add(l.sprite));
    scene.add(dimGroup);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.rotateSpeed = 0.75;
    controls.minPolarAngle = 0.25;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.autoRotate = autoRotate && !reduce;
    controls.autoRotateSpeed = 0.9;
    // Sideways drags turn the table; up-and-down swipes still scroll the page.
    renderer.domElement.style.touchAction = "pan-y";
    renderer.domElement.style.cursor = "grab";
    controls.addEventListener("start", () => {
      controls.autoRotate = false;
      renderer.domElement.style.cursor = "grabbing";
      interactRef.current?.();
    });
    controls.addEventListener("end", () => {
      renderer.domElement.style.cursor = "grab";
    });

    const cur = { L: 60, W: 24, H: 30 };
    const target = { L: 60, W: 24, H: 30 };
    let legs: LegStyle = "loop";
    let showDims = false;
    let topTexture: CanvasTexture | null = null;
    let topKey = "";
    const frameTarget = new Color(0x17181b);
    let aspect = 1;
    let first = true;

    const place = (m: Mesh, sx: number, sy: number, sz: number, x: number, y: number, z: number) => {
      m.visible = true;
      m.scale.set(sx, sy, sz);
      m.position.set(x, y, z);
    };

    const layout = () => {
      const { L, W, H } = cur;
      const hLeg = H - TOP_T;
      const x0 = L / 2 - INSET_X - TUBE / 2;
      const z0 = W / 2 - INSET_Z - TUBE / 2;
      top.scale.set(L, TOP_T, W);
      top.position.set(0, H - TOP_T / 2, 0);
      if (topMat.map) topMat.map.repeat.set(Math.max(1, L / 60), Math.max(1, W / 30));
      tubes.forEach((t) => (t.visible = false));
      // Four upright legs are common to both styles.
      place(tubes[0], TUBE, hLeg, TUBE, -x0, hLeg / 2, -z0);
      place(tubes[1], TUBE, hLeg, TUBE, -x0, hLeg / 2, z0);
      place(tubes[2], TUBE, hLeg, TUBE, x0, hLeg / 2, -z0);
      place(tubes[3], TUBE, hLeg, TUBE, x0, hLeg / 2, z0);
      // Rails under the top: two along the ends, two along the length.
      place(tubes[4], TUBE, TUBE, 2 * z0 - TUBE, -x0, hLeg - TUBE / 2, 0);
      place(tubes[5], TUBE, TUBE, 2 * z0 - TUBE, x0, hLeg - TUBE / 2, 0);
      place(tubes[6], 2 * x0 - TUBE, TUBE, TUBE, 0, hLeg - TUBE / 2, -z0);
      place(tubes[7], 2 * x0 - TUBE, TUBE, TUBE, 0, hLeg - TUBE / 2, z0);
      if (legs === "loop") {
        // Loop legs close each end with a floor bar.
        place(tubes[8], TUBE, TUBE, 2 * z0 - TUBE, -x0, TUBE / 2, 0);
        place(tubes[9], TUBE, TUBE, 2 * z0 - TUBE, x0, TUBE / 2, 0);
      }

      dimGroup.visible = showDims;
      if (showDims) {
        const gap = Math.max(5, Math.max(L, W) * 0.09);
        const tick = gap * 0.28;
        const y = 0.15;
        const zf = W / 2 + gap;
        const xr = L / 2 + gap;
        const xl = -L / 2 - gap;
        const pts = [
          // length, along the front
          -L / 2, y, zf, L / 2, y, zf,
          -L / 2, y, zf - tick, -L / 2, y, zf + tick,
          L / 2, y, zf - tick, L / 2, y, zf + tick,
          // width, along the right end
          xr, y, -W / 2, xr, y, W / 2,
          xr - tick, y, -W / 2, xr + tick, y, -W / 2,
          xr - tick, y, W / 2, xr + tick, y, W / 2,
          // height, at the front left corner
          xl, 0, W / 2, xl, H, W / 2,
          xl - tick, 0, W / 2, xl + tick, 0, W / 2,
          xl - tick, H, W / 2, xl + tick, H, W / 2,
        ];
        lineGeo.setAttribute("position", new Float32BufferAttribute(pts, 3));
        const s = Math.max(L, W, H) * 0.17;
        labels.forEach((l) => l.sprite.scale.set(s, s * 0.35, 1));
        labels[0].sprite.position.set(0, y + s * 0.2, zf);
        labels[1].sprite.position.set(xr, y + s * 0.2, 0);
        labels[2].sprite.position.set(xl, H / 2, W / 2);
        labels[0].setText(`${Math.round(target.L)} in`);
        labels[1].setText(`${Math.round(target.W)} in`);
        labels[2].setText(`${Math.round(target.H)} in`);
      }
    };

    const fitDistance = () => {
      const radius = 0.5 * Math.hypot(target.L + (showDims ? 14 : 0), target.W + (showDims ? 14 : 0), target.H);
      const base = radius / Math.sin((FOV * Math.PI) / 360);
      return base * (aspect < 1 ? 1.08 / Math.max(aspect, 0.45) : 1.12);
    };

    applyRef.current = (next, dims) => {
      target.L = next.length;
      target.W = next.width;
      target.H = next.height;
      legs = next.legs;
      showDims = dims;
      frameTarget.set(next.frameHex);
      const key = `${next.topHex}|${next.topGrain ? 1 : 0}`;
      if (key !== topKey) {
        topKey = key;
        topTexture?.dispose();
        topTexture = next.topGrain ? grainTexture(next.topHex) : null;
        topMat.map = topTexture;
        topMat.color.set(next.topGrain ? "#ffffff" : next.topHex);
        topMat.roughness = next.topGrain ? 0.62 : 0.5;
        topMat.needsUpdate = true;
      }
      if (first || reduce) {
        first = false;
        Object.assign(cur, target);
        frameMat.color.copy(frameTarget);
        controls.target.set(0, target.H * 0.42, 0);
        camera.position.sub(controls.target).setLength(fitDistance()).add(controls.target);
      }
      layout();
    };

    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      aspect = w / h;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { rootMargin: "120px" });
    io.observe(host);

    const offset = new Vector3();
    const goalTarget = new Vector3();
    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      let moving = false;
      (["L", "W", "H"] as const).forEach((k) => {
        const d = target[k] - cur[k];
        if (Math.abs(d) > 0.01) {
          cur[k] += d * 0.16;
          moving = true;
        } else cur[k] = target[k];
      });
      if (moving) layout();
      frameMat.color.lerp(frameTarget, 0.14);
      goalTarget.set(0, target.H * 0.42, 0);
      controls.target.lerp(goalTarget, 0.1);
      offset.copy(camera.position).sub(controls.target);
      offset.setLength(offset.length() + (fitDistance() - offset.length()) * 0.1);
      camera.position.copy(controls.target).add(offset);
      controls.update();
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      io.disconnect();
      controls.dispose();
      labels.forEach((l) => l.dispose());
      topTexture?.dispose();
      [box, lineGeo, floor.geometry].forEach((g) => g.dispose());
      [topMat, frameMat, floor.material as ShadowMaterial, lines.material as LineBasicMaterial].forEach((m) => m.dispose());
      renderer.dispose();
      renderer.domElement.remove();
      applyRef.current = undefined;
    };
    // The scene is built once; spec changes flow through applyRef below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyRef.current?.(spec, dimensions);
  }, [spec, dimensions]);

  const description = `3D model of a table ${spec.length} inches long, ${spec.width} inches wide and ${spec.height} inches high. Drag sideways to turn it.`;

  if (failed) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <TableSketch top={spec.topHex} frame={spec.frameHex} className="w-full max-w-[34rem]" />
      </div>
    );
  }
  return <div ref={hostRef} role="img" aria-label={description} className={cn("h-full w-full", className)} />;
};

export default TableScene;
