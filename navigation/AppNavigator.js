import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { auth } from '../services/firebaseConfig';
import { useTheme } from '../context/ThemeContext';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ClassSelectionScreen from '../screens/ClassSelectionScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ManageClassesScreen from '../screens/ManageClassesScreen';
import ManageStudentsScreen from '../screens/ManageStudentsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function LogoutButton() {
  return (
    <TouchableOpacity style={styles.logoutBtn} onPress={() => auth.signOut()}>
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  );
}

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <TouchableOpacity style={styles.logoutBtn} onPress={toggleTheme}>
      <Text style={styles.logoutText}>{isDark ? '☀️' : '🌙'}</Text>
    </TouchableOpacity>
  );
}

const tabScreensOptions = {
  headerStyle: { backgroundColor: '#1a1a2e' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '700' },
};

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={tabScreensOptions}>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Home', headerRight: () => <><ThemeToggle /><LogoutButton /></> }}
      />
      <Stack.Screen name="ClassSelection" component={ClassSelectionScreen} options={{ title: 'Select Class' }} />
      <Stack.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={({ route }) => ({ title: route.params.className })}
      />
    </Stack.Navigator>
  );
}

function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={tabScreensOptions}>
      <Stack.Screen
        name="HistoryList"
        component={HistoryScreen}
        options={{ title: 'History', headerRight: () => <LogoutButton /> }}
      />
    </Stack.Navigator>
  );
}

function ManageStack() {
  return (
    <Stack.Navigator screenOptions={tabScreensOptions}>
      <Stack.Screen
        name="ManageClasses"
        component={ManageClassesScreen}
        options={{ title: 'Manage' }}
      />
      <Stack.Screen
        name="ManageStudents"
        component={ManageStudentsScreen}
        options={({ route }) => ({ title: route.params.className })}
      />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: colors.tabBar,
              borderTopColor: colors.tabBarBorder,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.subtext,
          }}
        >
          <Tab.Screen
            name="HomeTab"
            component={HomeStack}
            options={{ tabBarLabel: 'Home', tabBarIcon: () => null }}
          />
          <Tab.Screen
            name="HistoryTab"
            component={HistoryStack}
            options={{ tabBarLabel: 'History', tabBarIcon: () => null }}
          />
          <Tab.Screen
            name="ManageTab"
            component={ManageStack}
            options={{ tabBarLabel: 'Manage', tabBarIcon: () => null }}
          />
        </Tab.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoutBtn: { marginRight: 8 },
  logoutText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
