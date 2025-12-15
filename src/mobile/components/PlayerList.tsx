import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Player } from '../types';

interface PlayerListProps {
  players: Player[];
  currentPlayerId?: string;
}

export function PlayerList({ players, currentPlayerId }: PlayerListProps) {
  const renderPlayer = ({ item }: { item: Player }) => {
    const isCurrentUser = item.id === currentPlayerId;

    return (
      <View style={[styles.playerItem, isCurrentUser && styles.currentPlayer]}>
        <View style={styles.playerInfo}>
          <Ionicons
            name={item.isHost ? 'star' : 'person'}
            size={20}
            color={item.isHost ? '#FFD700' : '#666'}
          />
          <Text style={[styles.playerName, isCurrentUser && styles.currentPlayerName]}>
            {item.name}
            {isCurrentUser && ' (あなた)'}
          </Text>
        </View>
        {item.isHost && (
          <View style={styles.hostBadge}>
            <Text style={styles.hostBadgeText}>司会</Text>
          </View>
        )}
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
        data={players}
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
  },
  playerName: {
    fontSize: 14,
    marginLeft: 8,
    color: '#333',
  },
  currentPlayerName: {
    fontWeight: '600',
    color: '#1976D2',
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
