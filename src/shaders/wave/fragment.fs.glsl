precision mediump float;

varying vec2 vuv;

void main() {
  gl_FragColor = vec4(vuv, 0.5, 1.0);
}