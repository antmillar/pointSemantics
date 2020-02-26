import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r113/examples/jsm/controls/OrbitControls.js';

export default class View
{
    constructor()
    {

        this.canvas = document.querySelector('#c');
        this.renderer = new THREE.WebGLRenderer({canvas : this.canvas});
        this.populate();
    }

    populate(){

      //scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color('white');

      //camera
      const fov = 45;
      const aspect = 2;  // the canvas default
      const clipNear = 0.01;
      const clipFar = 200;
      this.camera = new THREE.PerspectiveCamera(fov, aspect, clipNear, clipFar);
      this.camera.position.set(0, 10, 20);

      //mouse controls
      const controls = new OrbitControls(this.camera, this.canvas);
      controls.target.set(0, 5, 0);
      controls.update();

      //grid
      const size = 100;
      const divisions = 100;
      let helper = new THREE.GridHelper( size, divisions, 0xAAAAAA, 0xEEEEEE );
      this.scene.add( helper );
      

      //lighting
      var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.5 );
      hemiLight.position.set( 0, 50, 0 );
      this.scene.add( hemiLight );

      var dirLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
      dirLight.position.set( -5, 10, 5 );
      dirLight.castShadow = true;
      dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
      this.scene.add(dirLight);
      
    }

    //check whether canvas width matches client
    resizeToClient(renderer) {

      const canvas = renderer.domElement;
      const clientWidth = canvas.clientWidth;
      const clientHeight = canvas.clientHeight;
      const mismatch = (canvas.width !== clientWidth) || (canvas.height !== clientHeight);

      return mismatch;
    }
  
    //render the view
    render() {
        
      if (this.resizeToClient(this.renderer)) {

        const canvas = this.renderer.domElement;
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
        this.camera.updateProjectionMatrix();

      }
      
      this.renderer.render(this.scene, this.camera);
  
      // model.attributes.color.needsUpdate = true;
      requestAnimationFrame(() => this.render());
    }
}
