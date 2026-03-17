//
//  GameViewController.swift
//  Soul Fragments
//  Created by Fikir  on 2/24/26.
//

import UIKit
import SceneKit

class GameViewController: UIViewController {

    // MARK: - Properties

    let gameState = GameState()

    var scnView: SCNView!
    var scene: SCNScene!

    var playerNode: SCNNode!
    var cameraNode: SCNNode!
    var cameraArm: SCNNode!

    // MARK: - Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()

        setupView()
        setupScene()
        setupGround()
        setupObstacles()
        setupPlayer()
        setupCamera()
        setupLighting()

        gameState.load()
        gameState.startGame()
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        scnView.frame = view.bounds
    }

    // MARK: - View

    private func setupView() {
        scnView = self.view as? SCNView
        scnView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        scnView.showsStatistics = true
        scnView.antialiasingMode = .multisampling4X
        scnView.allowsCameraControl = false
    }

    // MARK: - Scene

    private func setupScene() {
        scene = SCNScene()
        scnView.scene = scene
        applyDimensionAtmosphere(gameState.currentDimension)
    }

    private func applyDimensionAtmosphere(_ dimension: Dimension) {
        scene.fogColor = dimension.fogColor
        scene.fogStartDistance = 18
        scene.fogEndDistance = 45
        scene.background.contents = UIColor(red: 0.02, green: 0.0, blue: 0.05, alpha: 1.0)
    }

    // MARK: - Ground

    private func setupGround() {
        let floor = SCNFloor()
        floor.reflectivity = 0.08
        floor.reflectionFalloffEnd = 6

        let mat = SCNMaterial()
        mat.diffuse.contents = UIColor(red: 0.08, green: 0.04, blue: 0.12, alpha: 1.0)
        mat.roughness.contents = 1.0
        floor.materials = [mat]

        let groundNode = SCNNode(geometry: floor)
        groundNode.name = "ground"
        groundNode.physicsBody = SCNPhysicsBody(type: .static, shape: nil)
        scene.rootNode.addChildNode(groundNode)
    }

    // MARK: - Obstacles

    private func setupObstacles() {
        let layout: [(SCNVector3, Float)] = [
            (SCNVector3( 5, 0,  -4), 1.2),
            (SCNVector3(-4, 0,  -6), 1.6),
            (SCNVector3( 3, 0,   6), 1.0),
            (SCNVector3(-7, 0,   3), 2.0),
            (SCNVector3( 8, 0,   1), 0.9),
            (SCNVector3(-2, 0,  -9), 1.4),
        ]

        for (pos, size) in layout {
            let box = SCNBox(
                width:  CGFloat(size),
                height: CGFloat(size * 2.2),
                length: CGFloat(size),
                chamferRadius: 0.04
            )
            let mat = SCNMaterial()
            mat.diffuse.contents   = UIColor(red: 0.12, green: 0.06, blue: 0.18, alpha: 1.0)
            mat.specular.contents  = UIColor(red: 0.3,  green: 0.1,  blue: 0.5,  alpha: 1.0)
            mat.roughness.contents = 0.85
            box.materials = [mat]

            let node = SCNNode(geometry: box)
            node.name = "obstacle"
            node.position = SCNVector3(pos.x, size * 1.1, pos.z)
            node.physicsBody = SCNPhysicsBody(type: .static, shape: nil)
            scene.rootNode.addChildNode(node)
        }
    }

    // MARK: - Player

    private func setupPlayer() {
        // Root node — collision capsule, no geometry
        playerNode = SCNNode()
        playerNode.name = "player"
        playerNode.position = SCNVector3(0, 0.9, 0)

        let collisionCapsule = SCNCapsule(capRadius: 0.35, height: 1.8)
        let shape = SCNPhysicsShape(geometry: collisionCapsule, options: nil)
        playerNode.physicsBody = SCNPhysicsBody(type: .kinematic, shape: shape)

        // Build humanoid and attach
        let humanoid = buildHumanoid()
        playerNode.addChildNode(humanoid)

        // Glow light
        let glow = SCNLight()
        glow.type = .omni
        glow.color = UIColor(red: 0.6, green: 0.0, blue: 1.0, alpha: 1.0)
        glow.intensity = 300
        glow.attenuationStartDistance = 0.5
        glow.attenuationEndDistance = 5
        let glowNode = SCNNode()
        glowNode.light = glow
        playerNode.addChildNode(glowNode)

        scene.rootNode.addChildNode(playerNode)
    }

    /// Builds a humanoid figure from SceneKit primitives.
    /// Root is at waist level; total height ~1.8 units.
    private func buildHumanoid() -> SCNNode {
        let root = SCNNode()

        func bodyMat(emission: Float = 0.3) -> SCNMaterial {
            let m = SCNMaterial()
            m.diffuse.contents  = UIColor(red: 0.18, green: 0.08, blue: 0.28, alpha: 1.0)
            m.emission.contents = UIColor(red: CGFloat(0.5 * emission), green: 0.0, blue: CGFloat(0.8 * emission), alpha: 1.0)
            m.roughness.contents = 0.6
            return m
        }

        func glowMat() -> SCNMaterial {
            let m = SCNMaterial()
            m.diffuse.contents  = UIColor(red: 0.7,  green: 0.1,  blue: 1.0, alpha: 1.0)
            m.emission.contents = UIColor(red: 0.5,  green: 0.0,  blue: 0.9, alpha: 1.0)
            m.roughness.contents = 0.2
            return m
        }

        func add(_ geo: SCNGeometry, mat: SCNMaterial, pos: SCNVector3,
                 rot: SCNVector4 = SCNVector4(0,0,0,0), to parent: SCNNode) {
            geo.materials = [mat]
            let n = SCNNode(geometry: geo)
            n.position = pos
            if rot.w != 0 { n.rotation = rot }
            parent.addChildNode(n)
        }

        // Head
        add(SCNSphere(radius: 0.18),
            mat: bodyMat(emission: 0.5),
            pos: SCNVector3(0, 0.72, 0), to: root)

        // Eyes (small glowing spheres)
        add(SCNSphere(radius: 0.04), mat: glowMat(),
            pos: SCNVector3(-0.07, 0.76, 0.16), to: root)
        add(SCNSphere(radius: 0.04), mat: glowMat(),
            pos: SCNVector3( 0.07, 0.76, 0.16), to: root)

        // Neck
        add(SCNCylinder(radius: 0.07, height: 0.12),
            mat: bodyMat(),
            pos: SCNVector3(0, 0.52, 0), to: root)

        // Torso
        add(SCNBox(width: 0.42, height: 0.48, length: 0.22, chamferRadius: 0.02),
            mat: bodyMat(emission: 0.4),
            pos: SCNVector3(0, 0.22, 0), to: root)

        // Shoulders (decorative spheres)
        add(SCNSphere(radius: 0.1), mat: glowMat(),
            pos: SCNVector3(-0.26, 0.4, 0), to: root)
        add(SCNSphere(radius: 0.1), mat: glowMat(),
            pos: SCNVector3( 0.26, 0.4, 0), to: root)

        // Upper arms
        let armRot = SCNVector4(0, 0, 1, Float.pi / 2)
        let armRotR = SCNVector4(0, 0, 1, -Float.pi / 2)
        add(SCNCylinder(radius: 0.07, height: 0.36),
            mat: bodyMat(), pos: SCNVector3(-0.36, 0.22, 0),
            rot: armRot, to: root)
        add(SCNCylinder(radius: 0.07, height: 0.36),
            mat: bodyMat(), pos: SCNVector3( 0.36, 0.22, 0),
            rot: armRotR, to: root)

        // Lower arms
        add(SCNCylinder(radius: 0.055, height: 0.32),
            mat: bodyMat(), pos: SCNVector3(-0.36, 0.0, 0),
            rot: armRot, to: root)
        add(SCNCylinder(radius: 0.055, height: 0.32),
            mat: bodyMat(), pos: SCNVector3( 0.36, 0.0, 0),
            rot: armRotR, to: root)

        // Hands
        add(SCNSphere(radius: 0.08), mat: glowMat(),
            pos: SCNVector3(-0.55, 0.0, 0), to: root)
        add(SCNSphere(radius: 0.08), mat: glowMat(),
            pos: SCNVector3( 0.55, 0.0, 0), to: root)

        // Pelvis
        add(SCNBox(width: 0.38, height: 0.14, length: 0.2, chamferRadius: 0.02),
            mat: bodyMat(), pos: SCNVector3(0, -0.07, 0), to: root)

        // Upper legs
        add(SCNCylinder(radius: 0.09, height: 0.42),
            mat: bodyMat(), pos: SCNVector3(-0.13, -0.38, 0), to: root)
        add(SCNCylinder(radius: 0.09, height: 0.42),
            mat: bodyMat(), pos: SCNVector3( 0.13, -0.38, 0), to: root)

        // Knees
        add(SCNSphere(radius: 0.09), mat: glowMat(),
            pos: SCNVector3(-0.13, -0.6, 0), to: root)
        add(SCNSphere(radius: 0.09), mat: glowMat(),
            pos: SCNVector3( 0.13, -0.6, 0), to: root)

        // Lower legs
        add(SCNCylinder(radius: 0.075, height: 0.38),
            mat: bodyMat(), pos: SCNVector3(-0.13, -0.82, 0), to: root)
        add(SCNCylinder(radius: 0.075, height: 0.38),
            mat: bodyMat(), pos: SCNVector3( 0.13, -0.82, 0), to: root)

        // Feet
        add(SCNBox(width: 0.14, height: 0.08, length: 0.26, chamferRadius: 0.03),
            mat: bodyMat(), pos: SCNVector3(-0.13, -1.02, 0.04), to: root)
        add(SCNBox(width: 0.14, height: 0.08, length: 0.26, chamferRadius: 0.03),
            mat: bodyMat(), pos: SCNVector3( 0.13, -1.02, 0.04), to: root)

        return root
    }

    // MARK: - Camera

    private func setupCamera() {
        cameraArm = SCNNode()
        cameraArm.position = playerNode.position
        scene.rootNode.addChildNode(cameraArm)

        let cam = SCNCamera()
        cam.zNear = 0.1
        cam.zFar  = 120
        cam.fieldOfView = 68

        cameraNode = SCNNode()
        cameraNode.camera = cam
        cameraNode.position = SCNVector3(0, 5, 11)

        let lookAt = SCNLookAtConstraint(target: playerNode)
        lookAt.isGimbalLockEnabled = true
        cameraNode.constraints = [lookAt]

        cameraArm.addChildNode(cameraNode)
        scnView.pointOfView = cameraNode
    }

    // MARK: - Lighting

    private func setupLighting() {
        let moon = SCNLight()
        moon.type = .directional
        moon.color = UIColor(red: 0.35, green: 0.35, blue: 0.75, alpha: 1.0)
        moon.intensity = 900
        moon.castsShadow = true
        moon.shadowMode  = .deferred
        moon.shadowColor = UIColor(white: 0, alpha: 0.75)
        moon.shadowRadius = 4
        moon.shadowSampleCount = 8

        let moonNode = SCNNode()
        moonNode.light = moon
        moonNode.eulerAngles = SCNVector3(-Float.pi / 3, Float.pi / 4, 0)
        scene.rootNode.addChildNode(moonNode)

        let ambient = SCNLight()
        ambient.type = .ambient
        ambient.color = UIColor(red: 0.04, green: 0.0, blue: 0.08, alpha: 1.0)
        ambient.intensity = 350

        let ambientNode = SCNNode()
        ambientNode.light = ambient
        scene.rootNode.addChildNode(ambientNode)
    }

    // MARK: - System

    override var prefersStatusBarHidden: Bool { true }

    override var supportedInterfaceOrientations: UIInterfaceOrientationMask {
        UIDevice.current.userInterfaceIdiom == .phone ? .allButUpsideDown : .all
    }
}
