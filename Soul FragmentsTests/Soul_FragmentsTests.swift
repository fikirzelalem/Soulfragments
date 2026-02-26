import Testing
import SceneKit
@testable import Soul_Fragments

@Suite("GameState Tests")
struct GameStateTests {

    // MARK: - Phase

    @Test func startsOnMenu() {
        let state = GameState()
        #expect(state.gamePhase == .menu)
    }

    @Test func startGameSetsPlayingPhase() {
        let state = GameState()
        state.startGame()
        #expect(state.gamePhase == .playing)
    }

    @Test func completeLevelSetsLevelCompletePhase() {
        let state = GameState()
        state.startGame()
        state.completeLevel()
        #expect(state.gamePhase == .levelComplete)
    }

    // MARK: - Dimension Switching

    @Test func defaultDimensionIsReality() {
        let state = GameState()
        #expect(state.currentDimension == .reality)
    }

    @Test func canSwitchDimension() {
        let state = GameState()
        state.switchDimension(to: .dream)
        #expect(state.currentDimension == .dream)
    }

    @Test func switchingToSameDimensionDoesNothing() {
        let state = GameState()
        state.switchDimension(to: .reality)
        #expect(state.currentDimension == .reality)
    }

    // MARK: - Ability Collection

    @Test func collectingAbilityMarksItCollected() {
        let state = GameState()
        state.startGame()
        let ability = state.abilities.first!
        state.collectAbility(id: ability.id)
        #expect(state.abilities.first { $0.id == ability.id }?.isCollected == true)
    }

    @Test func hasDoubleJumpAfterCollecting() {
        let state = GameState()
        state.startGame()
        guard let djAbility = state.abilities.first(where: { $0.type == .doubleJump }) else {
            Issue.record("No doubleJump ability found"); return
        }
        state.collectAbility(id: djAbility.id)
        #expect(state.hasDoubleJump == true)
    }

    // MARK: - Ability Combinations

    @Test func phaseJumpUnlockedWithDoubleJumpAndPhaseShift() {
        let state = GameState()
        state.startGame()
        collectAll(types: [.doubleJump, .phaseShift], in: state)
        #expect(state.combinedAbilities.contains(.phaseJump))
    }

    @Test func ultimateSoulRequiresAllThree() {
        let state = GameState()
        state.startGame()
        collectAll(types: [.doubleJump, .phaseShift, .timeSlow], in: state)
        #expect(state.combinedAbilities.contains(.ultimateSoul))
    }

    @Test func noCombinationWithOnlyOneAbility() {
        let state = GameState()
        state.startGame()
        collectAll(types: [.doubleJump], in: state)
        #expect(state.combinedAbilities.isEmpty)
    }

    // MARK: - Interactive Objects

    @Test func activatingObjectSetsItActive() {
        let state = GameState()
        state.startGame()
        let obj = state.interactiveObjects.first!
        state.activateObject(id: obj.id)
        #expect(state.interactiveObjects.first { $0.id == obj.id }?.isActive == true)
    }

    // MARK: - Level Progression

    @Test func advanceLevelIncrementsLevel() {
        let state = GameState()
        state.startGame()
        state.completeLevel()
        state.advanceLevel()
        #expect(state.currentLevel == 2)
    }

    @Test func cannotAdvancePastMaxLevel() {
        let state = GameState()
        for _ in 0..<10 { state.advanceLevel() }
        #expect(state.currentLevel <= state.maxLevel)
    }

    // MARK: - Reset

    @Test func resetRestoresDefaults() {
        let state = GameState()
        state.startGame()
        collectAll(types: [.doubleJump, .phaseShift, .timeSlow], in: state)
        state.resetGame()
        #expect(state.gamePhase       == .menu)
        #expect(state.currentLevel    == 1)
        #expect(state.currentDimension == .reality)
        #expect(state.combinedAbilities.isEmpty)
    }

    // MARK: - Helpers

    private func collectAll(types: [AbilityType], in state: GameState) {
        for type in types {
            if let ability = state.abilities.first(where: { $0.type == type }) {
                state.collectAbility(id: ability.id)
            }
        }
    }
}
