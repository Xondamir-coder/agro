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
 * GUI
 */
const gui = new GUI();

/**
 * Loaders
 */
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();

/**
 * Scene
 */
const scene = new THREE.Scene();

/**
 * Textures
 */
const texture = textureLoader.load('fire_01.png');

/**
 * FBX
 */
let model, particlesMaterial;
gltfLoader.load(
	'agro.glb',
	gltf => {
		model = gltf.scene.children[0];

		const oldGeometryPositionAttr = model.geometry.attributes.position;
		const scales = new Float32Array(oldGeometryPositionAttr.count);

		for (let i = 0; i < scales.length; i++) {
			scales[i] = (Math.random() + 0.1) * 1.5;
		}

		const newGeometry = new THREE.BufferGeometry();
		newGeometry.setAttribute('position', oldGeometryPositionAttr);
		newGeometry.setAttribute('aScales', new THREE.BufferAttribute(scales, 1));

		particlesMaterial = new THREE.ShaderMaterial({
			vertexShader: agroVertexShader,
			fragmentShader: agroFragmentShader,
			uniforms: {
				uSize: { value: 50 },
				uPixelRatio: {
					value: Math.min(devicePixelRatio, 2),
				},
				uTexture: { value: texture },
				uAlphaMap: { value: texture },

				uScroll: { value: 0 },
				uTime: { value: 0 },
			},
			transparent: true,
			depthWrite: false,
		});

		const particles = new THREE.Points(newGeometry, particlesMaterial);
		particles.rotation.x = Math.PI / 2;
		scene.add(particles);
	},
	xhr => {
		console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
	},
	err => {
		console.log(`Error ${err}`);
	}
);

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
let debugObj = {
	scroll: 0,
};
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
