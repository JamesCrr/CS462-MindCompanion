import React, { useCallback, useState, useContext } from "react";
import { Platform } from "react-native";
import { useNavigation } from "@react-navigation/core";
import { useData, useTheme, useTranslation } from "../hooks/";
import { Block, Button, Input, Image, Text } from "../components/";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "../hooks/userContext";

const isAndroid = Platform.OS === "android";

const Login = () => {
  const { isDark } = useData();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { login } = useContext(UserContext);
  const { assets, colors, gradients, sizes } = useTheme();
  const [selectedType, setSelectedType] = useState("");

  const [loginData, setLoginData] = useState({
    name: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback(
    (value) => {
      setLoginData((state) => ({ ...state, ...value }));
      setError(""); // Clear error when input changes
    },
    [setLoginData]
  );

  const handleSignIn = useCallback(async () => {
    if (loading) return;
    if (!selectedType || !loginData.name || !loginData.password) {
      setError("Please fill in all fields and select a role");
      return;
    }

    setLoading(true);
    try {
      console.log("Attempting login with:", {
        name: loginData.name,
        type: selectedType,
      });

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("name", "==", loginData.name), where("type", "==", selectedType));

      const querySnapshot = await getDocs(q);
      console.log("Query results:", querySnapshot.size);
      if (querySnapshot.empty) {
        setError("User not found with selected role");
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      console.log("Found user data:", userData);
      if (userData.password !== loginData.password) {
        console.log("Password mismatch:", {
          input: loginData.password,
          stored: userData.password,
        });
        setError("Invalid password");
        return;
      }

      const user = {
        name: userData.name,
        type: userData.type,
        id: userDoc.id,
        stats: userData.stats,
        uid: userDoc.id, // Add this line
      };

      console.log("Login successful, user object:", user);
      setLoading(false);

      try {
        await login(user);
        navigation.replace("Home");
      } catch (loginError) {
        console.error("Error in login context:", loginError);
        setError("Failed to save login session");
        return;
      }
    } catch (error) {
      console.error("Error during sign in:", error);
      setError("An error occurred during sign in");
      setLoading(false);
    }
  }, [loginData, selectedType, login, navigation]);

  return (
    <Block safe marginTop={sizes.md}>
      <Block paddingHorizontal={sizes.s}>
        <Block flex={0} style={{ zIndex: 0 }}>
          <Image
            background
            resizeMode="cover"
            padding={sizes.sm}
            radius={sizes.cardRadius}
            source={assets.background}
            height={sizes.height * 0.3}
          >
            {/* <Button
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
            </Button> */}

            <Text h4 center white marginBottom={sizes.md}>
              {t("login.title")}
            </Text>
          </Image>
        </Block>

        <Block keyboard marginTop={-(sizes.height * 0.2 - sizes.l)} behavior={!isAndroid ? "padding" : "height"}>
          <Block flex={0} radius={sizes.sm} marginHorizontal="8%" shadow={!isAndroid}>
            <Block
              blur
              flex={0}
              intensity={90}
              radius={sizes.sm}
              overflow="hidden"
              justify="space-evenly"
              tint={colors.blurTint}
              paddingVertical={sizes.sm}
            >
              {/* Type Selection Buttons */}
              <Block paddingHorizontal={sizes.sm} marginBottom={sizes.sm}>
                <Text p semibold marginBottom={sizes.sm}>
                  Select your role:
                </Text>
                <Block row flex={0} justify="space-between" marginBottom={sizes.sm}>
                  {["Staff", "Caregiver", "Volunteer"].map((type) => (
                    <Button
                      key={type}
                      flex={0}
                      width="30%"
                      gradient={selectedType === type ? gradients.primary : undefined}
                      outlined={selectedType !== type}
                      onPress={() => setSelectedType(type)}
                    >
                      <Text
                        bold
                        size={13}
                        transform="uppercase"
                        color={selectedType === type ? colors.white : colors.primary}
                      >
                        {type}
                      </Text>
                    </Button>
                  ))}
                </Block>
              </Block>

              {/* Login Form */}
              <Block paddingHorizontal={sizes.sm}>
                <Input
                  label="Name"
                  autoCapitalize="none"
                  marginBottom={sizes.m}
                  placeholder="Enter your name"
                  onChangeText={(value) => handleChange({ name: value })}
                />
                <Input
                  secureTextEntry
                  label="Password"
                  autoCapitalize="none"
                  marginBottom={sizes.m}
                  placeholder="Enter your password"
                  onChangeText={(value) => handleChange({ password: value })}
                />
              </Block>

              {/* Error Message */}
              {error ? (
                <Text p color={colors.danger} center marginBottom={sizes.sm}>
                  {error}
                </Text>
              ) : null}

              {/* Sign In Button */}
              <Button
                onPress={handleSignIn}
                marginVertical={sizes.s}
                marginHorizontal={sizes.sm}
                gradient={gradients.primary}
                disabled={!selectedType || !loginData.name || !loginData.password || loading}
              >
                <Text bold white transform="uppercase">
                  {t("common.signin")}
                </Text>
              </Button>

              {/* Register Button */}
              <Button
                primary
                outlined
                shadow={!isAndroid}
                marginVertical={sizes.s}
                marginHorizontal={sizes.sm}
                onPress={() => navigation.navigate("Register")}
              >
                <Text bold primary transform="uppercase">
                  {t("common.signup")}
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
