import { describe, it, expect } from 'vitest';
import { createInitialState, createSnookerStore } from './snooker-store';

describe('snooker store', () => {
  describe('handlePot', () => {
    it('potting red adds points and switches to colors', () => {
      const store = createSnookerStore(
        {
          gameId: 'test',
          events: [], // Fresh game can use empty events
        },
        createInitialState(),
      );

      store.handlePot('red', 1);

      const state = store.getState();
      expect(state.currentState.scores[0]).toBe(1);
      expect(state.currentState.currentBreak).toBe(1);
      expect(state.currentState.onRed).toBe(false);
      expect(state.currentState.redsRemaining).toBe(14);
    });

    it('potting color with reds remaining switches back to red', () => {
      const store = createSnookerStore(
        {
          gameId: 'test',
          events: [],
        },
        {
          currentPlayer: 0,
          scores: [0, 0],
          currentBreak: 0,
          onRed: false,
          redsRemaining: 14,
          colorsRemaining: 6,
          isRespot: false,
          isOver: false,
        },
      );

      store.handlePot('pink', 6);

      const state = store.getState();
      expect(state.currentState.scores[0]).toBe(6);
      expect(state.currentState.currentBreak).toBe(6);
      expect(state.currentState.onRed).toBe(true);
      expect(state.currentState.redsRemaining).toBe(14);
      expect(state.currentState.colorsRemaining).toBe(6);
    });

    it('prevents potting red when on colors', () => {
      const store = createSnookerStore(
        {
          gameId: 'test',
          events: [],
        },
        {
          currentPlayer: 0,
          scores: [4, 0],
          currentBreak: 4,
          onRed: false,
          redsRemaining: 14,
          colorsRemaining: 6,
          isRespot: false,
          isOver: false,
        },
      );

      store.handlePot('red', 1);

      const state = store.getState();
      expect(state.currentState.scores[0]).toBe(4); // Unchanged
      expect(state.currentState.redsRemaining).toBe(14); // Unchanged
    });

    it('prevents potting color when on red', () => {
      const store = createSnookerStore(
        {
          gameId: 'test',
          events: [],
        },
        createInitialState(),
      );

      store.handlePot('pink', 6);

      const state = store.getState();
      expect(state.currentState.scores[0]).toBe(0);
      expect(state.currentState.onRed).toBe(true);
    });

    describe('end game sequence', () => {
      it('prevents potting wrong color (trying blue before yellow)', () => {
        const store = createSnookerStore(
          {
            gameId: 'test',
            events: [],
          },
          {
            currentPlayer: 0,
            scores: [20, 10],
            currentBreak: 0,
            onRed: false,
            redsRemaining: 0,
            colorsRemaining: 6,
            isRespot: false,
            isOver: false,
          },
        );

        store.handlePot('blue', 5);

        const state = store.getState();
        expect(state.currentState.scores[0]).toBe(20); // Unchanged
        expect(state.currentState.colorsRemaining).toBe(6);
      });

      it('allows correct color sequence', () => {
        const store = createSnookerStore(
          {
            gameId: 'test',
            events: [],
          },
          {
            currentPlayer: 0,
            scores: [20, 10],
            currentBreak: 0,
            onRed: false,
            redsRemaining: 0,
            colorsRemaining: 6,
            isRespot: false,
            isOver: false,
          },
        );

        store.handlePot('yellow', 2);
        store.handlePot('green', 3);
        store.handlePot('brown', 4);

        const state = store.getState();
        expect(state.currentState.scores[0]).toBe(29);
        expect(state.currentState.currentBreak).toBe(9);
        expect(state.currentState.colorsRemaining).toBe(3); // Blue, Pink, Black remain
      });

      it('final black decides winner', () => {
        const store = createSnookerStore(
          {
            gameId: 'test',
            events: [],
          },
          {
            currentPlayer: 0,
            scores: [50, 45],
            currentBreak: 0,
            onRed: false,
            redsRemaining: 0,
            colorsRemaining: 1,
            isRespot: false,
            isOver: false,
          },
        );

        store.handlePot('black', 7);

        const state = store.getState();
        expect(state.currentState.scores[0]).toBe(57);
        expect(state.currentState.isOver).toBe(true);
        expect(state.currentState.winner).toBe(0);
      });
    });
  });

  describe('handleMiss', () => {
    it('switches player and resets break', () => {
      const store = createSnookerStore(
        {
          gameId: 'test',
          events: [],
        },
        {
          currentPlayer: 0,
          scores: [10, 5],
          currentBreak: 10,
          onRed: true,
          redsRemaining: 3,
          colorsRemaining: 6,
          isRespot: false,
          isOver: false,
        },
      );

      store.handleMiss();

      const state = store.getState();
      expect(state.currentState.currentPlayer).toBe(1);
      expect(state.currentState.currentBreak).toBe(0);
      expect(state.currentState.onRed).toBe(true);
    });
  });

  describe('handleFoul', () => {
    it('awards points to opponent and handles lost red', () => {
      const store = createSnookerStore(
        {
          gameId: 'test',
          events: [],
        },
        {
          currentPlayer: 0,
          scores: [10, 5],
          currentBreak: 10,
          onRed: true,
          redsRemaining: 3,
          colorsRemaining: 6,
          isRespot: false,
          isOver: false,
        },
      );

      store.handleFoul(4, true);

      const state = store.getState();
      expect(state.currentState.scores).toEqual([10, 9]);
      expect(state.currentState.currentPlayer).toBe(1);
      expect(state.currentState.currentBreak).toBe(0);
      expect(state.currentState.redsRemaining).toBe(2);
    });

    it('handles foul on color in end game', () => {
      const store = createSnookerStore(
        {
          gameId: 'test',
          events: [],
        },
        {
          currentPlayer: 0,
          scores: [20, 15],
          currentBreak: 0,
          onRed: false,
          redsRemaining: 0,
          colorsRemaining: 3,
          isRespot: false,
          isOver: false,
        },
      );

      store.handleFoul(5, true);

      const state = store.getState();
      expect(state.currentState.scores).toEqual([20, 20]);
      expect(state.currentState.colorsRemaining).toBe(2);
      expect(state.currentState.currentPlayer).toBe(1);
    });
  });

  describe('respot black', () => {
    it('enters respot on tie after final black', () => {
      const store = createSnookerStore(
        {
          gameId: 'test',
          events: [],
        },
        {
          currentPlayer: 0,
          scores: [43, 50],
          currentBreak: 0,
          onRed: false,
          redsRemaining: 0,
          colorsRemaining: 1,
          isRespot: false,
          isOver: false,
        },
      );

      store.handlePot('black', 7);

      const state = store.getState();
      expect(state.currentState.isRespot).toBe(true);
      expect(state.currentState.colorsRemaining).toBe(1);
      expect(state.currentState.isOver).toBe(false);
      expect(state.currentState.scores).toEqual([50, 50]);
    });

    it('handles coin toss and choosing to play first', () => {
      const store = createSnookerStore(
        {
          gameId: 'test',
          events: [],
        },
        {
          currentPlayer: 0,
          scores: [57, 57],
          currentBreak: 0,
          onRed: false,
          redsRemaining: 0,
          colorsRemaining: 1,
          isRespot: true,
          isOver: false,
          respotChoice: 0,
        },
      );

      store.chooseRespotTurn(true);

      const final = store.getState();
      expect(final.currentState.currentPlayer).toBe(0);
      expect(final.currentState.respotChoice).toBeUndefined();
    });

    it('handles coin toss and choosing to play second', () => {
      const store = createSnookerStore(
        {
          gameId: 'test',
          events: [],
        },
        {
          currentPlayer: 0,
          scores: [57, 57],
          currentBreak: 0,
          onRed: false,
          redsRemaining: 0,
          colorsRemaining: 1,
          isRespot: true,
          isOver: false,
          respotChoice: 0,
        },
      );

      store.chooseRespotTurn(false);

      const final = store.getState();
      expect(final.currentState.currentPlayer).toBe(1);
      expect(final.currentState.respotChoice).toBeUndefined();
    });

    it('respot black win ends game', () => {
      const store = createSnookerStore(
        {
          gameId: 'test',
          events: [],
        },
        {
          currentPlayer: 0,
          scores: [57, 57],
          currentBreak: 0,
          onRed: false,
          redsRemaining: 0,
          colorsRemaining: 1,
          isRespot: true,
          isOver: false,
        },
      );

      store.handlePot('black', 7);

      const state = store.getState();
      expect(state.currentState.isOver).toBe(true);
      expect(state.currentState.winner).toBe(0);
      expect(state.currentState.scores).toEqual([64, 57]);
    });
  });
});
