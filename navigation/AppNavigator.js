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
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={styles.headerBtn} onPress={() => auth.signOut()}>
      <Text style={{ color: colors.headerText, fontWeight: '600', fontSize: 14 }}>Logout</Text>
    </TouchableOpacity>
  );
}

function ThemeToggle() {
  const { isDark, toggleTheme, colors } = useTheme();
  return (
    <TouchableOpacity style={styles.headerBtn} onPress={toggleTheme}>
      <Text style={{ fontSize: 18 }}>{isDark ? '☀️' : '🌙'}</Text>
    </TouchableOpacity>
  );
}

function TabIcon({ label, focused, colors }) {
  const icons = { HomeTab: '🏠', HistoryTab: '📊', ManageTab: '⚙️' };
  return (
    <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>
      {icons[label] || '•'}
    </Text>
  );
}

function HomeStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.headerBg },
        headerTintColor: colors.headerText,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Attendify',
          headerRight: () => <><ThemeToggle /><LogoutButton /></>,
        }}
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
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.headerBg },
        headerTintColor: colors.headerText,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="HistoryList"
        component={HistoryScreen}
        options={{ title: 'History', headerRight: () => <ThemeToggle /> }}
      />
    </Stack.Navigator>
  );
}

function ManageStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.headerBg },
        headerTintColor: colors.headerText,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="ManageClasses"
        component={ManageClassesScreen}
        options={{ title: 'Manage', headerRight: () => <ThemeToggle /> }}
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
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: colors.tabBar,
              borderTopColor: colors.tabBarBorder,
              borderTopWidth: 1,
              paddingTop: 6,
              paddingBottom: 8,
              height: 56,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.subtext,
            tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
            tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} colors={colors} />,
          })}
        >
          <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: 'Home' }} />
          <Tab.Screen name="HistoryTab" component={HistoryStack} options={{ tabBarLabel: 'History' }} />
          <Tab.Screen name="ManageTab" component={ManageStack} options={{ tabBarLabel: 'Manage' }} />
        </Tab.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBtn: { marginRight: 12 },
});
