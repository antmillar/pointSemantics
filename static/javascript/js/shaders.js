export default class Shaders
{
    //returns a string to be passed as text to GLSL by threejs
    static vertexShader()
    {
        return `
        
        attribute float pointSize;
        attribute vec3 color;
        varying vec3 shaderColor;
        
        void main()
        {
            gl_PointSize = pointSize;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            shaderColor = color;
        }
        `

    }

    //returns a string to be passed as text to GLSL by threejs
    static fragmentShader()
    {
        return `
        varying vec3 shaderColor;

        void main(){
            gl_FragColor = vec4(shaderColor, 1.0);
        }
        `

    }
}