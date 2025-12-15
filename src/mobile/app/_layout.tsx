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
            title: 'Bingo App',
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
  );
}
