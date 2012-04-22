function Shaders() {
    this.solid = new GL.Shader('\
        uniform float seconds;\
        uniform float scale;\
        uniform float pulse;\
        uniform float wave;\
        void main() {\
            float totalScale = scale + pulse * sin(seconds * 3.0);\
            totalScale += wave * sin(seconds * 4.0 + gl_Vertex.x + gl_Vertex.z);\
            vec3 pos = gl_Vertex.xyz * totalScale;\
            gl_Position = gl_ModelViewProjectionMatrix * vec4(pos, 1.0);\
        }\
        ', '\
        uniform vec4 color;\
        void main() {\
            gl_FragColor = vec4(color.rgba);\
        }\
    ');
}