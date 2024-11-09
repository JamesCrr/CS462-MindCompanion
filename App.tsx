import 'react-native-gesture-handler';
import React from 'react';

import {DataProvider} from './src/hooks';
import AppNavigation from './src/navigation/App';
import { BeaconProvider } from './src/context/BeaconContext';

export default function App() {
  return (
    <BeaconProvider>
      <DataProvider>
        <AppNavigation />
      </DataProvider>
    </BeaconProvider>
  );
}
