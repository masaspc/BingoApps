import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Share,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BingoCard } from '../components/BingoCard';
import { NumberBall } from '../components/NumberBall';
import { PlayerList } from '../components/PlayerList';
import { useSocket } from '../hooks/useSocket';
import type { BingoCard as BingoCardType, Player } from '../types';

export default function GameScreen() {
  const params = useLocalSearchParams<{
    roomId: string;
    playerId: string;
    hostPin?: string;
    cardData: string;
  }>();

  const { roomId, playerId, hostPin } = params;
  const initialCard: BingoCardType = JSON.parse(params.cardData);

  const [card, setCard] = useState<BingoCardType>(initialCard);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);

  const isHost = !!hostPin;

  const handleBingoWinner = useCallback((winnerPlayer: Player, winnerCard: BingoCardType) => {
    setWinner(winnerPlayer);
    setShowWinnerModal(true);
  }, []);

  const {
    room,
    players,
    isConnected,
    drawnNumbers,
    currentNumber,
    error,
    drawNumber,
    markNumber,
    declareBingo,
  } = useSocket({
    roomId: roomId!,
    playerId: playerId!,
    onBingoWinner: handleBingoWinner,
  });

  // 番号をマークしたらカードを更新
  const handleMarkNumber = (number: number) => {
    // ローカル状態を更新
    const newMarked = card.marked.map((row, rowIndex) =>
      row.map((marked, colIndex) => {
        if (card.numbers[rowIndex][colIndex] === number) {
          return true;
        }
        return marked;
      })
    );
    setCard({ ...card, marked: newMarked });

    // サーバーに通知
    markNumber(number);
  };

  // 抽選ボタン
  const handleDraw = () => {
    if (hostPin) {
      drawNumber(hostPin);
    }
  };

  // ビンゴ宣言
  const handleDeclareBingo = () => {
    Alert.alert(
      'Declare BINGO!',
      'Are you sure you have BINGO?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, BINGO!',
          onPress: () => declareBingo(),
        },
      ]
    );
  };

  // ルームコードを共有
  const handleShareRoom = async () => {
    try {
      await Share.share({
        message: `Join my Bingo game! Room Code: ${roomId}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={64} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 接続状態 */}
      <View style={styles.statusBar}>
        <View style={styles.connectionStatus}>
          <View
            style={[
              styles.statusDot,
              isConnected ? styles.statusConnected : styles.statusDisconnected,
            ]}
          />
          <Text style={styles.statusText}>
            {isConnected ? 'Connected' : 'Connecting...'}
          </Text>
        </View>
        {isHost && (
          <TouchableOpacity onPress={handleShareRoom} style={styles.shareButton}>
            <Ionicons name="share-outline" size={20} color="#4A90D9" />
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ルーム情報 */}
      {isHost && (
        <View style={styles.roomInfo}>
          <Text style={styles.roomCodeLabel}>Room Code:</Text>
          <Text style={styles.roomCode}>{roomId}</Text>
        </View>
      )}

      {/* 現在の番号 */}
      <View style={styles.currentNumberSection}>
        <Text style={styles.sectionTitle}>Current Number</Text>
        <NumberBall number={currentNumber} />
      </View>

      {/* 管理者用：抽選ボタン */}
      {isHost && (
        <TouchableOpacity
          style={styles.drawButton}
          onPress={handleDraw}
          disabled={!isConnected || room?.status === 'finished'}
        >
          <Ionicons name="dice" size={24} color="#fff" />
          <Text style={styles.drawButtonText}>Draw Number</Text>
        </TouchableOpacity>
      )}

      {/* 抽選履歴 */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>
          Drawn Numbers ({drawnNumbers.length}/75)
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.historyScroll}
        >
          {drawnNumbers
            .slice()
            .reverse()
            .map((num, index) => (
              <View key={num} style={styles.historyBall}>
                <NumberBall number={num} size="small" />
              </View>
            ))}
        </ScrollView>
      </View>

      {/* ビンゴカード */}
      <View style={styles.cardSection}>
        <Text style={styles.sectionTitle}>Your Card</Text>
        <BingoCard
          card={card}
          drawnNumbers={drawnNumbers}
          onMarkNumber={handleMarkNumber}
        />
      </View>

      {/* ビンゴ宣言ボタン */}
      <TouchableOpacity
        style={styles.bingoButton}
        onPress={handleDeclareBingo}
        disabled={!isConnected}
      >
        <Text style={styles.bingoButtonText}>BINGO!</Text>
      </TouchableOpacity>

      {/* 参加者リスト */}
      <View style={styles.playersSection}>
        <PlayerList players={players} currentPlayerId={playerId} />
      </View>

      {/* 当選者モーダル */}
      {showWinnerModal && winner && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>BINGO!</Text>
            <Ionicons name="trophy" size={80} color="#FFD700" />
            <Text style={styles.winnerName}>{winner.name}</Text>
            <Text style={styles.winnerText}>wins!</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowWinnerModal(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginTop: 16,
    textAlign: 'center',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusConnected: {
    backgroundColor: '#4CAF50',
  },
  statusDisconnected: {
    backgroundColor: '#F44336',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  shareButtonText: {
    color: '#4A90D9',
    marginLeft: 4,
    fontWeight: '600',
  },
  roomInfo: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  roomCodeLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  roomCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  currentNumberSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  drawButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  drawButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  historySection: {
    marginBottom: 20,
  },
  historyScroll: {
    flexDirection: 'row',
  },
  historyBall: {
    marginRight: 8,
  },
  cardSection: {
    marginBottom: 20,
  },
  bingoButton: {
    backgroundColor: '#F44336',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  bingoButtonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  playersSection: {
    marginBottom: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4A90D9',
    marginBottom: 20,
  },
  winnerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  winnerText: {
    fontSize: 20,
    color: '#666',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#4A90D9',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
