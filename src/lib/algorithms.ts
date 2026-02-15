import { bellState } from '../algorithms/bellState';
import { ghzState } from '../algorithms/ghz';
import { teleportation } from '../algorithms/teleportation';
import { grover } from '../algorithms/grover';
import { deutschJozsa } from '../algorithms/deutschJozsa';
import { qft } from '../algorithms/qft';
import { shor } from '../algorithms/shor';
import type { Algorithm } from '../types/circuit';

export const BASICS: Algorithm[] = [bellState, ghzState, teleportation, grover, deutschJozsa, qft];
export const ULTIMATE: Algorithm[] = [shor];
export const ALGORITHMS: Algorithm[] = [...BASICS, ...ULTIMATE];
