window.addEventListener('resize', handleWindowResize, false);

var scene,
	camera,
	fieldOfView,
	aspectRatio,
	nearPlane,
	farPlane,
	HEIGHT,
	WIDTH,
	renderer,
	container,
	controls;

var HEIGHT = window.innerHeight;
var WIDTH = window.innerWidth;
var scene = new THREE.Scene();

var aspectRatio = WIDTH / HEIGHT;
fieldOfView = 55;
nearPlane = 1;
farPlane = 10000;

var camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
camera.position.set(0, 75, 400);
camera.rotation.set(-Math.PI / 8, 0, 0);
scene.add(camera);
scene.fog = new THREE.Fog(0x000000, 100, 750);

var renderer = new THREE.WebGLRenderer({
	alpha: true,
	antialias: true,
});

renderer.setSize(WIDTH, HEIGHT);
container = document.getElementById('container');
container.appendChild(renderer.domElement);

// controls = new THREE.OrbitControls(camera, renderer.domElement);
// controls.autoRotate = true;

function handleWindowResize() {
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
}

var Colors = {
	red: 0xca3c38,
	white: 0xd8d0d1,
	grey: 0xb5b5b5,
	darkGrey: 0x707070,
};

//LIGHTS
//////////////////

var hemisphereLight, shadowLight;

function createLights() {
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);
	shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);

	shadowLight.position.set(150, 350, 350);

	shadowLight.castShadow = true;

	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;

	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;

	scene.add(hemisphereLight);
	scene.add(shadowLight);
}

var drawParticles = function () {
	this.mesh = new THREE.Group();

	var geomParticlesMerged = new THREE.Geometry();

	var geometry = new THREE.TetrahedronGeometry(3, 0);
	var material = new THREE.MeshPhongMaterial({
		color: 0xffffff,
		flatShading: true,
	});

	for (var i = 0; i < 7500; i++) {
		var particle = new THREE.Mesh(geometry, material);
		particle.position.set(
			(Math.random() - 0.5) * 1500,
			(Math.random() - 0.5) * 50,
			(Math.random() - 0.5) * 1500
		);
		particle.rotation.y = Math.random() * Math.PI * 2;
		particle.rotation.x = Math.random() * Math.PI * 2;
		particle.rotation.z = Math.random() * Math.PI * 2;
		particle.scale.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
		particle.matrixAutoUpdate = false;
		particle.updateMatrix();
		geomParticlesMerged.merge(particle.geometry, particle.matrix);
	}
	this.particlesMerged = new THREE.Mesh(geomParticlesMerged, material);
	this.particlesMerged.castShadow = true;
	this.particlesMerged.receiveShadow = true;
	this.mesh.add(this.particlesMerged);

	var geomCoreMerged = new THREE.Geometry();

	for (var i = 0; i < 3000; i++) {
		var particle = new THREE.Mesh(geometry, material);
		particle.position.set(
			(Math.random() - 0.5) * 200,
			(Math.random() - 0.5) * 100,
			(Math.random() - 0.5) * 200
		);
		particle.rotation.y = Math.random() * Math.PI * 2;
		particle.rotation.x = Math.random() * Math.PI * 2;
		particle.rotation.z = Math.random() * Math.PI * 2;
		particle.scale.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
		particle.matrixAutoUpdate = false;
		particle.updateMatrix();
		geomCoreMerged.merge(particle.geometry, particle.matrix);
	}
	this.coreMerged = new THREE.Mesh(geomCoreMerged, material);
	this.coreMerged.castShadow = true;
	this.coreMerged.receiveShadow = true;
	this.mesh.add(this.coreMerged);

	var geomSubCoreMerged = new THREE.Geometry();

	for (var i = 0; i < 2000; i++) {
		var particle = new THREE.Mesh(geometry, material);
		particle.position.set(
			(Math.random() - 0.5) * 400,
			(Math.random() - 0.5) * 50,
			(Math.random() - 0.5) * 400
		);
		particle.rotation.y = Math.random() * Math.PI * 2;
		particle.rotation.x = Math.random() * Math.PI * 2;
		particle.rotation.z = Math.random() * Math.PI * 2;
		particle.scale.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
		particle.matrixAutoUpdate = false;
		particle.updateMatrix();
		geomSubCoreMerged.merge(particle.geometry, particle.matrix);
	}
	this.subCoreMerged = new THREE.Mesh(geomSubCoreMerged, material);
	this.subCoreMerged.castShadow = true;
	this.subCoreMerged.receiveShadow = true;
	this.mesh.add(this.subCoreMerged);
};
drawParticles.prototype.rotate = function () {
	this.coreMerged.rotation.y += 0.005;
	this.subCoreMerged.rotation.y += 0.002;
	this.particlesMerged.rotation.y += 0.001;
};

//INIT SCENE
//////////////////
var robot, particles;

function createParticles() {
	particles = new drawParticles();
	scene.add(particles.mesh);
}

createLights();
createParticles();

//ANIMATION
//////////////////
function animate() {
	//controls.update();
	particles.rotate();
}

function loop() {
	renderer.render(scene, camera);
	requestAnimationFrame(loop);
	animate();
}

loop();
