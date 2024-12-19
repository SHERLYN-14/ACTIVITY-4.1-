import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

/**
 * Models
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let mixer = null

gltfLoader.load(
    '/models/model.glb',
    (gltf) => {
        gltf.scene.scale.set(20, 20, 20);

        const boundingBox = new THREE.Box3().setFromObject(gltf.scene);
        gltf.scene.position.set(0, -boundingBox.min.y, 0);

        gltf.scene.position.y = -boundingBox.min.y;

        gltf.scene.rotation.y = Math.PI / 2;

        scene.add(gltf.scene);
    }
);

gltfLoader.load(
    '/models/tree.glb',
    (gltf) => {
        gltf.scene.scale.set(10, 10, 10);

        const boundingBox = new THREE.Box3().setFromObject(gltf.scene);

        gltf.scene.position.y = -boundingBox.min.y;

        gltf.scene.position.x = 10;
        gltf.scene.position.z = -10; 

        scene.add(gltf.scene);
    }
);

/**
 * Floor
 */

// Load a texture for the floor
const textureLoader = new THREE.TextureLoader();
const floorTexture = textureLoader.load('/textures/floor.jpg');

// Configure the material for the floor with the texture
const floorMaterial = new THREE.MeshStandardMaterial({
    map: floorTexture, // Apply the texture to the material
    metalness: 0,
    roughness: 0.5
});

const floor = new THREE.Mesh(
    new THREE.BoxGeometry(50, 1, 50), // Width, Height, Depth
    floorMaterial
);
floor.receiveShadow = true;
floor.position.y = -0.5; // Position the floor so its top aligns with y = 0
scene.add(floor);


/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 100)
camera.position.set(- 20, 30, 50)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    if(mixer)
    {
        mixer.update(deltaTime)
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()