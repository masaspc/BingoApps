import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { useResponsive } from '../hooks/useResponsive';

export default function HomeScreen() {
  const router = useRouter();
  const { isDesktop, isWeb } = useResponsive();
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [roomName, setRoomName] = useState('');
  const [hostName, setHostName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim() || !hostName.trim()) {
      showAlert('Error', 'Please enter room name and your name');
      return;
    }

    setIsLoading(true);
    try {
      const result = await api.createRoom(roomName.trim(), hostName.trim());
      router.push({
        pathname: '/game',
        params: {
          roomId: result.room.id,
          playerId: result.player.id,
          hostPin: result.hostPin,
          cardData: JSON.stringify(result.card),
        },
      });
    } catch (error) {
      showAlert('Error', 'Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim() || !playerName.trim()) {
      showAlert('Error', 'Please enter room code and your name');
      return;
    }

    setIsLoading(true);
    try {
      const result = await api.joinRoom(roomCode.trim(), playerName.trim());
      router.push({
        pathname: '/game',
        params: {
          roomId: result.room.id,
          playerId: result.player.id,
          cardData: JSON.stringify(result.card),
        },
      });
    } catch (error) {
      showAlert('Error', 'Failed to join room. Please check the room code.');
    } finally {
      setIsLoading(false);
    }
  };

  const containerStyle = [
    styles.container,
    isDesktop && styles.containerDesktop,
  ];

  const cardStyle = [
    styles.card,
    isDesktop && styles.cardDesktop,
  ];

  if (mode === 'menu') {
    return (
      <ScrollView contentContainerStyle={containerStyle}>
        <View style={cardStyle}>
          <View style={styles.logoContainer}>
            <Text style={[styles.logoText, isDesktop && styles.logoTextDesktop]}>
              BINGO
            </Text>
            <Text style={styles.subtitleText}>Company Event Edition</Text>
            {isWeb && (
              <Text style={styles.webBadge}>Web Version</Text>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.primaryButton, isDesktop && styles.buttonDesktop]}
              onPress={() => setMode('create')}
            >
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.buttonText}>Create Room</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, isDesktop && styles.buttonDesktop]}
              onPress={() => setMode('join')}
            >
              <Ionicons name="enter" size={24} color="#4A90D9" />
              <Text style={styles.secondaryButtonText}>Join Room</Text>
            </TouchableOpacity>
          </View>

          {isWeb && (
            <View style={styles.webNote}>
              <Ionicons name="information-circle" size={16} color="#666" />
              <Text style={styles.webNoteText}>
                Works on PC, tablet, and smartphone browsers
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  if (mode === 'create') {
    return (
      <KeyboardAvoidingView
        style={containerStyle}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={cardStyle}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setMode('menu')}
            >
              <Ionicons name="arrow-back" size={24} color="#4A90D9" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <Text style={[styles.formTitle, isDesktop && styles.formTitleDesktop]}>
              Create a Room
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Room Name</Text>
              <TextInput
                style={[styles.input, isDesktop && styles.inputDesktop]}
                placeholder="e.g., Year-End Party Bingo"
                value={roomName}
                onChangeText={setRoomName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Your Name (Host)</Text>
              <TextInput
                style={[styles.input, isDesktop && styles.inputDesktop]}
                placeholder="e.g., John"
                value={hostName}
                onChangeText={setHostName}
                autoCapitalize="words"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                isDesktop && styles.buttonDesktop,
                isLoading && styles.disabledButton,
              ]}
              onPress={handleCreateRoom}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Create</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={containerStyle}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={cardStyle}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setMode('menu')}
          >
            <Ionicons name="arrow-back" size={24} color="#4A90D9" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <Text style={[styles.formTitle, isDesktop && styles.formTitleDesktop]}>
            Join a Room
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Room Code</Text>
            <TextInput
              style={[styles.input, isDesktop && styles.inputDesktop]}
              placeholder="Enter room code"
              value={roomCode}
              onChangeText={setRoomCode}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={[styles.input, isDesktop && styles.inputDesktop]}
              placeholder="e.g., Jane"
              value={playerName}
              onChangeText={setPlayerName}
              autoCapitalize="words"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              isDesktop && styles.buttonDesktop,
              isLoading && styles.disabledButton,
            ]}
            onPress={handleJoinRoom}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="enter" size={24} color="#fff" />
                <Text style={styles.buttonText}>Join</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'center',
  },
  containerDesktop: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    width: '100%',
  },
  cardDesktop: {
    maxWidth: 480,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#4A90D9',
    letterSpacing: 8,
  },
  logoTextDesktop: {
    fontSize: 80,
  },
  subtitleText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  webBadge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    fontSize: 12,
    color: '#1976D2',
    overflow: 'hidden',
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#4A90D9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: '#4A90D9',
  },
  buttonDesktop: {
    padding: 18,
    borderRadius: 14,
    // @ts-ignore
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#4A90D9',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#4A90D9',
    fontSize: 16,
    marginLeft: 4,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  formTitleDesktop: {
    fontSize: 32,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputDesktop: {
    padding: 18,
    fontSize: 18,
    borderRadius: 14,
  },
  webNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 6,
  },
  webNoteText: {
    fontSize: 12,
    color: '#666',
  },
});
