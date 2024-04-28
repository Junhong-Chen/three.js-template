import { AnimationMixer, BufferAttribute, CircleGeometry, DoubleSide, Mesh, MeshStandardMaterial, PlaneGeometry, RawShaderMaterial, SRGBColorSpace, Vector2 } from "three"
import Light from "./light"
import vertexShader from "../shaders/wave/vertex.vs.glsl"
import fragmentShader from "../shaders/wave/fragment.fs.glsl"

export default class World {
  #scene
  #debugger
  #time
  #animations = []

  constructor(app) {
    this.#scene = app.scene
    this.#debugger = app.debugger
    this.#time = app.time

    this.light = new Light(app)
  }

  init(sources) {
    for (const source of sources.values()) {
      switch(source[0].type) {
        case 'gltf':
          this.addModel(...source)
          break
        case 'texture':
          const textures = source.map(el => el.file)
          // this.addTexture(textures)
          break
      }
    }
    this.addShader()
  }

  update(deltaTime) {
    for (const animation of this.#animations) {
      animation.mixer.update(deltaTime)
    }
  }

  addModel ({ file: model }) {
    model.scene.traverse((obj) => {
      if (obj.isMesh && obj.material.isMeshStandardMaterial) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })
    
    // fox
    if (model.name === 'fox') {
      model.scene.scale.set(0.02, 0.02, 0.02)
    }
    this.#scene.add(model.scene)

    if (model.animations.length) {
      this.addAnimation(model)
    }
  }

  addAnimation(model) {
    const mixer = new AnimationMixer(model.scene)
    const actions = {}
    let active

    for (let i = 0; i < model.animations.length; i++) {
      const clip = model.animations[i]
      const name = clip.name || i
      actions[name] = mixer.clipAction(clip)
      if (i === 0) {
        active = name
      }
    }

    this.#animations.push({
      mixer,
      actions
    })
    
    actions[active].play()

    if (this.#debugger.gui) {
      const folder = this.#debugger.gui.addFolder(model.name.toUpperCase())
      const guiParams = {
        action: active
      }
      const actionsName = Object.keys(actions)

      folder.add(guiParams, 'action', actionsName).onFinishChange((name) => {
        const oldAcion = actions[active]
        const newAcion = actions[name]
        active = name

        newAcion.reset()
        newAcion.play()
        newAcion.crossFadeFrom(oldAcion, 1)
      })
    }
  }

  addTexture(textures) {
    // floor
    const map = textures.find(texture => texture.name === 'floor-color')
    const normalMap = textures.find(texture => texture.name === 'floor-normal')

    map.colorSpace = SRGBColorSpace

    const floor = new Mesh(
      new CircleGeometry(5),
      new MeshStandardMaterial({
        map,
        normalMap
      })
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true

    this.#scene.add(floor)
  }

  addShader() {
    const geometry = new PlaneGeometry(2, 2, 32, 32)

    const material = new RawShaderMaterial({
      vertexShader,
      fragmentShader,
      side: DoubleSide,
      transparent: true,
      uniforms: {
        uFrequency: { value: new Vector2(5, 5) },
        uTime: { value: this.#time.elapsed }
      }
    })

    if (this.#debugger.gui) {
      const folder = this.#debugger.gui.addFolder('WAVE')
      folder.add(material.uniforms.uFrequency.value, 'x').min(0).max(10).name('frequencyX')
      folder.add(material.uniforms.uFrequency.value, 'y').min(0).max(10).name('frequencyY')
    }

    this.#time.on('tick', function({ elapsedTime }) {
      material.uniforms.uTime.value = elapsedTime
    })

    const plane = new Mesh(
      geometry,
      material
    )
    plane.position.set(0, 0.01, 0)
    plane.rotation.x = -Math.PI / 2
    plane.castShadow = true
    plane.receiveShadow = true
    this.#scene.add(plane)
  }

  destroy() {
		this.#scene.traverse(child => {
			if (child.isMesh) {
				child.geometry.dispose()
        for (const key in child.material) {
          const value = child.material[key]
          if (value && value.dispose instanceof Function) {
            value.dispose()
          }
        }
			}
		})
  }
}