uniform sampler2D uAlphaMap;

void main() {
    float alphaValue = texture2D(uAlphaMap, gl_PointCoord).r;
    gl_FragColor = vec4(1.0, 1.0, 1.0, alphaValue);
}
