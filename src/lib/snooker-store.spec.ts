import { describe, it, expect } from 'vitest';
import { createSnookerStore, type GameState } from './snooker-store';

describe('snooker store', () => {
  describe('handlePot', () => {
    it('potting red adds points and switches to colors', () => {
      const store = createSnookerStore({
        currentPlayer: 0,
        scores: [0, 0],
        currentBreak: 0,
        onRed: true,
        redsRemaining: 3,
        colorsRemaining: 6,
      });

      store.handlePot('red', 1);

      const state = store.getState();
      expect(state.scores[0]).toBe(1);
      expect(state.currentBreak).toBe(1);
      expect(state.onRed).toBe(false);
      expect(state.redsRemaining).toBe(2);
    });

    it('potting color with reds remaining switches back to red', () => {
      const store = createSnookerStore({
        currentPlayer: 0,
        scores: [0, 0],
        currentBreak: 0,
        onRed: false,
        redsRemaining: 3,
        colorsRemaining: 6,
      });

      store.handlePot('pink', 6);

      const state = store.getState();
      expect(state.scores[0]).toBe(6);
      expect(state.currentBreak).toBe(6);
      expect(state.onRed).toBe(true);
      expect(state.redsRemaining).toBe(3);
      expect(state.colorsRemaining).toBe(6); // Colors aren't removed during red phase
    });

    it('prevents potting red when on colors', () => {
      const startState: Partial<GameState> = {
        currentPlayer: 0,
        scores: [4, 0],
        currentBreak: 4,
        onRed: false,
        redsRemaining: 3,
        colorsRemaining: 6,
      };
      const store = createSnookerStore(startState);

      store.handlePot('red', 1);

      const state = store.getState();
      expect(state).toMatchObject(startState);
    });

    it('prevents potting color when on red', () => {
      const startState: Partial<GameState> = {
        currentPlayer: 0,
        scores: [4, 0],
        currentBreak: 4,
        onRed: true,
        redsRemaining: 3,
        colorsRemaining: 6,
      };
      const store = createSnookerStore(startState);

      store.handlePot('pink', 6);

      const state = store.getState();
      expect(state).toMatchObject(startState);
    });

    describe('end game sequence', () => {
      it('prevents potting wrong color (trying blue before yellow)', () => {
        const store = createSnookerStore({
          currentPlayer: 0,
          scores: [20, 10],
          currentBreak: 0,
          onRed: false,
          redsRemaining: 0,
          colorsRemaining: 6,
        });

        store.handlePot('blue', 5);

        const state = store.getState();
        expect(state.scores[0]).toBe(20); // Unchanged
        expect(state.colorsRemaining).toBe(6);
      });

      it('allows correct color sequence', () => {
        const store = createSnookerStore({
          currentPlayer: 0,
          scores: [20, 10],
          currentBreak: 0,
          onRed: false,
          redsRemaining: 0,
          colorsRemaining: 6,
        });

        // Yellow (2) -> Green (3) -> Brown (4)
        store.handlePot('yellow', 2);
        store.handlePot('green', 3);
        store.handlePot('brown', 4);

        const state = store.getState();
        expect(state.scores[0]).toBe(29);
        expect(state.currentBreak).toBe(9);
        expect(state.colorsRemaining).toBe(3); // Blue, Pink, Black remain
      });

      it('final black decides winner', () => {
        const store = createSnookerStore({
          currentPlayer: 0,
          scores: [50, 45],
          currentBreak: 0,
          onRed: false,
          redsRemaining: 0,
          colorsRemaining: 1,
        });

        store.handlePot('black', 7);

        const state = store.getState();
        expect(state.scores[0]).toBe(57);
        expect(state.isOver).toBe(true);
        expect(state.winner).toBe(0);
      });
    });
  });

  describe('handleMiss', () => {
    it('switches player and resets break', () => {
      const store = createSnookerStore({
        currentPlayer: 0,
        scores: [10, 5],
        currentBreak: 10,
        onRed: true,
        redsRemaining: 3,
      });

      store.handleMiss();

      const state = store.getState();
      expect(state.currentPlayer).toBe(1);
      expect(state.currentBreak).toBe(0);
      expect(state.onRed).toBe(true);
    });

    it('keeps colors remaining unchanged', () => {
      const store = createSnookerStore({
        currentPlayer: 0,
        scores: [10, 5],
        currentBreak: 10,
        onRed: false,
        redsRemaining: 0,
        colorsRemaining: 4,
      });

      store.handleMiss();

      const state = store.getState();
      expect(state.colorsRemaining).toBe(4);
    });
  });

  describe('handleFoul', () => {
    it('awards points to opponent and handles lost red', () => {
      const store = createSnookerStore({
        currentPlayer: 0,
        scores: [10, 5],
        currentBreak: 10,
        onRed: true,
        redsRemaining: 3,
      });

      store.handleFoul(4, true);

      const state = store.getState();
      expect(state.scores).toEqual([10, 9]);
      expect(state.currentPlayer).toBe(1);
      expect(state.currentBreak).toBe(0);
      expect(state.redsRemaining).toBe(2);
    });

    it('handles foul on color in end game', () => {
      const store = createSnookerStore({
        currentPlayer: 0,
        scores: [20, 15],
        currentBreak: 0,
        onRed: false,
        redsRemaining: 0,
        colorsRemaining: 3,
      });

      store.handleFoul(5, true);

      const state = store.getState();
      expect(state.scores).toEqual([20, 20]);
      expect(state.colorsRemaining).toBe(2);
      expect(state.currentPlayer).toBe(1);
    });

    it('handles foul without losing ball', () => {
      const store = createSnookerStore({
        currentPlayer: 0,
        scores: [20, 15],
        currentBreak: 8,
        onRed: true,
        redsRemaining: 5,
        colorsRemaining: 6,
      });

      store.handleFoul(4, false);

      const state = store.getState();
      expect(state.scores).toEqual([20, 19]);
      expect(state.redsRemaining).toBe(5); // Unchanged
      expect(state.colorsRemaining).toBe(6); // Unchanged
      expect(state.currentBreak).toBe(0);
      expect(state.currentPlayer).toBe(1);
    });
  });

  describe('respot black', () => {
    it('enters respot on tie after final black', () => {
      const store = createSnookerStore({
        currentPlayer: 0,
        scores: [43, 50],
        currentBreak: 0,
        onRed: false,
        redsRemaining: 0,
        colorsRemaining: 1,
        isRespot: false,
      });

      store.handlePot('black', 7);

      const state = store.getState();
      expect(state.isRespot).toBe(true);
      expect(state.colorsRemaining).toBe(1);
      expect(state.isOver).toBe(false);
      expect(state.scores).toEqual([50, 50]);
    });

    it('handles coin toss and choosing to play first', () => {
      const store = createSnookerStore({
        isRespot: true,
        scores: [57, 57],
      });

      store.tossForRespot();
      const afterToss = store.getState();
      expect([0, 1]).toContain(afterToss.respotChoice!);

      const winner = afterToss.respotChoice!;
      store.chooseRespotTurn(true);

      const final = store.getState();
      expect(final.currentPlayer).toBe(winner);
      expect(final.respotChoice).toBeUndefined();
    });

    it('handles coin toss and choosing to play second', () => {
      const store = createSnookerStore({
        isRespot: true,
        scores: [57, 57],
      });

      store.tossForRespot();
      const afterToss = store.getState();
      const winner = afterToss.respotChoice!;

      store.chooseRespotTurn(false);

      const final = store.getState();
      expect(final.currentPlayer).toBe(winner === 0 ? 1 : 0);
      expect(final.respotChoice).toBeUndefined();
    });

    it('respot black win ends game', () => {
      const store = createSnookerStore({
        currentPlayer: 0,
        scores: [57, 57],
        onRed: false,
        isRespot: true,
        redsRemaining: 0,
        colorsRemaining: 1,
      });

      store.handlePot('black', 7);

      const state = store.getState();
      expect(state.isOver).toBe(true);
      expect(state.winner).toBe(0);
      expect(state.scores).toEqual([64, 57]);
    });
  });
});
