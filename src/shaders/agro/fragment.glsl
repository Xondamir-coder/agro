uniform sampler2D uAlphaMap;
uniform vec3 uColor;
uniform float uAlpha;

void main() {
    float alphaValue = texture2D(uAlphaMap, gl_PointCoord).r;
    gl_FragColor = vec4(uColor, alphaValue * uAlpha);
}
