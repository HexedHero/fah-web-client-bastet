/**
 * @author zz85 / https://github.com/zz85
 *
 * Based on "A Practical Analytic Model for Daylight"
 * aka The Preetham Model, the de facto standard analytic skydome model
 * http://www.cs.utah.edu/~shirley/papers/sunsky/sunsky.pdf
 *
 * First implemented by Simon Wallner
 * http://www.simonwallner.at/projects/atmospheric-scattering
 *
 * Improved by Martin Upitis
 * http://blenderartists.org/forum/showthread.php?
 *   245954-preethams-sky-impementation-HDR
 *
 * Three.js integration by zz85 http://twitter.com/blurspline
 *
 * Node.js module implementation by Danila Loginov https://loginov.rocks
 */
import * as THREE from 'three'
import vertexShader   from './sky.vert?raw'
import fragmentShader from './sky.frag?raw'


class Sky extends THREE.Mesh {
  constructor() {
    const material = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      fragmentShader,
      vertexShader,
      uniforms: {
        luminance:       {value: 1},
        turbidity:       {value: 10},
        rayleigh:        {value: 2},
        mieCoefficient:  {value: 0.005},
        mieDirectionalG: {value: 0.8},
        sunPosition:     {value: new THREE.Vector3(-200, -3, -200)}
      }
    })

    super(new THREE.SphereBufferGeometry(5000, 320, 150), material)
  }
}


export default Sky
