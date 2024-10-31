import React, {useCallback, useState} from 'react';
import {Platform, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/core';
import {useData, useTheme, useTranslation} from '../hooks/';
import {Block, Button, Input, Image, Text} from '../components/';
import {getFirestore, collection, query, where, getDocs, addDoc} from 'firebase/firestore';
import {db} from '../../config/firebaseConfig';

const isAndroid = Platform.OS === 'android';

const Register = () => {
  const {isDark} = useData();
  const {t} = useTranslation();
  const navigation = useNavigation();
  
  const [selectedType, setSelectedType] = useState('');
  const [registration, setRegistration] = useState({
    name: '',
    password: '',
  });
  const [error, setError] = useState('');

  const {assets, colors, gradients, sizes} = useTheme();

  const handleChange = useCallback(
    (value) => {
      setRegistration((state) => ({...state, ...value}));
      setError(''); // Clear error when input changes
    },
    [setRegistration],
  );

  const handleSignUp = useCallback(async () => {
    if (!selectedType || !registration.name || !registration.password) {
      Alert.alert(
        'Missing Information',
        'Please fill in all fields and select a role',
        [{text: 'OK'}]
      );
      setError('Please fill in all fields and select a role');
      return;
    }

    try {
      // Check if user with same name and type already exists
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('name', '==', registration.name),
        where('type', '==', selectedType)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        Alert.alert(
          'Registration Failed',
          'A user already exists with this name and role. Please choose a different name or role.',
          [{text: 'OK'}]
        );
        setError('User already exists with this name and role');
        return;
      }

      // Create new user
      await addDoc(collection(db, 'users'), {
        name: registration.name,
        password: registration.password,
        type: selectedType,
      });

      Alert.alert(
        'Success',
        'Registration successful! Please login with your credentials.',
        [{
          text: 'OK',
          onPress: () => navigation.navigate('Login')
        }]
      );

    } catch (error) {
      console.error('Error during registration:', error);
      Alert.alert(
        'Error',
        'An error occurred during registration. Please try again.',
        [{text: 'OK'}]
      );
      setError('An error occurred during registration');
    }
  }, [registration, selectedType, navigation]);

  return (
    <Block safe marginTop={sizes.md}>
      <Block paddingHorizontal={sizes.s}>
        <Block flex={0} style={{zIndex: 0}}>
          <Image
            background
            resizeMode="cover"
            padding={sizes.sm}
            radius={sizes.cardRadius}
            source={assets.background}
            height={sizes.height * 0.3}>
            <Button
              row
              flex={0}
              justify="flex-start"
              onPress={() => navigation.goBack()}>
              <Image
                radius={0}
                width={10}
                height={18}
                color={colors.white}
                source={assets.arrow}
                transform={[{rotate: '180deg'}]}
              />
              <Text p white marginLeft={sizes.s}>
                {t('common.goBack')}
              </Text>
            </Button>

            <Text h4 center white marginBottom={sizes.md}>
              {t('register.title')}
            </Text>
          </Image>
        </Block>

        <Block
          keyboard
          marginTop={-(sizes.height * 0.2 - sizes.l)}
          behavior={!isAndroid ? 'padding' : 'height'}>
          <Block
            flex={0}
            radius={sizes.sm}
            marginHorizontal="8%"
            shadow={!isAndroid}>
            <Block
              blur
              flex={0}
              intensity={90}
              radius={sizes.sm}
              overflow="hidden"
              justify="space-evenly"
              tint={colors.blurTint}
              paddingVertical={sizes.sm}>
              
              {/* Type Selection Buttons */}
              <Block paddingHorizontal={sizes.sm} marginBottom={sizes.sm}>
                <Text p semibold marginBottom={sizes.sm}>
                  Select your role:
                </Text>
                <Block row flex={0} justify="space-between" marginBottom={sizes.sm}>
                  {['Staff', 'Caregiver', 'Volunteer'].map((type) => (
                    <Button
                      key={type}
                      flex={0}
                      width="30%"
                      gradient={selectedType === type ? gradients.primary : undefined}
                      outlined={selectedType !== type}
                      onPress={() => setSelectedType(type)}>
                      <Text
                        bold
                        size={13}
                        transform="uppercase"
                        color={selectedType === type ? colors.white : colors.primary}>
                        {type}
                      </Text>
                    </Button>
                  ))}
                </Block>
              </Block>

              {/* Registration Form */}
              <Block paddingHorizontal={sizes.sm}>
                <Input
                  label="Name"
                  autoCapitalize="none"
                  marginBottom={sizes.m}
                  placeholder="Enter your name"
                  onChangeText={(value) => handleChange({name: value})}
                />
                <Input
                  secureTextEntry
                  label="Password"
                  autoCapitalize="none"
                  marginBottom={sizes.m}
                  placeholder="Enter your password"
                  onChangeText={(value) => handleChange({password: value})}
                />
              </Block>

              {/* Error Message */}
              {error ? (
                <Text p color={colors.danger} center marginBottom={sizes.sm}>
                  {error}
                </Text>
              ) : null}

              {/* Sign Up Button */}
              <Button
                onPress={handleSignUp}
                marginVertical={sizes.s}
                marginHorizontal={sizes.sm}
                gradient={gradients.primary}
                disabled={!selectedType || !registration.name || !registration.password}>
                <Text bold white transform="uppercase">
                  {t('common.signup')}
                </Text>
              </Button>

              {/* Sign In Button */}
              <Button
                primary
                outlined
                shadow={!isAndroid}
                marginVertical={sizes.s}
                marginHorizontal={sizes.sm}
                onPress={() => navigation.navigate('Login')}>
                <Text bold primary transform="uppercase">
                  {t('common.signin')}
                </Text>
              </Button>
            </Block>
          </Block>
        </Block>
      </Block>
    </Block>
  );
};

export default Register;
