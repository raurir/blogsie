var con = console;

var isMouseDown = false;

var camera, scene, renderer;
var mouse = {x: 0, y: 0};
var camPos = {x: 0, y: 0, z: 10};
var camFloat = {x: 0, y: 0, z: 0, fov: 0};
var cameras = [], cameraIndex;

var sw = window.innerWidth, sh = window.innerHeight;

var terrain;

const init = () => {

	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0, 0.0002);
	renderer = new THREE.WebGLRenderer();//{antialias: true});
	renderer.setSize( sw, sh );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;
	// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	// renderer.gammaInput = true;
	// renderer.gammaOutput = true;


	if (scene.fog) renderer.setClearColor( scene.fog.color );

	// const axes = new THREE.AxisHelper()
	// scene.add( axes );

	const cameraFarAbove = {fov: 90, x: 0, y: 100, z: 100};
	const cameraFront = {fov: 60, x: 0, y: 0, z: -60};
	const cameraUnderneathRight = {fov: 30, x: -10, y: -20, z: -40};
	const cameraAbove = {fov: 70, x: 0, y: 50, z: -20};
	const cameraFrontLeft = {fov: 40, x: 80, y: -25, z: -100};
	cameras = [
		cameraFarAbove,
		cameraFront,
		cameraUnderneathRight,
		cameraAbove,
		cameraFrontLeft
	];

	cameraIndex = 0;

	let cameraInitial = cameras[cameraIndex];
	camera = new THREE.PerspectiveCamera(cameraInitial.fov, sw / sh, 1, 10000);
	camFloat = cameraInitial;
	scene.add(camera);

	var lightAbove = new THREE.DirectionalLight(0xffff80, 1);
	lightAbove.position.set(-1, 1, -0.25).normalize();
	scene.add( lightAbove );

	lightAbove.castShadow = true;
	lightAbove.shadow.camera.near = 1;
	lightAbove.shadow.camera.far = 70;
	// pointLight.shadowCameraVisible = true;
	lightAbove.shadow.bias = 0.1;



	var pointLight = new THREE.PointLight( 0xff0000, 1, 30 );
	pointLight.castShadow = true;
	pointLight.shadow.camera.near = 1;
	pointLight.shadow.camera.far = 40;
	// pointLight.shadowCameraVisible = true;
	pointLight.shadow.bias = 0.01;
	scene.add( pointLight );




	var spotLight = new THREE.SpotLight(0x903090, 1);
	spotLight.castShadow = true;
	// spotLight.angle = Math.PI / 4;
	// spotLight.penumbra = 0.5;
	// spotLight.decay = 0.2;
	// spotLight.distance = 2000;
	// // spotLight.shadow.mapSize.width = 1024;
	// // spotLight.shadow.mapSize.height = 1024;
	spotLight.shadow.camera.near = 1;
	spotLight.shadow.camera.far = 50;

	// scene.add( spotLight );
	spotLight.position.set(0, 200, 200);

	// // spotLight.lookAt( scene.position );


	var lightAbove2 = new THREE.DirectionalLight(0xffffff, 1);
	lightAbove2.position.set(0, 0.25, -1).normalize();
	scene.add( lightAbove2 );

	// var lightHelper = new THREE.SpotLightHelper( spotLight );
	// scene.add( lightHelper );


	// var geometry = new THREE.TorusKnotGeometry( 14, 1, 150, 20 );
	var geometry = new THREE.CubeGeometry(20, 20, 20, 2);
	var material = new THREE.MeshPhongMaterial( {
		color: 0xff0000,
		shininess: 100,
		specular: 0x222222
	} );
	torusKnot = new THREE.Mesh( geometry, material );
	torusKnot.position.set( 0, 0, 0 );
	torusKnot.castShadow = true;
	torusKnot.receiveShadow = true;
	scene.add( torusKnot );



	terrain = new Terrain(scene);

	document.body.appendChild(renderer.domElement);

	listen(["resize"], (e) => {
		resizeStage();
	});
	listen(["mousedown", "touchstart"], (e) =>  {
		e.preventDefault();
		isMouseDown = true;
		switchCamera();
	});
	listen(["mousemove", "touchmove"], (e) =>  {
		e.preventDefault();
		if (e.changedTouches && e.changedTouches[0]) e = e.changedTouches[0];
		mouse.x = (e.clientX / sw) * 2 - 1;
		mouse.y = -(e.clientY / sh) * 2 + 1;
	});
	listen(["mouseup", "touchend"], (e) =>  {
		e.preventDefault();
		isMouseDown = false;
	});

	resizeStage();
	render(0);

}

const listen = (eventNames, callback) => {
	for (var i = 0; i < eventNames.length; i++) {
		window.addEventListener(eventNames[i], callback);
	}
}


const resizeStage = () => {
	const maxWidth = 700;
	const maxAspect = 2;
	sw = window.innerWidth;
	if (sw > maxWidth) sw = maxWidth;
	sh = window.innerHeight
	let aspect = sw / sh;
	if (aspect > maxAspect) {
		aspect = maxAspect;
		sw = aspect * sh;
	}
	camera.aspect = aspect;
	camera.updateProjectionMatrix();
	renderer.setSize(sw, sh);
}

const switchCamera = ()=> {
	cameraIndex ++;
	cameraIndex %= cameras.length;
	var targetCamera = cameras[cameraIndex];

	con.log("targetCamera", cameraIndex, targetCamera, camFloat);

	TweenMax.to(camFloat, 1.5, {
		x: targetCamera.x,
		y: targetCamera.y,
		z: targetCamera.z,
		fov: targetCamera.fov,
		ease: Quad.easeInOut,
		onUpdate: () => {
			camera.updateProjectionMatrix();
		}
	});

}


const render = (time) => {
	// con.log("render");


	// camPos.x -= (camPos.x - mouse.x * 13.8) * 0.05;
	// camPos.y -= (camPos.y - mouse.y * 14.4) * 0.05;
	// camPos.z = camera.position.z;
	camera.position.set(
		camFloat.x + camPos.x,
		camFloat.y + camPos.y,
		camFloat.z + camPos.z
	);

	camera.lookAt( scene.position );

	// // camera.rotation.z = time * 0.0001;
	// camera.rotation.y = camPos.x / -1000;
	// camera.rotation.x = camPos.y / 1000;
	// // camera.rotation.z = camPos.x / -2000;
	// camera.rotation.z = (camPos.x - mouse.x * 400) / 2000;

	terrain.update(time);

	torusKnot.rotation.z += 0.01;

	renderer.render( scene, camera );

	requestAnimationFrame( render );
}














class Terrain {

	constructor(scene) {
		// return;

		this.terrainWidth = 100;
		this.terrainDepth = 100;
		this.unitsWidth = 6;
		this.unitsDepth = 6;
		this.meshZ = 0;
		this.meshZClamped = 0;

		let geometry = new THREE.PlaneBufferGeometry(this.terrainWidth, this.terrainDepth, this.unitsWidth - 1, this.unitsDepth - 1);
		geometry.rotateX( - Math.PI / 2 );

		let vertices = geometry.attributes.position.array;

		// con.log("terrain vertices:", vertices.length);

		let heights = [];
		for (let i = 0, j = 0, l = vertices.length; j < l; i ++, j += 3) {
			let x = i % this.unitsWidth;
			let z = Math.floor(i / this.unitsDepth);
			heights[i] = Math.random() * 20;
			vertices[j + 1] = heights[i];
		}

		this.vertices = vertices;
		this.heights = heights;


		var diffuseColor = 0x7799aa;

		var material;
		
		// var material = new THREE.MeshLambertMaterial({
		// var material = new THREE.MeshStandardMaterial({
		// 	// color: 0xff0000,
		// 	color: diffuseColor,
		// 	fog: true,
		// 	// wireframe: true, // render geometry as wireframe. Default is false.
		// 	// wireframeLinewidth: 5 // — Line thickness. Default is 1.
		// 	// wireframeLinecap // — Define appearance of line ends. Default is 'round'.
		// 	// wireframeLinejoin // — Define appearance of line joints. Default is 'round'.
		// });

		material = new THREE.MeshStandardMaterial( {
			color: diffuseColor,
			metalness: 0.9,
			roughness: 0.6,
			shading: THREE.SmoothShading,
			// envMap: 1//alphaIndex % 2 === 0 ? null : reflectionCube
		} );

		// material = new THREE.MeshBasicMaterial( {
		// 	// map: imgTexture,
		// 	color: diffuseColor,
		// 	reflectivity: 1,
		// 	shading: THREE.SmoothShading,
		// 	// envMap: alpha < 0.5 ? reflectionCube : null
		// } );





		this.mesh = new THREE.Mesh(geometry, material);



		this.mesh.receiveShadow = true;
		// this.mesh.castShadow = true;
		this.mesh.position.y = -30;

		// con.log(this.mesh.geometry);
		scene.add(this.mesh);
	}

	update(time) {
		// return
		// let vertices = this.vertices;
		// let heights = this.heights;

		// for (let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3) {
		// 	let x = i % this.unitsWidth;
		// 	let z = Math.floor(i / this.unitsDepth);

		// 	// vertices[j + 1] = heights[i % (this.unitsWidth * this.repeatRows)] + offsetY;// + Math.sin(time * 0.001 + x * 0.2) * 30;
		// }

		// console.log(coords.join(","));

		// this.mesh.geometry.dynamic = true;
		// this.mesh.geometry.vertices = vertices;
		// this.mesh.geometry.verticesNeedUpdate = true;


		// this.mesh.geometry.attributes.position.needsUpdate = true;

		// con.log(this.mesh.geometry);

		this.meshZ += 0.01;
		// this.meshZClamped = this.meshZ;
		this.mesh.rotation.y = this.meshZ;
	}
}


init();