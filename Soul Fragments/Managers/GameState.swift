import Foundation
import SceneKit
import UIKit

// MARK: - Enums

enum Dimension: Int, Codable, CaseIterable {
    case reality = 1
    case dream = 2
    case memory = 3

    var displayName: String {
        switch self {
        case .reality: return "Reality"
        case .dream:   return "Dream"
        case .memory:  return "Memory"
        }
    }

    var color: UIColor {
        switch self {
        case .reality: return UIColor(red: 1.0, green: 0.2, blue: 0.8, alpha: 1.0) // Pink
        case .dream:   return UIColor(red: 0.0, green: 0.9, blue: 0.9, alpha: 1.0) // Cyan
        case .memory:  return UIColor(red: 1.0, green: 0.9, blue: 0.0, alpha: 1.0) // Yellow
        }
    }

    var fogColor: UIColor {
        switch self {
        case .reality: return UIColor(red: 0.3, green: 0.0, blue: 0.3, alpha: 1.0)
        case .dream:   return UIColor(red: 0.0, green: 0.2, blue: 0.3, alpha: 1.0)
        case .memory:  return UIColor(red: 0.3, green: 0.3, blue: 0.0, alpha: 1.0)
        }
    }
}

enum GamePhase: String, Codable {
    case menu
    case playing
    case paused
    case levelComplete
}

enum AbilityType: String, Codable, CaseIterable {
    case doubleJump  = "Double Jump"
    case phaseShift  = "Phase Shift"
    case timeSlow    = "Time Slow"
}

enum CombinedAbility: String, Codable, CaseIterable {
    case phaseJump   = "Phase Jump"
    case timePhase   = "Time Phase"
    case timeJump    = "Time Jump"
    case ultimateSoul = "Ultimate Soul"
}

enum InteractiveObjectType: String, Codable {
    case switch_     = "switch"
    case door        = "door"
    case platform    = "platform"
    case gravityZone = "gravityZone"
    case timeZone    = "timeZone"
}

// MARK: - Models

struct SCNVector3Codable: Codable {
    var x: Float
    var y: Float
    var z: Float

    init(_ v: SCNVector3) { x = v.x; y = v.y; z = v.z }

    var value: SCNVector3 { SCNVector3(x, y, z) }
}

struct Ability: Identifiable, Codable {
    let id: UUID
    let type: AbilityType
    let dimension: Dimension
    var isCollected: Bool
    var position: SCNVector3Codable

    init(type: AbilityType, dimension: Dimension, position: SCNVector3) {
        self.id          = UUID()
        self.type        = type
        self.dimension   = dimension
        self.isCollected = false
        self.position    = SCNVector3Codable(position)
    }
}

struct InteractiveObject: Identifiable, Codable {
    let id: UUID
    let type: InteractiveObjectType
    var isActive: Bool
    var position: SCNVector3Codable
    var targetDimension: Dimension?
    var linkedObjectID: UUID?

    init(type: InteractiveObjectType, position: SCNVector3, targetDimension: Dimension? = nil) {
        self.id              = UUID()
        self.type            = type
        self.isActive        = false
        self.position        = SCNVector3Codable(position)
        self.targetDimension = targetDimension
    }
}

// MARK: - GameState

@Observable
class GameState {

    // MARK: Phase & Level
    var gamePhase: GamePhase = .menu
    var currentLevel: Int    = 1
    let maxLevel: Int        = 5

    // MARK: Dimension
    var currentDimension: Dimension = .reality

    // MARK: Player Positions (one per dimension)
    var playerPositions: [Dimension: SCNVector3] = [
        .reality: SCNVector3(0, 1, 0),
        .dream:   SCNVector3(0, 1, 0),
        .memory:  SCNVector3(0, 1, 0)
    ]

    // MARK: Abilities & Objects
    var abilities: [Ability]               = []
    var combinedAbilities: [CombinedAbility] = []
    var interactiveObjects: [InteractiveObject] = []

    // MARK: - Computed

    var collectedAbilities: [Ability] { abilities.filter { $0.isCollected } }
    var hasDoubleJump:  Bool { collectedAbilities.contains { $0.type == .doubleJump } }
    var hasPhaseShift:  Bool { collectedAbilities.contains { $0.type == .phaseShift } }
    var hasTimeSlow:    Bool { collectedAbilities.contains { $0.type == .timeSlow   } }

    var currentPlayerPosition: SCNVector3 {
        get { playerPositions[currentDimension] ?? SCNVector3(0, 1, 0) }
        set { playerPositions[currentDimension] = newValue }
    }

    // MARK: - Actions

    func startGame() {
        setupLevel(currentLevel)
        gamePhase = .playing
    }

    func switchDimension(to dimension: Dimension) {
        guard dimension != currentDimension else { return }
        currentDimension = dimension
    }

    func collectAbility(id: UUID) {
        guard let i = abilities.firstIndex(where: { $0.id == id }) else { return }
        abilities[i].isCollected = true
        checkCombinations()
        save()
    }

    func activateObject(id: UUID) {
        guard let i = interactiveObjects.firstIndex(where: { $0.id == id }) else { return }
        interactiveObjects[i].isActive = true
    }

    func completeLevel() {
        gamePhase = .levelComplete
        save()
    }

    func advanceLevel() {
        guard currentLevel < maxLevel else { return }
        currentLevel += 1
        startGame()
    }

    func resetGame() {
        gamePhase       = .menu
        currentLevel    = 1
        currentDimension = .reality
        playerPositions  = [
            .reality: SCNVector3(0, 1, 0),
            .dream:   SCNVector3(0, 1, 0),
            .memory:  SCNVector3(0, 1, 0)
        ]
        abilities          = []
        combinedAbilities  = []
        interactiveObjects = []
        clearSave()
    }

    // MARK: - Private Helpers

    private func checkCombinations() {
        var result: [CombinedAbility] = []
        if hasDoubleJump && hasPhaseShift  { result.append(.phaseJump)    }
        if hasPhaseShift && hasTimeSlow    { result.append(.timePhase)    }
        if hasDoubleJump && hasTimeSlow    { result.append(.timeJump)     }
        if hasDoubleJump && hasPhaseShift && hasTimeSlow { result.append(.ultimateSoul) }
        combinedAbilities = result
    }

    private func setupLevel(_ level: Int) {
        abilities          = defaultAbilities(for: level)
        interactiveObjects = defaultObjects(for: level)
    }

    private func defaultAbilities(for level: Int) -> [Ability] {
        [
            Ability(type: .doubleJump, dimension: .reality, position: SCNVector3( 5, 1,  0)),
            Ability(type: .phaseShift, dimension: .dream,   position: SCNVector3(-5, 1,  0)),
            Ability(type: .timeSlow,   dimension: .memory,  position: SCNVector3( 0, 1,  5))
        ]
    }

    private func defaultObjects(for level: Int) -> [InteractiveObject] {
        [
            InteractiveObject(type: .switch_,     position: SCNVector3( 8, 1,  0), targetDimension: .dream),
            InteractiveObject(type: .door,        position: SCNVector3(10, 0,  0), targetDimension: .dream),
            InteractiveObject(type: .platform,    position: SCNVector3( 0, 3,  5)),
            InteractiveObject(type: .gravityZone, position: SCNVector3(-8, 2,  0)),
            InteractiveObject(type: .timeZone,    position: SCNVector3( 0, 1, -8))
        ]
    }

    // MARK: - Persistence

    private let saveKey = "SoulFragments_Save"

    func save() {
        let data = SaveData(
            currentLevel:      currentLevel,
            currentDimension:  currentDimension,
            abilities:         abilities,
            combinedAbilities: combinedAbilities
        )
        if let encoded = try? JSONEncoder().encode(data) {
            UserDefaults.standard.set(encoded, forKey: saveKey)
        }
    }

    func load() {
        guard
            let raw   = UserDefaults.standard.data(forKey: saveKey),
            let saved = try? JSONDecoder().decode(SaveData.self, from: raw)
        else { return }

        currentLevel      = saved.currentLevel
        currentDimension  = saved.currentDimension
        abilities         = saved.abilities
        combinedAbilities = saved.combinedAbilities
    }

    func clearSave() {
        UserDefaults.standard.removeObject(forKey: saveKey)
    }
}

// MARK: - Save Model

private struct SaveData: Codable {
    let currentLevel:      Int
    let currentDimension:  Dimension
    let abilities:         [Ability]
    let combinedAbilities: [CombinedAbility]
}
