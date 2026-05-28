import React from 'react';
import { SafeAreaView, StyleSheet, Platform, StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { globalStyles } from './src/styles/global';

export default function App() {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: globalStyles.backgroundColor }]}> 
      <AppNavigator />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});
