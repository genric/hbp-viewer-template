function main() {
    var scene, camera, renderer, controls, mesh;
    var params = new function() {
        this.angle = 0;
    };

    // configure notifications to show in the bottom right corner
    $.notify.defaults({ globalPosition: 'bottom right' });

    // collaboratory documnt service rest api end-point
    // var docSrvc = 'https://services.humanbrainproject.eu/document/v0/api/file/';

    // oauth client id, replace with your own oidc client
    // var oidcClient = new BbpOidcClient({ clientId: 'your_client_id' });

    // extract request params, by convention param "state" is used to pass uuid of the file in storage
    // var requestParams = [];
    // var keyVals = window.location.search.substring(1).split('&');
    // for (var i = 0; i < keyVals.length; i++) {
    //   var keyVal = keyVals[i].split('=');
    //   requestParams.push(keyVal[0]);
    //   requestParams[keyVal[0]] = keyVal[1];
    // }

    $.notify('Hello', 'info');
    
    // ensure we have a valid token to access the collab services like document storage
    // oidcClient.setEnsureToken(true)
    // .then(function() {
    //     var token = oidcClient.getToken();
    //     createGui();
    // })
    // .catch(function() {
    //     $.notify('Error loading', 'error');
    // });
    createGui();

    // initialize some fancy three.js demo
    init();
    animate();

    function createGui() {
        var gui = new window.dat.GUI();
        gui.add(params, 'angle', 0, 359, 1).onChange(function(value) {
            mesh.rotation.y = value * Math.PI / 180;
        });
    }

    function onWindowResize () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix ();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function init() {
        scene = new THREE.Scene();

        var geometry = new THREE.TorusKnotGeometry(0.4, 0.15, 150, 20);
        var material = new THREE.MeshStandardMaterial({ roughness: 0.01, metalness: 0.2 });
        mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);

        var light = new THREE.DirectionalLight(0x8800ff);
        light.position.set(0, 10, -10);
        light.castShadow = true;
        light.shadow.camera.zoom = 4;
        scene.add(light);

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100.0);
        camera.position.set(0, 0, -2);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setClearColor($('body').css('background-color'));
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;

        document.body.appendChild(renderer.domElement);
        window.addEventListener('resize', onWindowResize, false);

        controls = new THREE.TrackballControls(camera, renderer.domElement);
        controls.zoomSpeed = 0.5;
    }

    function animate() {
        renderer.render(scene, camera);
        controls.update();
        window.requestAnimationFrame(animate);
    }
}
