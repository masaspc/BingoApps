import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import type { BingoCard as BingoCardType } from '../types';

interface BingoCardProps {
  card: BingoCardType;
  drawnNumbers: number[];
  onMarkNumber: (number: number) => void;
}

const HEADER_LABELS = ['B', 'I', 'N', 'G', 'O'];

export function BingoCard({ card, drawnNumbers, onMarkNumber }: BingoCardProps) {
  const { width, isDesktop, isTablet } = useResponsive();

  // レスポンシブなセルサイズ
  const getCellSize = () => {
    if (isDesktop) return 70;
    if (isTablet) return 60;
    // モバイルは画面幅に合わせる
    const CARD_PADDING = 20;
    return Math.min((width - CARD_PADDING * 2 - 10) / 5, 65);
  };

  const cellSize = getCellSize();
  const fontSize = isDesktop ? 24 : isTablet ? 20 : 18;
  const headerFontSize = isDesktop ? 28 : isTablet ? 24 : 20;

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
    <View style={[styles.container, isDesktop && styles.containerDesktop]}>
      {/* ヘッダー行 */}
      <View style={styles.headerRow}>
        {HEADER_LABELS.map((label, index) => (
          <View
            key={index}
            style={[
              styles.headerCell,
              { width: cellSize, height: cellSize * 0.6 },
            ]}
          >
            <Text style={[styles.headerText, { fontSize: headerFontSize }]}>
              {label}
            </Text>
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
                  { width: cellSize, height: cellSize },
                  isMarked && styles.markedCell,
                  canMark && styles.canMarkCell,
                  Platform.OS === 'web' && styles.cellWeb,
                ]}
                onPress={() => handleCellPress(rowIndex, colIndex)}
                disabled={!canMark}
              >
                <Text
                  style={[
                    styles.cellText,
                    { fontSize },
                    isMarked && styles.markedCellText,
                    isFreeSpace && styles.freeSpaceText,
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
    alignSelf: 'center',
  },
  containerDesktop: {
    padding: 16,
    borderRadius: 16,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  headerCell: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A90D9',
    marginHorizontal: 2,
    borderRadius: 4,
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 2,
    marginVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cellWeb: {
    cursor: 'pointer',
    // @ts-ignore - Web specific
    transition: 'all 0.2s ease',
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
    fontWeight: '600',
    color: '#333',
  },
  markedCellText: {
    color: '#fff',
  },
  freeSpaceText: {
    fontSize: 12,
  },
});
