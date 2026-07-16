import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';

// Animated aurora background: a fullscreen triangle rendered with a custom
// GLSL fragment shader (simplex noise + a colour ramp) on raw WebGL2 via OGL.
const geometry = new Triangle(gl);

program = new Program(gl, {
  vertex: VERT,
  fragment: FRAG,
  uniforms: {
    uTime:       { value: 0 },
    uAmplitude:  { value: amplitude },
    uColorStops: { value: colorStopsArray },
    uResolution: { value: [ctn.offsetWidth, ctn.offsetHeight] },
    uBlend:      { value: blend },
  },
});

const mesh = new Mesh(gl, { geometry, program });

const update = (t) => {
  animateId = requestAnimationFrame(update);
  program.uniforms.uTime.value = t * speed * 0.001;
  renderer.render({ scene: mesh });
};
