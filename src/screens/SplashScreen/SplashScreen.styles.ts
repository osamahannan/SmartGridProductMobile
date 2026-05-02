import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7c3aed', // Matches the brand purple used in the app
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 16,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e9d5ff',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: 4,
  },
})
