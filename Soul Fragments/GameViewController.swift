//
//  GameViewController.swift
//  Soul Fragments
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
    var cameraArm: SCNNode!   // pivot that follows the player

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

    // MARK: - View

    private func setupView() {
        scnView = self.view as! SCNView
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
            mat.diffuse.contents  = UIColor(red: 0.12, green: 0.06, blue: 0.18, alpha: 1.0)
            mat.specular.contents = UIColor(red: 0.3,  green: 0.1,  blue: 0.5,  alpha: 1.0)
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
        let capsule = SCNCapsule(capRadius: 0.35, height: 1.5)
        let mat = SCNMaterial()
        mat.diffuse.contents  = UIColor(red: 0.7,  green: 0.15, blue: 0.95, alpha: 1.0)
        mat.emission.contents = UIColor(red: 0.35, green: 0.0,  blue: 0.55, alpha: 1.0)
        mat.roughness.contents = 0.4
        capsule.materials = [mat]

        playerNode = SCNNode(geometry: capsule)
        playerNode.name = "player"
        playerNode.position = SCNVector3(0, 0.75, 0)

        let shape = SCNPhysicsShape(geometry: capsule, options: nil)
        playerNode.physicsBody = SCNPhysicsBody(type: .kinematic, shape: shape)

        // Glow point light attached to player
        let glow = SCNLight()
        glow.type = .omni
        glow.color = UIColor(red: 0.6, green: 0.0, blue: 1.0, alpha: 1.0)
        glow.intensity = 250
        glow.attenuationStartDistance = 0.5
        glow.attenuationEndDistance = 5

        let glowNode = SCNNode()
        glowNode.light = glow
        playerNode.addChildNode(glowNode)

        scene.rootNode.addChildNode(playerNode)
    }

    // MARK: - Camera

    private func setupCamera() {
        // Arm anchored to player position, camera sits behind + above
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
        // Directional "moonlight"
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

        // Dark ambient
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
