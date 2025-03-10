// Global constants
const canvas = document.getElementById('glCanvas'); // Get the canvas element 
const gl = canvas.getContext('webgl2'); // Get the WebGL2 context

if (!gl) {
    console.error('WebGL 2 is not supported by your browser.');
}

// Set canvas size: 현재 window 전체를 canvas로 사용
canvas.width = 500;
canvas.height = 500;

// Initialize WebGL settings: viewport and clear color
gl.viewport(0, 0, canvas.width, canvas.height);


gl.clearColor(0.0, 1.0, 0.0, 1.0);

gl.enable(gl.SCISSOR_TEST);




// Start rendering
render();

// Render loop
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);    
    // Draw something here

    gl.scissor(0, 0, canvas.width/2, canvas.height/2);
    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);  

    gl.scissor(canvas.width/2, 0, canvas.width, canvas.height/2);
    gl.clearColor(1.0, 1.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);  

    gl.scissor(0, canvas.height/2, canvas.width/2, canvas.height);
    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);  

    gl.scissor(canvas.width/2, canvas.height/2, canvas.width, canvas.height);
    gl.clearColor(0.0, 1.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);  

}

// Resize viewport when window size changes
window.addEventListener('resize', () => {
    let smaller = (window.innerWidth > window.innerHeight)?window.innerHeight:window.innerWidth;
    canvas.width = smaller;
    canvas.height = smaller;
    gl.viewport(0, 0, canvas.width, canvas.height);
    render();
});

