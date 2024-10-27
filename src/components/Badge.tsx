// components/Badge.js

import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet} from 'react-native';

const Badge = ({ children, onPress }) => (
  <View style={styles.badgeContainer}>
    <Text style={styles.badgeText}>{children}</Text>
    <TouchableOpacity onPress={onPress} style={styles.closeButton}>
      <Text style={styles.closeButtonText}>x</Text>
    </TouchableOpacity>
  </View>
);


const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    backgroundColor: '#ddd',
    borderRadius: 15,
  },
  badgeText: {
    marginRight: 5,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
});


export default Badge;  // Ensure this is a default export
