uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform vec2 uFrequency;
uniform float uTime;
uniform float uAmplitude;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vuv;


void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  float range = pow(uAmplitude > 1.25 ? uAmplitude : 1.0, 0.25);

  modelPosition.x += sin(modelPosition.z * uFrequency.x * range + uTime) * 0.1;
  modelPosition.x += cos(modelPosition.z * uFrequency.y * range + uTime) * 0.1;
  modelPosition.z += sin(modelPosition.x * uFrequency.x * range + uTime) * 0.1;
  modelPosition.z += cos(modelPosition.x * uFrequency.y * range + uTime) * 0.1;

  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;

  vuv = uv;
}