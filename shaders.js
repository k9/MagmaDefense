function Shaders() {
    this.solid = new GL.Shader('\
        void main() {\
            gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;\
        }\
        ', '\
        uniform vec4 color;\
        void main() {\
            gl_FragColor = color;\
        }\
    ');
}