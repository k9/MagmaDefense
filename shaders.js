function Shaders() {
    this.dirt = new GL.Shader('\
        void main() {\
            gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;\
        }\
        ', '\
        varying vec3 normal;\
        void main() {\
            gl_FragColor = vec4(0.41, 0.25, 0.15, 1.0);\
        }\
    ');
}