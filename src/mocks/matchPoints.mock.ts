import type { PointEvent } from '../types/match.types';

export const mockMatchPoints: Record<string, PointEvent[]> = {
  'match-1': [
    { id: 'p1', setIndex: 0, gameIndex: 0, pointNumber: 1, scoreBefore: '0-0', server: 'A', winner: 'A', description: 'Winner de drive' },
    { id: 'p2', setIndex: 0, gameIndex: 0, pointNumber: 2, scoreBefore: '15-0', server: 'A', winner: 'A', description: 'Error no forzado' },
    { id: 'p3', setIndex: 0, gameIndex: 0, pointNumber: 3, scoreBefore: '30-0', server: 'A', winner: 'B', description: 'Resto ganador' },
    { id: 'p4', setIndex: 0, gameIndex: 0, pointNumber: 4, scoreBefore: '30-15', server: 'A', winner: 'A', description: 'Volea ganadora' },
    { id: 'p5', setIndex: 0, gameIndex: 0, pointNumber: 5, scoreBefore: '40-15', server: 'A', winner: 'A', description: 'Juego Tapia/Coello' },
    { id: 'p6', setIndex: 2, gameIndex: 7, pointNumber: 1, scoreBefore: '0-0', server: 'B', winner: 'A', description: 'Globo ganador' },
    { id: 'p7', setIndex: 2, gameIndex: 7, pointNumber: 2, scoreBefore: '0-15', server: 'B', winner: 'B', description: 'Smash definitorio' },
    { id: 'p8', setIndex: 2, gameIndex: 7, pointNumber: 3, scoreBefore: '15-15', server: 'B', winner: 'A', description: 'Contra de revés' },
    { id: 'p9', setIndex: 2, gameIndex: 7, pointNumber: 4, scoreBefore: '15-30', server: 'B', winner: 'A', description: 'Doble falta' },
    { id: 'p10', setIndex: 2, gameIndex: 7, pointNumber: 5, scoreBefore: '15-40', server: 'B', winner: 'A', description: 'Break Tapia/Coello' },
  ],
  'match-3': [
    { id: 'p1', setIndex: 0, gameIndex: 2, pointNumber: 1, scoreBefore: '0-0', server: 'B', winner: 'A', description: 'Winner paralelo' },
    { id: 'p2', setIndex: 0, gameIndex: 2, pointNumber: 2, scoreBefore: '0-15', server: 'B', winner: 'A', description: 'Resto profundo' },
    { id: 'p3', setIndex: 0, gameIndex: 2, pointNumber: 3, scoreBefore: '0-30', server: 'B', winner: 'B', description: 'Globo salvador' },
    { id: 'p4', setIndex: 0, gameIndex: 2, pointNumber: 4, scoreBefore: '15-30', server: 'B', winner: 'A', description: 'Volea de derecha' },
    { id: 'p5', setIndex: 0, gameIndex: 2, pointNumber: 5, scoreBefore: '15-40', server: 'B', winner: 'A', description: 'Break para Tapia/Coello' },
    { id: 'p6', setIndex: 1, gameIndex: 5, pointNumber: 1, scoreBefore: '0-0', server: 'A', winner: 'A', description: 'Smash imparable' },
    { id: 'p7', setIndex: 1, gameIndex: 5, pointNumber: 2, scoreBefore: '15-0', server: 'A', winner: 'B', description: 'Contraatque magistral' },
    { id: 'p8', setIndex: 1, gameIndex: 5, pointNumber: 3, scoreBefore: '15-15', server: 'A', winner: 'A', description: 'Drive cruzado' },
    { id: 'p9', setIndex: 1, gameIndex: 5, pointNumber: 4, scoreBefore: '30-15', server: 'A', winner: 'A', description: 'Resto corto' },
    { id: 'p10', setIndex: 1, gameIndex: 5, pointNumber: 5, scoreBefore: '40-15', server: 'A', winner: 'A', description: 'Juego Tapia/Coello' },
  ],
};
