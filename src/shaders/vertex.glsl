uniform float uSize;
uniform float uPixelRatio;

uniform float uScroll;
uniform float uTime;

attribute float aScales;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Additional dynamic scattering effect based on scroll and time
    float scatterAmount = sin(uScroll * .1 + uTime * .002) * 8.0; // Adjust the factor as needed
    modelPosition.xyz += scatterAmount * normalize(modelPosition.xyz);

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    gl_Position = projectionPosition;

    // // Add an animated size pulsation
    // float pulsation = abs(sin(uTime * 1.0)); // Adjust the speed of pulsation
    // gl_PointSize = uSize * uPixelRatio * pulsation;
    gl_PointSize = uSize * uPixelRatio * aScales;

    gl_PointSize *= (1.0 / -viewPosition.z);
}
