import * as THREE from 'three';
import GUI from 'lil-gui';
import gsap from 'gsap';
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons';
import Dom from './Dom';
import {
	agroVertexShader,
	agroFragmentShader,
	overlayVertexShader,
	overlayFragmentShader,
} from '../shaders';
import {
	agroModelUrl,
	dirtUrl,
	fireUrl,
	smokeUrl,
	circleUrl,
	flameUrl,
	flareUrl,
	lightUrl,
	magicUrl,
	muzzleUrl,
	scorchUrl,
	scratchUrl,
	slashUrl,
	sparkUrl,
	starUrl,
	symbolUrl,
	traceUrl,
	twirlUrl,
	windowUrl,
} from '../assets';

export default class Three {
	sizes = {
		width: window.innerWidth,
		height: window.innerHeight,
	};

	// Three.js objs
	canvas = document.querySelector('.canvas');
	scene = new THREE.Scene();
	clock = new THREE.Clock();

	constructor() {
		this.dom = new Dom();

		this.#loadTextures();
		this.#loadModel();

		this.#setGUI();
		this.#setOverlay();
		this.#setCamera();
		this.#setControls();
		this.#setRenderer();

		this.#tick();
		window.addEventListener('resize', this.#handleResize.bind(this));
	}
	#setCamera() {
		this.camera = new THREE.PerspectiveCamera(
			45,
			this.sizes.width / this.sizes.height,
			0.1,
			100
		);
		this.camera.position.z = 5;
	}
	#setLoaders() {
		this.loaders = {};
		this.loaders.textureLoader = new THREE.TextureLoader();
		this.loaders.gltfLoader = new GLTFLoader();
	}
	#loadTextures() {
		this.#setLoaders();

		this.textures = {};
		this.textures.smoke = this.loaders.textureLoader.load(smokeUrl);
		this.textures.circle = this.loaders.textureLoader.load(circleUrl);
		this.textures.dirt = this.loaders.textureLoader.load(dirtUrl);
		this.textures.fire = this.loaders.textureLoader.load(fireUrl);
		this.textures.flame = this.loaders.textureLoader.load(flameUrl);
		this.textures.flare = this.loaders.textureLoader.load(flareUrl);
		this.textures.light = this.loaders.textureLoader.load(lightUrl);
		this.textures.magic = this.loaders.textureLoader.load(magicUrl);
		this.textures.muzzle = this.loaders.textureLoader.load(muzzleUrl);
		this.textures.scorch = this.loaders.textureLoader.load(scorchUrl);
		this.textures.scratch = this.loaders.textureLoader.load(scratchUrl);
		this.textures.slash = this.loaders.textureLoader.load(slashUrl);
		this.textures.spark = this.loaders.textureLoader.load(sparkUrl);
		this.textures.star = this.loaders.textureLoader.load(starUrl);
		this.textures.symbol = this.loaders.textureLoader.load(symbolUrl);
		this.textures.trace = this.loaders.textureLoader.load(traceUrl);
		this.textures.twirl = this.loaders.textureLoader.load(twirlUrl);
		this.textures.window = this.loaders.textureLoader.load(windowUrl);
	}
	#setGUI() {
		this.debugObj = {
			scroll: 0,
			particleColor: '#fff',
			particleTexture: this.textures.smoke,
			particleTextureName: 'smoke',
		};
		this.gui = new GUI();
		this.folder = {};
	}
	#setOverlay() {
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
		this.scene.add(overlay);

		gsap.to(overlay.material.uniforms.uAlpha, { value: 0, duration: 0.5, delay: 1 }).then(
			() => {
				this.#cleanUpResources(overlay, overlay.geometry, overlay.material);
			}
		);
	}
	#loadModel() {
		this.loaders.gltfLoader.load(agroModelUrl, gltf => {
			this.model = gltf.scene.children[0];
			this.#generateParticles();
		});
	}
	#generateParticles() {
		if (this.particles)
			this.#cleanUpResources(
				this.particles,
				this.particles.geometry,
				this.particles.material
			);

		// Copy the positions to create a bufferGeometry
		const oldGeometryPositionAttr = this.model.geometry.attributes.position;

		// Unique scale for each particle
		const scales = new Float32Array(oldGeometryPositionAttr.count).map(
			() => (Math.random() + 0.1) * 1.5
		);

		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', oldGeometryPositionAttr);
		geometry.setAttribute('aScales', new THREE.BufferAttribute(scales, 1));

		// Material
		const material = new THREE.ShaderMaterial({
			vertexShader: agroVertexShader,
			fragmentShader: agroFragmentShader,
			uniforms: {
				uSize: { value: 50 },
				uPixelRatio: {
					value: Math.min(devicePixelRatio, 2),
				},
				uAlphaMap: { value: this.debugObj.particleTexture },
				uAlpha: { value: 1 },
				uScroll: { value: 0 },
				uTime: { value: 0 },
				uColor: { value: new THREE.Color(this.debugObj.particleColor) },
			},
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
			side: THREE.DoubleSide,
		});

		// Particles
		this.particles = new THREE.Points(geometry, material);
		this.particles.rotation.x = Math.PI / 2;
		this.scene.add(this.particles);

		this.#generateGUI();
	}
	#generateGUI() {
		if (this.folder.particles)
			this.#cleanUpResources(null, this.folder.particles, this.folder.textures);

		this.folder.particles = this.gui.addFolder('particles');
		this.folder.particles
			.add(this.particles.material.uniforms.uSize, 'value')
			.min(0)
			.max(300)
			.name('size');
		this.folder.particles
			.addColor(this.debugObj, 'particleColor')
			.onChange(() => {
				this.particles.material.uniforms.uColor.value.set(this.debugObj.particleColor);
			})
			.name('color');

		this.folder.textures = this.gui.addFolder('textures');
		this.folder.textures
			.add(this.debugObj, 'particleTextureName')
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
				this.debugObj.particleTexture = this.textures[this.debugObj.particleTextureName];
				this.#generateParticles();
			});
	}
	#cleanUpResources(mesh, ...resources) {
		resources.forEach(resource => {
			resource.dispose && resource.dispose();
			resource.destroy && resource.destroy();
		});
		mesh && this.scene.remove(mesh);
	}
	#setControls() {
		this.controls = new OrbitControls(this.camera, this.canvas);
		this.controls.enableDamping = true;
		this.controls.enableZoom = false;
		// this.controls.enableRotate = false;
		this.controls.enablePan = false;
	}
	#setRenderer() {
		this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
		this.renderer.setSize(this.sizes.width, this.sizes.height);
		this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
	}
	#handleResize(e) {
		this.sizes.width = window.innerWidth;
		this.sizes.height = window.innerHeight;

		this.camera.aspect = this.sizes.width / this.sizes.height;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(this.sizes.width, this.sizes.height);
		this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
	}
	#tick() {
		const elapsedTime = this.clock.getElapsedTime();
		this.renderer.render(this.scene, this.camera);
		this.controls.update();
		if (this.particles?.material) {
			gsap.to(this.debugObj, { scroll: this.dom.scrollVal, duration: 3 });
			this.particles.material.uniforms.uScroll.value = this.debugObj.scroll;
			this.particles.material.uniforms.uTime.value = elapsedTime;
			this.dom.animationEnded &&
				gsap.to(this.particles.material.uniforms.uAlpha, { value: 0, duration: 0.3 });
		}
		requestAnimationFrame(this.#tick.bind(this));
	}
}
