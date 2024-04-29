import { AmbientLight, DirectionalLight } from "three"

export default class Light {
  #scene

  constructor(app) {
    this.#scene = app.scene

    this.init()
  }

  init() {
    this.addAmbientLight()
    this.addDirectionalLight()
  }

  addAmbientLight() {
    const aLight = new AmbientLight('white', 0.2)
    this.#scene.add(aLight)
  }

  addDirectionalLight() {
    const dLight = new DirectionalLight('white', 3)
    dLight.position.set(4, 4, 4)
    dLight.castShadow = true
    dLight.shadow.camera.far = 16
    dLight.shadow.mapSize.set(256, 256)
    dLight.shadow.normalBias = 0.05
    this.#scene.add(dLight)
  }
}