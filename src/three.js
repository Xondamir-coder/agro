import * as THREE from 'three';
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons';
import GUI from 'lil-gui';
import gsap from 'gsap';
import './style.css';
import Dom from './Dom/Dom';
import agroVertexShader from './shaders/agro/vertex.glsl';
import agroFragmentShader from './shaders/agro/fragment.glsl';
import overlayVertexShader from './shaders/overlay/vertex.glsl';
import overlayFragmentShader from './shaders/overlay/fragment.glsl';

const canvas = document.querySelector('.canvas');

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

/**
 * Loaders
 */
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();

/**
 * Textures
 */
const circle_01Texture = textureLoader.load('textures/circle_01.png');
const dirt_01Texture = textureLoader.load('textures/dirt_01.png');
const fire_01Texture = textureLoader.load('textures/fire_01.png');
const flame_01Texture = textureLoader.load('textures/flame_01.png');
const flare_01Texture = textureLoader.load('textures/flare_01.png');
const light_01Texture = textureLoader.load('textures/light_01.png');
const magic_01Texture = textureLoader.load('textures/magic_01.png');
const muzzle_01Texture = textureLoader.load('textures/muzzle_01.png');
const scorch_01Texture = textureLoader.load('textures/scorch_01.png');
const scratch_01Texture = textureLoader.load('textures/scratch_01.png');
const slash_01Texture = textureLoader.load('textures/slash_01.png');
const smoke_01Texture = textureLoader.load('textures/smoke_01.png');
const spark_01Texture = textureLoader.load('textures/spark_01.png');
const star_01Texture = textureLoader.load('textures/star_01.png');
const symbol_01Texture = textureLoader.load('textures/symbol_01.png');
const trace_01Texture = textureLoader.load('textures/trace_01.png');
const twirl_01Texture = textureLoader.load('textures/twirl_01.png');
const window_01Texture = textureLoader.load('textures/window_01.png');

const texturesMap = new Map([
	['circle', circle_01Texture],
	['dirt', dirt_01Texture],
	['fire', fire_01Texture],
	['flame', flame_01Texture],
	['flare', flare_01Texture],
	['light', light_01Texture],
	['magic', magic_01Texture],
	['muzzle', muzzle_01Texture],
	['scorch', scorch_01Texture],
	['scratch', scratch_01Texture],
	['slash', slash_01Texture],
	['spark', spark_01Texture],
	['star', star_01Texture],
	['symbol', symbol_01Texture],
	['trace', trace_01Texture],
	['twirl', twirl_01Texture],
	['window', window_01Texture],
	['smoke', smoke_01Texture],
]);

/**
 * GUI
 */
const debugObj = {
	scroll: 0,
	particleColor: '#fff',
	particleTexture: smoke_01Texture,
	particleTextureName: 'smoke',
};
const gui = new GUI();

/**
 * Scene
 */
const scene = new THREE.Scene();

/**
 * Clean-up
 */
const cleanUpResources = (mesh, ...resources) => {
	resources.forEach(resource => {
		resource.dispose && resource.dispose();
		resource.destroy && resource.destroy();
	});
	mesh && scene.remove(mesh);
};

/**
 * Overlay
 */
const overlay = new THREE.Mesh(
	new THREE.PlaneGeometry(2, 2),
	new THREE.ShaderMaterial({
		vertexShader: overlayVertexShader,
		fragmentShader: overlayFragmentShader,
		uniforms: {
			uAlpha: { value: 1 },
		},
		transparent: true,
	})
);
scene.add(overlay);

gsap.to(overlay.material.uniforms.uAlpha, { value: 0, duration: 0.5, delay: 1 }).then(
	cleanUpResources(overlay, overlay.geometry, overlay.material)
);

/**
 * FBX
 */
let model, particlesMaterial, particlesGeometry, particles;
const generateParticles = () => {
	if (particlesGeometry && particlesMaterial)
		cleanUpResources(particles, particlesGeometry, particlesMaterial);

	// Copy the positions to create a bufferGeometry
	const oldGeometryPositionAttr = model.geometry.attributes.position;
	const scales = new Float32Array(oldGeometryPositionAttr.count);

	for (let i = 0; i < scales.length; i++) {
		scales[i] = (Math.random() + 0.1) * 1.5; // Unique scale for each particle
	}

	particlesGeometry = new THREE.BufferGeometry();
	particlesGeometry.setAttribute('position', oldGeometryPositionAttr);
	particlesGeometry.setAttribute('aScales', new THREE.BufferAttribute(scales, 1));

	// Material
	particlesMaterial = new THREE.ShaderMaterial({
		vertexShader: agroVertexShader,
		fragmentShader: agroFragmentShader,
		uniforms: {
			uSize: { value: 50 },
			uPixelRatio: {
				value: Math.min(devicePixelRatio, 2),
			},
			uAlphaMap: { value: debugObj.particleTexture },
			uScroll: { value: 0 },
			uTime: { value: 0 },
			uColor: { value: new THREE.Color(debugObj.particleColor) },
		},
		transparent: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
		side: THREE.DoubleSide,
	});

	// Particles
	particles = new THREE.Points(particlesGeometry, particlesMaterial);
	particles.rotation.x = Math.PI / 2;
	scene.add(particles);

	generateGUI(particlesMaterial);
};
const processFunc = xhr => {
	console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
};
const errFunc = err => {
	console.log(`Error ${err}`);
};

gltfLoader.load(
	'agro.glb',
	gltf => {
		model = gltf.scene.children[0];
		generateParticles();
	},
	processFunc,
	errFunc
);

let particleFolder, particleTexturesFolder;
const generateGUI = material => {
	if (particleFolder && particleTexturesFolder)
		cleanUpResources(null, particleFolder, particleTexturesFolder);

	particleFolder = gui.addFolder('particles');
	particleFolder.add(material.uniforms.uSize, 'value').min(0).max(300).name('size');
	particleFolder
		.addColor(debugObj, 'particleColor')
		.onChange(() => {
			material.uniforms.uColor.value.set(debugObj.particleColor);
		})
		.name('color');

	particleTexturesFolder = gui.addFolder('textures');
	particleTexturesFolder
		.add(debugObj, 'particleTextureName')
		.options([
			'circle',
			'dirt',
			'fire',
			'flame',
			'flare',
			'light',
			'magic',
			'muzzle',
			'scorch',
			'scratch',
			'slash',
			'spark',
			'star',
			'symbol',
			'trace',
			'twirl',
			'window',
			'smoke',
		])
		.name('names')
		.onChange(() => {
			debugObj.particleTexture = texturesMap.get(debugObj.particleTextureName);
			generateParticles();
		});
};

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 10);
// scene.add(ambientLight);

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 5;

/**
 * Controls
 */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enableZoom = false;
// controls.enableRotate = false;
controls.enablePan = false;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

/**
 * Resize
 */
window.addEventListener('resize', e => {
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
});

/**
 * Tick
 */
const dom = new Dom();
const clock = new THREE.Clock();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	renderer.render(scene, camera);
	controls.update();
	if (particlesMaterial) {
		gsap.to(debugObj, { scroll: dom.scrollVal, duration: 3 });
		particlesMaterial.uniforms.uScroll.value = debugObj.scroll;
		particlesMaterial.uniforms.uTime.value = elapsedTime;
	}
	requestAnimationFrame(tick);
};

tick();
