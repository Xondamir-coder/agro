uniform sampler2D uAlphaMap;
uniform vec3 uColor;

void main() {
    float alphaValue = texture2D(uAlphaMap, gl_PointCoord).r;
    gl_FragColor = vec4(uColor, alphaValue);
}
