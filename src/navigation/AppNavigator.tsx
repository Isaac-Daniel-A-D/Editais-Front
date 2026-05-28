import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import EditalDetailScreen from '../screens/EditalDetailScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import ProposalProgressScreen from '../screens/ProposalProgressScreen';
import { globalStyles } from '../styles/global';

export type HomeStackParamList = {
  Home: undefined;
  EditalDetail: { editalId: string };
};

export type RootTabParamList = {
  Editais: undefined;
  Proposta: undefined;
  Documentos: undefined;
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: globalStyles.primaryColor },
        headerTintColor: '#FFFFFF',
        contentStyle: { backgroundColor: globalStyles.backgroundColor },
      }}
    >
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ title: 'Editais Abertos' }} />
      <HomeStack.Screen name="EditalDetail" component={EditalDetailScreen} options={{ title: 'Detalhes do Edital' }} />
    </HomeStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: globalStyles.primaryColor,
          tabBarStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        <Tab.Screen name="Editais" component={HomeStackScreen} options={{ title: 'Editais' }} />
        <Tab.Screen name="Proposta" component={ProposalProgressScreen} options={{ title: 'Proposta' }} />
        <Tab.Screen name="Documentos" component={DocumentsScreen} options={{ title: 'Documentos' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
