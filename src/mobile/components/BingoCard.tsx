import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import type { BingoCard as BingoCardType } from '../types';

interface BingoCardProps {
  card: BingoCardType;
  drawnNumbers: number[];
  onMarkNumber: (number: number) => void;
}

const HEADER_LABELS = ['B', 'I', 'N', 'G', 'O'];
const screenWidth = Dimensions.get('window').width;
const CARD_PADDING = 20;
const CELL_SIZE = (screenWidth - CARD_PADDING * 2 - 10) / 5;

export function BingoCard({ card, drawnNumbers, onMarkNumber }: BingoCardProps) {
  const isNumberDrawn = (number: number): boolean => {
    return drawnNumbers.includes(number);
  };

  const handleCellPress = (row: number, col: number) => {
    const number = card.numbers[row][col];
    if (number !== 0 && isNumberDrawn(number) && !card.marked[row][col]) {
      onMarkNumber(number);
    }
  };

  return (
    <View style={styles.container}>
      {/* ヘッダー行 */}
      <View style={styles.headerRow}>
        {HEADER_LABELS.map((label, index) => (
          <View key={index} style={styles.headerCell}>
            <Text style={styles.headerText}>{label}</Text>
          </View>
        ))}
      </View>

      {/* ビンゴカードのセル */}
      {card.numbers.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((number, colIndex) => {
            const isMarked = card.marked[rowIndex][colIndex];
            const isFreeSpace = number === 0;
            const canMark = !isFreeSpace && isNumberDrawn(number) && !isMarked;

            return (
              <TouchableOpacity
                key={colIndex}
                style={[
                  styles.cell,
                  isMarked && styles.markedCell,
                  canMark && styles.canMarkCell,
                ]}
                onPress={() => handleCellPress(rowIndex, colIndex)}
                disabled={!canMark}
              >
                <Text
                  style={[
                    styles.cellText,
                    isMarked && styles.markedCellText,
                  ]}
                >
                  {isFreeSpace ? 'FREE' : number}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  headerCell: {
    width: CELL_SIZE,
    height: CELL_SIZE * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A90D9',
    marginHorizontal: 1,
    borderRadius: 4,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 1,
    marginVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  markedCell: {
    backgroundColor: '#4A90D9',
    borderColor: '#3A7BC8',
  },
  canMarkCell: {
    backgroundColor: '#FFE082',
    borderColor: '#FFC107',
  },
  cellText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  markedCellText: {
    color: '#fff',
  },
});
