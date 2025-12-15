import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Player } from '../types';

interface PlayerListProps {
  players: Player[];
  currentPlayerId?: string;
}

// 順位に応じたバッジの色
const getRankBadgeStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return { backgroundColor: '#FFD700' }; // 金
    case 2:
      return { backgroundColor: '#C0C0C0' }; // 銀
    case 3:
      return { backgroundColor: '#CD7F32' }; // 銅
    default:
      return { backgroundColor: '#4A90D9' }; // 青
  }
};

export function PlayerList({ players, currentPlayerId }: PlayerListProps) {
  // ランク付きの人を先に、その後ランクなしの人を表示
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.bingoRank && b.bingoRank) return a.bingoRank - b.bingoRank;
    if (a.bingoRank) return -1;
    if (b.bingoRank) return 1;
    return 0;
  });

  const renderPlayer = ({ item }: { item: Player }) => {
    const isCurrentUser = item.id === currentPlayerId;

    return (
      <View style={[styles.playerItem, isCurrentUser && styles.currentPlayer]}>
        <View style={styles.playerInfo}>
          {item.bingoRank ? (
            <View style={[styles.rankBadge, getRankBadgeStyle(item.bingoRank)]}>
              <Text style={styles.rankText}>{item.bingoRank}</Text>
            </View>
          ) : (
            <Ionicons
              name={item.isHost ? 'star' : 'person'}
              size={20}
              color={item.isHost ? '#FFD700' : '#666'}
            />
          )}
          <Text style={[styles.playerName, isCurrentUser && styles.currentPlayerName]}>
            {item.name}
            {isCurrentUser && ' (あなた)'}
          </Text>
        </View>
        <View style={styles.badges}>
          {item.bingoRank && (
            <View style={styles.bingoBadge}>
              <Text style={styles.bingoBadgeText}>BINGO!</Text>
            </View>
          )}
          {item.isHost && (
            <View style={styles.hostBadge}>
              <Text style={styles.hostBadgeText}>司会</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="people" size={20} color="#333" />
        <Text style={styles.headerText}>参加者 ({players.length}人)</Text>
      </View>
      <FlatList
        data={sortedPlayers}
        renderItem={renderPlayer}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    maxHeight: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  list: {
    flexGrow: 0,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  currentPlayer: {
    backgroundColor: '#E3F2FD',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    marginLeft: 8,
    color: '#333',
    flex: 1,
  },
  currentPlayerName: {
    fontWeight: '600',
    color: '#1976D2',
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  bingoBadge: {
    backgroundColor: '#F44336',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  bingoBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
  },
  hostBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  hostBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
});
