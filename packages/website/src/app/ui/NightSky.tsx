'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const r = 1000;
const FACTOR = 4;
const SPEED = 0.2;

// https://karthikkaranth.me/blog/generating-random-points-in-a-sphere/
function getPosition() {
  const u = Math.random();
  const v = Math.random();

  const theta = u * 2.0 * Math.PI;
  const phi = Math.acos(2.0 * v - 1.0);
  const r = Math.cbrt(Math.random());

  const sinTheta = Math.sin(theta);
  const cosTheta = Math.cos(theta);
  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);

  const x = r * sinPhi * cosTheta;
  const y = r * sinPhi * sinTheta;
  const z = r * cosPhi;

  return { x, y, z };
}

function getRandomParticlePosition(particleCount: number) {
  const arr = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const { x, y, z } = getPosition();

    arr[i + 0] = x * r;
    arr[i + 1] = y * r;
    arr[i + 2] = z * r;
  }

  return arr;
}

function resizeRenderer(renderer: THREE.WebGLRenderer): boolean {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  if (canvas.width !== width || canvas.height !== height) {
    renderer.setSize(width, height, false);
    return true;
  }

  return false;
}

// https://github.com/yarnpkg/berry/blob/master/packages/docusaurus/src/components/StarrySky.tsx
function initCanvas(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const loader = new THREE.TextureLoader();
  const scene = new THREE.Scene();

  const color = 0xffffff;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);

  const fov = 75;
  const aspect = 2;
  const near = 1.5;
  const far = 10000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  const geometrys = [
    new THREE.BufferGeometry(),
    new THREE.BufferGeometry(),
    new THREE.BufferGeometry(),
  ];

  geometrys[0].setAttribute(
    `position`,
    new THREE.BufferAttribute(getRandomParticlePosition(350 * FACTOR), 3),
  );

  geometrys[1].setAttribute(
    `position`,
    new THREE.BufferAttribute(getRandomParticlePosition(1000 * FACTOR), 3),
  );

  geometrys[2].setAttribute(
    `position`,
    new THREE.BufferAttribute(getRandomParticlePosition(500 * FACTOR), 3),
  );

  const materials = [
    new THREE.PointsMaterial({
      sizeAttenuation: true,
      alphaTest: 0.5,
      map: loader.load('/star1.png'),
    }),
    new THREE.PointsMaterial({
      sizeAttenuation: true,
      alphaTest: 0.5,
      size: 1,
      map: loader.load('/star2.png'),
    }),
    new THREE.PointsMaterial({
      sizeAttenuation: true,
      alphaTest: 0.5,
      map: loader.load('/star3.png'),
    }),
  ];

  const container = new THREE.Object3D();
  scene.add(container);

  const starsT1 = new THREE.Points(geometrys[0], materials[0]);
  const starsT2 = new THREE.Points(geometrys[1], materials[1]);
  const starsT3 = new THREE.Points(geometrys[2], materials[2]);

  container.add(starsT1);
  container.add(starsT2);
  container.add(starsT3);

  let timer: ReturnType<typeof requestAnimationFrame>;

  let lastTime: number | null = null;
  let aggregatedTime = 0;

  const render = (time: number) => {
    aggregatedTime += Math.min(time - (lastTime ?? time), 1000 / 60);
    lastTime = time;

    container.rotation.x = (((aggregatedTime / 1000) * Math.PI) / 80) * SPEED;
    container.rotation.y = (((aggregatedTime / 1000) * Math.PI) / 80) * SPEED;

    if (resizeRenderer(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);
    timer = requestAnimationFrame(render);
  };

  timer = requestAnimationFrame(render);

  return () => {
    cancelAnimationFrame(timer);
  };
}

export function NightSky() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasError, setCanvasError] = useState(false);

  useEffect(() => {
    try {
      initCanvas(canvasRef.current!);
    } catch {
      setCanvasError(true);
    }
  }, []);

  if (canvasError) {
    return null;
  }

  return <canvas className='absolute inset-0 -z-1 w-full h-full' ref={canvasRef} />;
}
