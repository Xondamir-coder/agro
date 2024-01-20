uniform sampler2D uTexture;

void main() {
    vec4 textureColor = texture2D(uTexture, gl_PointCoord);
    gl_FragColor = textureColor;
}
