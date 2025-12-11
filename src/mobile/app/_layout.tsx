import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4A90D9',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Bingo App',
          }}
        />
        <Stack.Screen
          name="join"
          options={{
            title: 'Join Room',
          }}
        />
        <Stack.Screen
          name="game"
          options={{
            title: 'Bingo Game',
            headerBackVisible: false,
          }}
        />
      </Stack>
    </>
  );
}
