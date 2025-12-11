import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface NumberBallProps {
  number: number | null;
  size?: 'small' | 'large';
}

/**
 * 番号に対応する色を取得（B:1-15, I:16-30, N:31-45, G:46-60, O:61-75）
 */
function getBallColor(number: number): string {
  if (number <= 15) return '#2196F3'; // B - Blue
  if (number <= 30) return '#F44336'; // I - Red
  if (number <= 45) return '#9C27B0'; // N - Purple
  if (number <= 60) return '#4CAF50'; // G - Green
  return '#FF9800'; // O - Orange
}

/**
 * 番号に対応する文字を取得
 */
function getBallLetter(number: number): string {
  if (number <= 15) return 'B';
  if (number <= 30) return 'I';
  if (number <= 45) return 'N';
  if (number <= 60) return 'G';
  return 'O';
}

export function NumberBall({ number, size = 'large' }: NumberBallProps) {
  if (number === null) {
    return (
      <View style={[styles.ball, styles.emptyBall, size === 'small' && styles.smallBall]}>
        <Text style={[styles.questionMark, size === 'small' && styles.smallText]}>?</Text>
      </View>
    );
  }

  const color = getBallColor(number);
  const letter = getBallLetter(number);

  return (
    <View style={[styles.ball, { backgroundColor: color }, size === 'small' && styles.smallBall]}>
      <Text style={[styles.letter, size === 'small' && styles.smallLetter]}>{letter}</Text>
      <Text style={[styles.number, size === 'small' && styles.smallNumber]}>{number}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ball: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  smallBall: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  emptyBall: {
    backgroundColor: '#ccc',
  },
  letter: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  smallLetter: {
    fontSize: 10,
  },
  number: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  smallNumber: {
    fontSize: 16,
  },
  smallText: {
    fontSize: 20,
  },
  questionMark: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
  },
});
