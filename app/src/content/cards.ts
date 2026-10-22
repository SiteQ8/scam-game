import data from './cards.json';
import type { Card } from './types';

export const CARDS = data as unknown as Card[];
export const cardById = (id: string) => CARDS.find((c) => c.id === id);
