import { BINGO_CONFIG } from '../../shared/types.js';

/**
 * 指定範囲のランダムな整数を生成
 */
export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 配列をシャッフル（Fisher-Yates）
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * ビンゴカードの数字を生成（5x5）
 * 各列は異なる範囲の数字を使用:
 * B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75
 */
export function generateBingoCard(): number[][] {
  const card: number[][] = [];
  const ranges = [
    { min: 1, max: 15 },   // B
    { min: 16, max: 30 },  // I
    { min: 31, max: 45 },  // N
    { min: 46, max: 60 },  // G
    { min: 61, max: 75 },  // O
  ];

  for (let col = 0; col < BINGO_CONFIG.CARD_SIZE; col++) {
    const { min, max } = ranges[col];
    const numbers: number[] = [];

    // 範囲内の全数字を生成してシャッフル
    for (let n = min; n <= max; n++) {
      numbers.push(n);
    }
    const shuffled = shuffleArray(numbers);

    // 5つの数字を選択
    const column = shuffled.slice(0, BINGO_CONFIG.CARD_SIZE);
    card.push(column);
  }

  // 転置して行ベースの配列に変換
  const transposed: number[][] = [];
  for (let row = 0; row < BINGO_CONFIG.CARD_SIZE; row++) {
    transposed.push([]);
    for (let col = 0; col < BINGO_CONFIG.CARD_SIZE; col++) {
      transposed[row].push(card[col][row]);
    }
  }

  // 中央をフリースペース（0で表現）
  transposed[BINGO_CONFIG.FREE_SPACE_INDEX][BINGO_CONFIG.FREE_SPACE_INDEX] = 0;

  return transposed;
}

/**
 * 初期マーク状態を生成（中央のみtrue）
 */
export function generateInitialMarked(): boolean[][] {
  const marked: boolean[][] = [];
  for (let row = 0; row < BINGO_CONFIG.CARD_SIZE; row++) {
    marked.push([]);
    for (let col = 0; col < BINGO_CONFIG.CARD_SIZE; col++) {
      // 中央のフリースペースのみ最初からマーク
      marked[row].push(
        row === BINGO_CONFIG.FREE_SPACE_INDEX &&
        col === BINGO_CONFIG.FREE_SPACE_INDEX
      );
    }
  }
  return marked;
}

/**
 * 6桁のPINを生成
 */
export function generatePin(): string {
  return String(getRandomInt(100000, 999999));
}

/**
 * ビンゴ判定
 */
export function checkBingo(marked: boolean[][]): boolean {
  const size = BINGO_CONFIG.CARD_SIZE;

  // 横のライン
  for (let row = 0; row < size; row++) {
    if (marked[row].every(m => m)) return true;
  }

  // 縦のライン
  for (let col = 0; col < size; col++) {
    let allMarked = true;
    for (let row = 0; row < size; row++) {
      if (!marked[row][col]) {
        allMarked = false;
        break;
      }
    }
    if (allMarked) return true;
  }

  // 斜め（左上→右下）
  let diagonal1 = true;
  for (let i = 0; i < size; i++) {
    if (!marked[i][i]) {
      diagonal1 = false;
      break;
    }
  }
  if (diagonal1) return true;

  // 斜め（右上→左下）
  let diagonal2 = true;
  for (let i = 0; i < size; i++) {
    if (!marked[i][size - 1 - i]) {
      diagonal2 = false;
      break;
    }
  }
  if (diagonal2) return true;

  return false;
}
