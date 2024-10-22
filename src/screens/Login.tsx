import React, {useCallback, useEffect, useState, useContext} from 'react';
import {Linking, Platform} from 'react-native';
import {useNavigation} from '@react-navigation/core';
import {useData, useTheme, useTranslation} from '../hooks/';
import * as regex from '../constants/regex';
import {Block, Button, Input, Image, Text, Checkbox} from '../components/';
import {getAuth, signInWithEmailAndPassword} from 'firebase/auth';
import {getFirestore, doc, getDoc} from 'firebase/firestore';
import {db} from '../../config/firebaseConfig'; // Import db from your config file
import AsyncStorage from "@react-native-async-storage/async-storage";
import {UserContext} from '../hooks/userContext'; // Import UserContext

const isAndroid = Platform.OS === 'android';

const Login = () => {
  const {isDark} = useData();
  const {t} = useTranslation();
  const navigation = useNavigation();
  const {login} = useContext(UserContext); // Use login from UserContext

  const [isValid, setIsValid] = useState({
    email: false,
    password: false,
    agreed: false,
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    agreed: false,
  });

  const auth = getAuth();
  const {assets, colors, gradients, sizes} = useTheme();

  const handleChange = useCallback(
    (value) => {
      setLoginData((state) => ({...state, ...value}));
    },
    [setLoginData],
  );

  const handleSignIn = useCallback(async () => {
    try {
      // Sign in the user
      const userCredential = await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      
      // Retrieve user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      let userType = '';
      let displayName = '';

      if (userDoc.exists()) {
        userType = userDoc.data().type;
        displayName = userDoc.data().displayName;
      } else {
        throw new Error('User data not found');
      }

      // Create the user object
      const user = {
        email: userCredential.user.email,
        type: userType,
        displayName: displayName,
        uid: userCredential.user.uid,
      };

      // Store user info in AsyncStorage and update global state via UserContext
      await login(user);  // Call login function from UserContext

      // Navigate to home or wherever you need
      navigation.navigate('Home');

    } catch (error) {
      console.error('Error during sign in:', error);
    }
  }, [loginData, login, navigation]);

  useEffect(() => {
    setIsValid((state) => ({
      ...state,
      email: regex.email.test(loginData.email),
      password: loginData.password.length > 0,
      agreed: loginData.agreed,
    }));
  }, [loginData, setIsValid]);

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
              {t('login.title')}
            </Text>
          </Image>
        </Block>
        {/* login form */}
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
              <Text p semibold center>
                {t('login.subtitle')}
              </Text>
              {/* social buttons */}
              <Block row center justify="space-evenly" marginVertical={sizes.m}>
                <Button outlined gray shadow={!isAndroid}>
                  <Image
                    source={assets.facebook}
                    height={sizes.m}
                    width={sizes.m}
                    color={isDark ? colors.icon : undefined}
                  />
                </Button>
                <Button outlined gray shadow={!isAndroid}>
                  <Image
                    source={assets.apple}
                    height={sizes.m}
                    width={sizes.m}
                    color={isDark ? colors.icon : undefined}
                  />
                </Button>
                <Button outlined gray shadow={!isAndroid}>
                  <Image
                    source={assets.google}
                    height={sizes.m}
                    width={sizes.m}
                    color={isDark ? colors.icon : undefined}
                  />
                </Button>
              </Block>
              <Block row flex={0} align="center" justify="center" marginBottom={sizes.sm} paddingHorizontal={sizes.xxl}>
                <Block flex={0} height={1} width="50%" end={[1, 0]} start={[0, 1]} gradient={gradients.divider} />
                <Text center marginHorizontal={sizes.s}>
                  {t('common.or')}
                </Text>
                <Block flex={0} height={1} width="50%" end={[0, 1]} start={[1, 0]} gradient={gradients.divider} />
              </Block>
              {/* form inputs */}
              <Block paddingHorizontal={sizes.sm}>
                <Input
                  label={t('common.email')}
                  autoCapitalize="none"
                  marginBottom={sizes.m}
                  keyboardType="email-address"
                  placeholder={t('common.emailPlaceholder')}
                  success={Boolean(loginData.email && isValid.email)}
                  danger={Boolean(loginData.email && !isValid.email)}
                  onChangeText={(value) => handleChange({email: value})}
                />
                <Input
                  secureTextEntry
                  label={t('common.password')}
                  autoCapitalize="none"
                  marginBottom={sizes.m}
                  placeholder={t('common.passwordPlaceholder')}
                  onChangeText={(value) => handleChange({password: value})}
                  success={Boolean(loginData.password && isValid.password)}
                  danger={Boolean(loginData.password && !isValid.password)}
                />
              </Block>
              {/* checkbox terms */}
              <Block row flex={0} align="center" paddingHorizontal={sizes.sm}>
                <Checkbox
                  marginRight={sizes.sm}
                  checked={loginData?.agreed}
                  onPress={(value) => handleChange({agreed: value})}
                />
                <Text paddingRight={sizes.s}>
                  {t('common.agree')}
                  <Text
                    semibold
                    onPress={() => {
                      Linking.openURL('https://www.creative-tim.com/terms');
                    }}>
                    {t('common.terms')}
                  </Text>
                </Text>
              </Block>
              <Button
                onPress={handleSignIn}
                marginVertical={sizes.s}
                marginHorizontal={sizes.sm}
                gradient={gradients.primary}
                disabled={Object.values(isValid).includes(false)}>
                <Text bold white transform="uppercase">
                  {t('common.signin')}
                </Text>
              </Button>
              <Button
                primary
                outlined
                shadow={!isAndroid}
                marginVertical={sizes.s}
                marginHorizontal={sizes.sm}
                onPress={() => navigation.navigate('Register')}>
                <Text bold primary transform="uppercase">
                  {t('common.signup')}
                </Text>
              </Button>
            </Block>
          </Block>
        </Block>
      </Block>
    </Block>
  );
};

export default Login;
