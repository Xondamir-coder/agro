import * as THREE from 'three';
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons';
import GUI from 'lil-gui';
import gsap from 'gsap';
import './style.css';
import agroVertexShader from './shaders/vertex.glsl';
import agroFragmentShader from './shaders/fragment.glsl';

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
const circle_01Texture = textureLoader.load('circle_01.png');
const dirt_01Texture = textureLoader.load('dirt_01.png');
const fire_01Texture = textureLoader.load('fire_01.png');
const flame_01Texture = textureLoader.load('flame_01.png');
const flare_01Texture = textureLoader.load('flare_01.png');
const light_01Texture = textureLoader.load('light_01.png');
const magic_01Texture = textureLoader.load('magic_01.png');
const muzzle_01Texture = textureLoader.load('muzzle_01.png');
const scorch_01Texture = textureLoader.load('scorch_01.png');
const scratch_01Texture = textureLoader.load('scratch_01.png');
const slash_01Texture = textureLoader.load('slash_01.png');
const smoke_01Texture = textureLoader.load('smoke_01.png');
const spark_01Texture = textureLoader.load('spark_01.png');
const star_01Texture = textureLoader.load('star_01.png');
const symbol_01Texture = textureLoader.load('symbol_01.png');
const trace_01Texture = textureLoader.load('trace_01.png');
const twirl_01Texture = textureLoader.load('twirl_01.png');
const window_01Texture = textureLoader.load('window_01.png');

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
 * FBX
 */
let model, particlesMaterial, particlesGeometry, particles;
const generateParticles = () => {
	if (particlesGeometry && particlesMaterial) {
		console.log('asd');
		particlesGeometry.dispose();
		particlesMaterial.dispose();
		scene.remove(particles);
	}

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
	if (particleFolder && particleTexturesFolder) {
		particleFolder.destroy();
		particleTexturesFolder.destroy();
	}
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
renderer.setPixelRatio(Math.min(devicePixelRatio, 10));

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
let scrollVal = 0;
const clock = new THREE.Clock();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();

	renderer.render(scene, camera);

	controls.update();

	if (particlesMaterial) {
		gsap.to(debugObj, { scroll: scrollVal, duration: 3 });
		particlesMaterial.uniforms.uScroll.value = debugObj.scroll;
		particlesMaterial.uniforms.uTime.value = elapsedTime;
	}

	requestAnimationFrame(tick);
};

tick();

/**
 * Audio
 */
const audio = new Audio('rise.wav');
audio.volume = 0.3;

let audioPlaying = false;
document.addEventListener('wheel', e => {
	// Update scroll value immediately
	scrollVal += e.deltaY * 0.005;

	if (!audioPlaying) {
		audio
			.play()
			.then(() => {
				audioPlaying = true;
			})
			.finally(() => {
				audioPlaying = false;
			});
	}
});

/**
 * Modal
 */
const modalBtn = document.querySelector('.modal__button');
const modal = document.querySelector('.modal');
modalBtn.addEventListener('click', () => {
	canvas.classList.remove('blurred');
	modal.style.transform = 'scale(0)';
});
