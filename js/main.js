const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

renderer.setClearColor( 0xb7c3f3, 1 );

const light = new THREE.AmbientLight( 0xffffff );
scene.add( light )

// global variables
const start_position = 5
const end_position = -start_position
const text = document.querySelector(".text")
const TIMIT_LIMIT = 12
let gameStat = "loading"
let isLookingBackward = true

function createCube(size, positionX, rotY = 0, color = 0xfbc851){
    const geometry = new THREE.BoxGeometry(size.w, size.h, size.d);
    const material = new THREE.MeshBasicMaterial( { color: color } );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.x = positionX;
    cube.rotation.y = rotY;
    scene.add( cube );
    return cube
}

// adjusting camera positioning
camera.position.z = 5;

// loading GLTF
const loader = new THREE.GLTFLoader()

function delay(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

// doll class defined
class Doll{
    constructor(){
        loader.load("../models/scene.gltf", (gltf) => {
            scene.add( gltf.scene );
            gltf.scene.scale.set(.4, .4, .4); 
            gltf.scene.position.set(0, -1, 0); // positioning the doll
            this.doll = gltf.scene;
        })
    }

    // function for the doll to look backwards
    lookBackward(){
        gsap.to(this.doll.rotation, {y: -3.15, duration: .45})
        setTimeout(() => isLookingBackward = true, 150)
    }

    // function for the doll to look forward
    lookForward(){
        gsap.to(this.doll.rotation, {y: 0, duration: .45})
        setTimeout(() => isLookingBackward = false, 450)
    }

    // random generator for delayed time to look backwards and forward
    async start(){
        this.lookBackward()
        await delay((Math.random() * 1000) + 1000)
        this.lookForward()
        await delay((Math.random() * 750) + 750)
        this.start()
    }
}

// yellow track for person to follow
function createTrack(){
    createCube({w: start_position * 2 + .2, h: 1.5, d: 1}, 0, 0, 0xe5a716).position.z = -1;
    createCube({w: .2, h: 1.5, d: 1}, start_position, -.35);
    createCube({w: .2, h: 1.5, d: 1}, end_position, .35);
}
createTrack() // creating the track

// player class represented using sphere
class Player{
    constructor(){
        const geometry = new THREE.SphereGeometry( .3, 32, 16 );
        const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
        const sphere = new THREE.Mesh( geometry, material );
        sphere.position.z = 1
        sphere.position.x = start_position // defining start position
        scene.add( sphere )
        this.player = sphere // player is represented using a sphere
        this.playerInfo = {
            positionX: start_position,
            velocity: 0
        }
    }

    // setting the speed of movement
    run(){
        this.playerInfo.velocity = .03
    }

    // setting stopping speed
    stop(){
        gsap.to(this.playerInfo, {velocity: 0, duration: .1})
    }

    // if statements to check if the player loses or wins
    check(){
        if(this.playerInfo.velocity > 0 && !isLookingBackward){
            text.innerText = "You lose! Better luck next time!!"
            gameStat = "over"
        }
        if(this.playerInfo.positionX < end_position + .4){
            text.innerText = "You win! Congratultions!!"
            gameStat = "over"
        }
    }

    update(){
        this.check()
        this.playerInfo.positionX -= this.playerInfo.velocity
        this.player.position.x = this.playerInfo.positionX
    }
}

// page refresh represents new player and new doll
const player = new Player()
let doll = new Doll()

// start timer and free play
async function init(){
    await delay(500)
    text.innerText = "Game Rules:" + "\n" + "1. You can only move when the doll is not looking" + "\n" + "2. Use Left Arrow Key to go forward" + "\n" + "3. Use Right Arrow Key to stop" + "\n\n" + "All the Best👍"
    await delay(7000)
    text.innerText = "Starting in 3"
    await delay(500)
    text.innerText = "Starting in 2"
    await delay(500)
    text.innerText = "Starting in 1"
    await delay(500)
    text.innerText = "Go!!!!"
    startGame()
}

// game starts and so does the timer 
function startGame(){
    gameStat = "started"
    let progressBar = createCube({w: 8, h: .1,d: 1}, 0)
    progressBar.position.y = 3.35
    gsap.to(progressBar.scale, {x: 0, duration: TIMIT_LIMIT, ease: "none"})
    doll.start()
    setTimeout(() => { // setting timeout
        if(gameStat != "over"){
            text.innerText = "You ran out of time!"
            gameStat = "over"
        }
    }, TIMIT_LIMIT * 1000);
}

init()

// animate function
function animate() {
    if(gameStat == "over") return
    renderer.render( scene, camera );
	requestAnimationFrame( animate );
    player.update()
}
animate();

window.addEventListener( 'resize', onWindowResize, false );

// window resizing 
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

}

// arrow left key indicates going left
window.addEventListener('keydown', (e) => {
    if(gameStat != "started") return
    if(e.key == "ArrowLeft"){
        player.run()
    }
})

// arrow right key indicates going right
window.addEventListener('keyup', (e) => {
    if(e.key == "ArrowRight"){
        player.stop()
    }
})