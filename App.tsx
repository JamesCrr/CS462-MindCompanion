import "react-native-gesture-handler";
import React from "react";

import { DataProvider } from "./src/hooks";
import AppNavigation from "./src/navigation/App";
import { BeaconProvider } from "./src/context/BeaconContext";
import { LogBox } from "react-native";
import EventNotification from './src/components/EventNotification';

// LogBox.ignoreLogs(["Require cycle: srccomponentsindex.tsx -> srccomponentsMainCalendar.tsx -> srccomponentsindex.tsx"]);
// LogBox.ignoreAllLogs(); //Hide all warning notifications on front-end

export default function App() {
  return (
    <BeaconProvider>
      <DataProvider>
        <AppNavigation />
      </DataProvider>
    </BeaconProvider>
  );
}
