import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
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
            title: 'ビンゴゲーム',
          }}
        />
        <Stack.Screen
          name="game"
          options={{
            title: 'ゲーム中',
            headerBackVisible: false,
          }}
        />
      </Stack>
  );
}
