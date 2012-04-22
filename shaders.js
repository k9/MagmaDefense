function Shaders() {
    this.solid = new GL.Shader('\
        uniform float seconds;\
        uniform float scale;\
        uniform float pulse;\
        void main() {\
            vec3 pos = gl_Vertex.xyz * (scale + pulse * sin(seconds * 3.0));\
            gl_Position = gl_ModelViewProjectionMatrix * vec4(pos, 1.0);\
        }\
        ', '\
        uniform vec4 color;\
        void main() {\
            gl_FragColor = vec4(color);\
        }\
    ');
}