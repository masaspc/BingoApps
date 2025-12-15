import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Share,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BingoCard } from '../components/BingoCard';
import { NumberBall } from '../components/NumberBall';
import { PlayerList } from '../components/PlayerList';
import { useSocket } from '../hooks/useSocket';
import { useResponsive } from '../hooks/useResponsive';
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
  const { isDesktop, isTablet, isWeb } = useResponsive();

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

  const handleMarkNumber = (number: number) => {
    const newMarked = card.marked.map((row, rowIndex) =>
      row.map((marked, colIndex) => {
        if (card.numbers[rowIndex][colIndex] === number) {
          return true;
        }
        return marked;
      })
    );
    setCard({ ...card, marked: newMarked });
    markNumber(number);
  };

  const handleDraw = () => {
    if (hostPin) {
      drawNumber(hostPin);
    }
  };

  const handleDeclareBingo = () => {
    const confirmBingo = () => declareBingo();

    if (Platform.OS === 'web') {
      if (window.confirm('ビンゴを宣言しますか？')) {
        confirmBingo();
      }
    } else {
      Alert.alert(
        'ビンゴ宣言',
        'ビンゴを宣言しますか？',
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: 'ビンゴ！', onPress: confirmBingo },
        ]
      );
    }
  };

  const handleShareRoom = async () => {
    const message = `ビンゴゲームに参加しよう！\nルームコード: ${roomId}`;

    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(message);
        window.alert('ルームコードをコピーしました！');
      } catch {
        window.alert(message);
      }
    } else {
      try {
        await Share.share({ message });
      } catch (error) {
        console.error('Share error:', error);
      }
    }
  };

  const copyRoomCode = async () => {
    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(roomId!);
        window.alert('ルームコードをコピーしました！');
      } catch {
        window.alert(`ルームコード: ${roomId}`);
      }
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

  // デスクトップ用2カラムレイアウト
  if (isDesktop) {
    return (
      <View style={styles.desktopContainer}>
        {/* 左サイドバー: 管理者パネル + 参加者 */}
        <View style={styles.sidebar}>
          {/* 接続状態 */}
          <View style={styles.statusCard}>
            <View style={styles.connectionStatus}>
              <View
                style={[
                  styles.statusDot,
                  isConnected ? styles.statusConnected : styles.statusDisconnected,
                ]}
              />
              <Text style={styles.statusText}>
                {isConnected ? '接続中' : '接続しています...'}
              </Text>
            </View>
          </View>

          {/* ルーム情報（ホストのみ） */}
          {isHost && (
            <View style={styles.roomInfoCard}>
              <Text style={styles.cardTitle}>ルーム情報</Text>
              <View style={styles.roomCodeRow}>
                <Text style={styles.roomCodeLabel}>コード:</Text>
                <TouchableOpacity onPress={copyRoomCode} style={styles.roomCodeButton}>
                  <Text style={styles.roomCode}>{roomId}</Text>
                  <Ionicons name="copy-outline" size={16} color="#4A90D9" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={handleShareRoom} style={styles.shareButtonDesktop}>
                <Ionicons name="share-outline" size={18} color="#fff" />
                <Text style={styles.shareButtonTextDesktop}>共有する</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 参加者リスト */}
          <View style={styles.playersCard}>
            <PlayerList players={players} currentPlayerId={playerId} />
          </View>
        </View>

        {/* メインコンテンツ */}
        <ScrollView style={styles.mainContent} contentContainerStyle={styles.mainContentInner}>
          {/* 現在の番号 */}
          <View style={styles.currentNumberSection}>
            <Text style={styles.sectionTitleDesktop}>現在の番号</Text>
            <NumberBall number={currentNumber} />
          </View>

          {/* 管理者用：抽選ボタン */}
          {isHost && (
            <TouchableOpacity
              style={styles.drawButtonDesktop}
              onPress={handleDraw}
              disabled={!isConnected || room?.status === 'finished'}
            >
              <Ionicons name="dice" size={28} color="#fff" />
              <Text style={styles.drawButtonTextDesktop}>番号を抽選</Text>
            </TouchableOpacity>
          )}

          {/* 抽選履歴 */}
          <View style={styles.historySection}>
            <Text style={styles.sectionTitleDesktop}>
              抽選済み ({drawnNumbers.length}/75)
            </Text>
            <View style={styles.historyGrid}>
              {drawnNumbers
                .slice()
                .reverse()
                .slice(0, 20)
                .map((num) => (
                  <View key={num} style={styles.historyBallDesktop}>
                    <NumberBall number={num} size="small" />
                  </View>
                ))}
            </View>
            {drawnNumbers.length > 20 && (
              <Text style={styles.historyMore}>
                他 {drawnNumbers.length - 20} 個の番号
              </Text>
            )}
          </View>

          {/* ビンゴカード */}
          <View style={styles.cardSectionDesktop}>
            <Text style={styles.sectionTitleDesktop}>あなたのカード</Text>
            <BingoCard
              card={card}
              drawnNumbers={drawnNumbers}
              onMarkNumber={handleMarkNumber}
            />
          </View>

          {/* ビンゴ宣言ボタン */}
          <TouchableOpacity
            style={styles.bingoButtonDesktop}
            onPress={handleDeclareBingo}
            disabled={!isConnected}
          >
            <Text style={styles.bingoButtonTextDesktop}>BINGO!</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* 当選者モーダル */}
        {showWinnerModal && winner && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentDesktop}>
              <Text style={styles.modalTitleDesktop}>ビンゴ！</Text>
              <Ionicons name="trophy" size={100} color="#FFD700" />
              <Text style={styles.winnerNameDesktop}>{winner.name}</Text>
              <Text style={styles.winnerText}>さんが優勝！</Text>
              <TouchableOpacity
                style={styles.modalButtonDesktop}
                onPress={() => setShowWinnerModal(false)}
              >
                <Text style={styles.modalButtonText}>閉じる</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }

  // モバイル/タブレットレイアウト
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
            {isConnected ? '接続中' : '接続しています...'}
          </Text>
        </View>
        {isHost && (
          <TouchableOpacity onPress={handleShareRoom} style={styles.shareButton}>
            <Ionicons name="share-outline" size={20} color="#4A90D9" />
            <Text style={styles.shareButtonText}>共有</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ルーム情報 */}
      {isHost && (
        <TouchableOpacity style={styles.roomInfo} onPress={isWeb ? copyRoomCode : undefined}>
          <Text style={styles.roomCodeLabel}>ルームコード:</Text>
          <Text style={styles.roomCodeMobile}>{roomId}</Text>
          {isWeb && <Ionicons name="copy-outline" size={16} color="#4A90D9" />}
        </TouchableOpacity>
      )}

      {/* 現在の番号 */}
      <View style={styles.currentNumberSection}>
        <Text style={styles.sectionTitle}>現在の番号</Text>
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
          <Text style={styles.drawButtonText}>番号を抽選</Text>
        </TouchableOpacity>
      )}

      {/* 抽選履歴 */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>
          抽選済み ({drawnNumbers.length}/75)
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.historyScroll}
        >
          {drawnNumbers
            .slice()
            .reverse()
            .map((num) => (
              <View key={num} style={styles.historyBall}>
                <NumberBall number={num} size="small" />
              </View>
            ))}
        </ScrollView>
      </View>

      {/* ビンゴカード */}
      <View style={styles.cardSection}>
        <Text style={styles.sectionTitle}>あなたのカード</Text>
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
        <Text style={styles.bingoButtonText}>ビンゴ！</Text>
      </TouchableOpacity>

      {/* 参加者リスト */}
      <View style={styles.playersSection}>
        <PlayerList players={players} currentPlayerId={playerId} />
      </View>

      {/* 当選者モーダル */}
      {showWinnerModal && winner && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ビンゴ！</Text>
            <Ionicons name="trophy" size={80} color="#FFD700" />
            <Text style={styles.winnerName}>{winner.name}</Text>
            <Text style={styles.winnerText}>さんが優勝！</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowWinnerModal(false)}
            >
              <Text style={styles.modalButtonText}>閉じる</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // モバイルスタイル
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
  roomCodeMobile: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    flex: 1,
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

  // デスクトップスタイル
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
  },
  sidebar: {
    width: 320,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    padding: 20,
  },
  statusCard: {
    marginBottom: 16,
  },
  roomInfoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  roomCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
    // @ts-ignore
    cursor: 'pointer',
  },
  roomCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'monospace',
    marginRight: 8,
  },
  shareButtonDesktop: {
    backgroundColor: '#4A90D9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    // @ts-ignore
    cursor: 'pointer',
  },
  shareButtonTextDesktop: {
    color: '#fff',
    fontWeight: '600',
  },
  playersCard: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
  mainContentInner: {
    padding: 32,
    alignItems: 'center',
  },
  sectionTitleDesktop: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  drawButtonDesktop: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 14,
    marginBottom: 32,
    gap: 12,
    // @ts-ignore
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  drawButtonTextDesktop: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
  },
  historyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  historyBallDesktop: {
    margin: 4,
  },
  historyMore: {
    textAlign: 'center',
    color: '#666',
    marginTop: 12,
    fontSize: 14,
  },
  cardSectionDesktop: {
    marginVertical: 32,
    alignItems: 'center',
  },
  bingoButtonDesktop: {
    backgroundColor: '#F44336',
    paddingVertical: 24,
    paddingHorizontal: 80,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
    // @ts-ignore
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  bingoButtonTextDesktop: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 6,
  },
  modalContentDesktop: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 48,
    alignItems: 'center',
    minWidth: 400,
  },
  modalTitleDesktop: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#4A90D9',
    marginBottom: 24,
  },
  winnerNameDesktop: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
  },
  modalButtonDesktop: {
    backgroundColor: '#4A90D9',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 24,
    // @ts-ignore
    cursor: 'pointer',
  },
});
