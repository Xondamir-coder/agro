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
 * Material
 */
const texture = textureLoader.load('circle.png');

const material = new THREE.MeshBasicMaterial({
	color: 0x0000ff,
	wireframe: true,
});

// const oldGeometry = new THREE.BoxGeometry(1, 1, 1, 10, 10, 10);
// const oldPositionAttr = oldGeometry.attributes.position;
// const newBufferGeometry = new THREE.BufferGeometry();
// newBufferGeometry.setAttribute('position', oldPositionAttr);
// const newParticles = new THREE.Points(
// 	newBufferGeometry,
// 	new THREE.PointsMaterial({ size: 0.1, alphaMap: texture, transparent: true })
// );
// scene.add(newParticles);

const obj = new THREE.Points(
	new THREE.BoxGeometry(1, 1, 1, 10, 10, 10),
	new THREE.PointsMaterial({
		size: 0.05,
		alphaMap: texture,
		transparent: true,
	})
);
// scene.add(obj);

// scene.add(new THREE.AxesHelper());

/**
 * Particles
 */
// const count = 100;
// const positions = new Float32Array(count * 3);
// for (let i = 0; i < positions.length; i++) {
// 	positions[i] = (Math.random() - 0.5) * 2;
// }

// const geometry = new THREE.BufferGeometry();
// geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
// const particles = new THREE.Points(
// 	geometry,
// 	new THREE.PointsMaterial({ size: 0.1, alphaMap: texture, transparent: true })
// );
// scene.add(particles);

/**
 * FBX
 */
let model, particlesMaterial;
gltfLoader.load(
	'agro.glb',
	gltf => {
		model = gltf.scene.children[0];
		gltf.scene.traverse(child => {
			if (child.isMesh) {
				child.material = material;
			}
		});
		// scene.add(gltf.scene);
		const oldGeometryPositionAttr = model.geometry.attributes.position;
		const newGeometry = new THREE.BufferGeometry();
		newGeometry.setAttribute('position', oldGeometryPositionAttr);

		particlesMaterial = new THREE.ShaderMaterial({
			vertexShader: agroVertexShader,
			fragmentShader: agroFragmentShader,
			uniforms: {
				uSize: { value: 25 },
				uPixelRatio: {
					value: Math.min(devicePixelRatio, 2),
				},
				uTexture: { value: texture },

				uScroll: { value: 0 },
				uTime: { value: 0 },
			},
		});

		const initialPosition = model.geometry.attributes.position;
		newGeometry.setAttribute('aInitialPosition', initialPosition);
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

addEventListener('wheel', e => {
	console.log(e);
	scrollVal += e.deltaY * 0.005;
	console.log(scrollVal);
});
