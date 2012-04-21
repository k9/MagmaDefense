function Shaders() {
    this.solid = new GL.Shader('\
        void main() {\
            gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;\
        }\
        ', '\
        uniform vec3 color;\
        void main() {\
            gl_FragColor = vec4(color, 1.0);\
        }\
    ');
}