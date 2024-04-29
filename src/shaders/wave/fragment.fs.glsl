precision mediump float;

varying vec2 vuv;
varying float vTime;

mat2 rotation;

void main() {
  rotation = mat2(cos(vTime), -sin(vTime), sin(vTime), cos(vTime));
  gl_FragColor = vec4((vuv - 0.5) * rotation, 0.5, 1.0);
}