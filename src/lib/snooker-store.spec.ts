import { describe, it, expect } from 'vitest';
import { createInitialState, createSnookerStore } from './snooker-store';
import type { GameEvent } from './types';

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
          isFreeBall: false,
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
          isFreeBall: false,
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
      it('asserts any color is on after last red is potted', () => {
        const store = createSnookerStore(
          {
            gameId: 'test',
            events: [],
          },
          {
            currentPlayer: 0,
            scores: [0, 0],
            currentBreak: 0,
            onRed: true,
            redsRemaining: 1,
            colorsRemaining: 6,
            isFreeBall: false,
            isRespot: false,
            isOver: false,
          },
        );

        store.handlePot('red', 1);
        store.handlePot('black', 7);

        const state = store.getState();
        expect(state.currentState.redsRemaining).toBe(0);
        expect(state.currentState.onRed).toBe(false);
        expect(state.currentState.colorsRemaining).toBe(6);
        expect(state.currentState.scores[0]).toBe(8);
        expect(state.currentState.scores[1]).toBe(0);
        expect(state.currentState.isOver).toBe(false);
      });

      it('prevents potting other than yellow after foul immediately after last red', () => {
        const store = createSnookerStore(
          {
            gameId: 'test',
            events: [],
          },
          {
            currentPlayer: 0,
            scores: [0, 0],
            currentBreak: 0,
            onRed: true,
            redsRemaining: 1,
            colorsRemaining: 6,
            isFreeBall: false,
            isRespot: false,
            isOver: false,
          },
        );

        store.handlePot('red', 1);
        store.handleFoul(7, false);

        // Try invalid pot; no longer free ball
        store.handlePot('black', 7);

        const state = store.getState();
        expect(state.currentState.redsRemaining).toBe(0);
        expect(state.currentState.onRed).toBe(false);
        expect(state.currentState.colorsRemaining).toBe(6);
        expect(state.currentState.scores).toEqual([1, 7]);
      });

      it('asserts potting a color after last red starts end game', () => {
        const store = createSnookerStore(
          {
            gameId: 'test',
            events: [],
          },
          {
            currentPlayer: 0,
            scores: [0, 0],
            currentBreak: 0,
            onRed: true,
            redsRemaining: 1,
            colorsRemaining: 6,
            isFreeBall: false,
            isRespot: false,
            isOver: false,
          },
        );

        store.handlePot('red', 1);
        store.handlePot('black', 7);
        store.handlePot('yellow', 2);

        const state = store.getState();
        expect(state.currentState.redsRemaining).toBe(0);
        expect(state.currentState.colorsRemaining).toBe(5);
        expect(state.currentState.scores[0]).toBe(10);
        expect(state.currentState.currentPlayer).toBe(0);
        expect(state.currentState.onRed).toBe(false);
      });

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
            isFreeBall: false,
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
            isFreeBall: false,
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
            isFreeBall: false,
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
          isFreeBall: false,
          isRespot: false,
          isOver: false,
        },
      );

      store.handleMiss();

      const state = store.getState();
      expect(state.currentState.currentPlayer).toBe(1);
      expect(state.currentState.currentBreak).toBe(0);
      expect(state.currentState.onRed).toBe(true);
      expect(state.currentState.isFreeBall).toBe(false);
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
          isFreeBall: false,
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
      expect(state.currentState.isFreeBall).toBe(false);
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
          isFreeBall: false,
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
          isFreeBall: false,
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
          isFreeBall: false,
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
          isFreeBall: false,
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
          isFreeBall: false,
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

  describe('undo', () => {
    it('undoing a pot restores previous score and game state', () => {
      const store = createSnookerStore(
        {
          gameId: 'test',
          events: [],
        },
        createInitialState(),
      );

      store.handlePot('red', 1);
      store.undoLastEvent();

      const state = store.getState();
      expect(state.currentState.scores[0]).toBe(0);
      expect(state.currentState.onRed).toBe(true);
      expect(state.currentState.redsRemaining).toBe(15);
      expect(state.events).toHaveLength(0);
    });

    it('undoing a foul restores points and ball count', () => {
      const store = createSnookerStore({
        gameId: 'test',
        events: [
          {
            type: 'POT',
            player: 0,
            color: 'red',
            points: 1,
            timestamp: 1,
            sequenceNumber: 0,
          },
          {
            type: 'POT',
            player: 0,
            color: 'black',
            points: 7,
            timestamp: 2,
            sequenceNumber: 1,
          },
          {
            type: 'POT',
            player: 0,
            color: 'red',
            points: 1,
            timestamp: 3,
            sequenceNumber: 2,
          },
        ],
      });

      store.handleFoul(4, true); // 4 points to opponent, loses a red
      store.undoLastEvent();

      const state = store.getState();
      expect(state.currentState.scores).toEqual([9, 0]); // Original scores from POTs
      expect(state.currentState.redsRemaining).toBe(13); // 13 reds after 2 reds potted
      expect(state.currentState.currentPlayer).toBe(0); // Player restored
    });

    it('undoing a respot choice restores respot toss state', () => {
      const store = createSnookerStore({
        gameId: 'test',
        events: [
          ...makeTie(),
          {
            type: 'RESPOT_TOSS_WINNER',
            player: 0,
            timestamp: 300,
            sequenceNumber: 37,
          },
        ],
      });

      store.chooseRespotTurn(true);
      store.undoLastEvent();

      const state = store.getState();
      console.log('state:', JSON.stringify(state, undefined, 2));

      // This should probably be undefined, but it'll be re-set
      expect(state.currentState.respotChoice).toBe(0);
      expect(state.currentState.isRespot).toBe(true);
    });

    it('does nothing when no events to undo', () => {
      const store = createSnookerStore(
        {
          gameId: 'test',
          events: [],
        },
        createInitialState(),
      );

      const initialState = store.getState();
      store.undoLastEvent();
      const finalState = store.getState();

      expect(finalState).toEqual(initialState);
    });
  });
});

// this is.. dumb
const makeTie = () =>
  [
    // Player 0: red + black (8 points) x 5 = 40 points
    ...[...Array(5)].flatMap((_, i) => [
      {
        type: 'POT',
        player: 0,
        color: 'red',
        points: 1,
        timestamp: i * 2,
        sequenceNumber: i * 2,
      },
      {
        type: 'POT',
        player: 0,
        color: 'black',
        points: 7,
        timestamp: i * 2 + 1,
        sequenceNumber: i * 2 + 1,
      },
    ]),
    // Player 1: remaining reds + green to tie at 40
    ...[...Array(10)].flatMap((_, i) => [
      {
        type: 'POT',
        player: 1,
        color: 'red',
        points: 1,
        timestamp: i * 2 + 100,
        sequenceNumber: i * 2 + 10,
      },
      {
        type: 'POT',
        player: 1,
        color: 'green',
        points: 3,
        timestamp: i * 2 + 101,
        sequenceNumber: i * 2 + 11,
      },
    ]),
    // Clearing colors alternating between players to maintain tie
    ...['yellow', 'green', 'brown', 'blue', 'pink', 'black'].map((color, i) => ({
      type: 'POT',
      player: i % 2,
      color: color,
      points: i + 2,
      timestamp: 300 + i,
      sequenceNumber: 40 + i,
    })),
  ] as GameEvent[];
