import React from 'react';
import { ScrollView } from 'react-native';
import { Block, Button, Text } from "../components/";
import { useTheme } from "../hooks/";
import { useBeacon } from '../context/BeaconContext';

const BgTask = () => {
  const { colors, gradients, sizes } = useTheme();
  const { isScanning, setIsScanning, scannedUsers } = useBeacon();

  return (
    <Block safe>
      <ScrollView>
        <Block paddingHorizontal={sizes.padding}>
          <Text h4 marginBottom={sizes.sm}>
            Background Beacon Scanner
          </Text>
          
          <Block card marginBottom={sizes.sm}>
            <Text p semibold marginBottom={sizes.s}>
              Scanner Status: {isScanning ? 'Active' : 'Inactive'}
            </Text>
            <Button
              gradient={isScanning ? gradients.danger : gradients.success}
              marginBottom={sizes.base}
              onPress={() => setIsScanning(!isScanning)}
            >
              <Text bold white transform="uppercase">
                {isScanning ? 'Stop Scanning' : 'Start Scanning'}
              </Text>
            </Button>
          </Block>

          <Block card marginBottom={sizes.sm}>
            <Text h5 marginBottom={sizes.s}>
              Detected Users ({scannedUsers.size})
            </Text>
            {Array.from(scannedUsers).map((userName, index) => (
              <Text key={index} marginBottom={sizes.xs}>
                {userName}
              </Text>
            ))}
            {scannedUsers.size === 0 && (
              <Text italic color={colors.gray}>
                No users detected yet
              </Text>
            )}
          </Block>
        </Block>
      </ScrollView>
    </Block>
  );
};

export default BgTask;
