import {
    Button,
    ButtonText,
    HStack,
    Icon,
    Modal,
    ModalBackdrop,
    ModalBody,
    ModalContent,
    SafeAreaView,
    ScrollView,
    Text,
    VStack
} from '@gluestack-ui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AlertCircle, ChevronLeft, InfoIcon, TriangleAlert } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Platform, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { GradientButton } from '../../src/components/GradientButton';
import { clearRegistration } from '../../src/redux/slice/auth/registrationSlice';
import { persistor } from '../../src/redux/store';
import { useDeleteUserMutation } from '../../src/services/appApi';
import { colors } from '../../src/theme/colors';
import { textStyle } from '../../src/theme/text-style';

const AccountDelete = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [deleteUser, { isLoading }] = useDeleteUserMutation();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const token = useSelector((state: any) => state.registration.token);

    const handleDeleteAccount = async () => {
        try {
            const result = await deleteUser().unwrap();
            if (result.status === 'success' && result.message === 'Successfully Deleted this user') {
                // Clear redux storage completely
                dispatch(clearRegistration());
                await persistor.purge();

                // Show success modal
                setShowSuccessModal(true);
            }
        } catch (error) {
            console.error('Delete account error:', error);
        }
    };

    const handleNavigateToLogin = () => {
        setShowSuccessModal(false);
        router.replace('/');
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar style="dark" />
            <Stack.Screen
                options={{
                    title: 'アカウント削除',
                    headerShown: true,
                    headerTitle: 'アカウント削除',
                    headerTitleAlign: 'center',
                    headerTitleStyle: {
                        fontFamily: 'Roboto Medium',
                        fontWeight: '600',
                        fontSize: 18,
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()}>
                            <Icon as={ChevronLeft} color={colors.rd} size="lg" />
                        </TouchableOpacity>
                    ),
                }}
            />
            <VStack style={{ flex: 1 }}>
                <ScrollView
                    style={{ backgroundColor: colors.wt, flex: 1 }}
                    contentContainerStyle={{ paddingBottom: 16 }}
                >
                    <VStack paddingHorizontal={16} paddingVertical={24}>
                        <Image
                            alt="account-delete"
                            source={require('../../assets/images/splash-icon.png')}
                            style={{ width: 150, height: 64, alignSelf: 'center' }}
                            resizeMode="contain"
                        />
                        <Text
                            sx={{
                                ...textStyle.H_W6_18,
                                color: colors.gr2,
                                textAlign: 'center',
                                mt: 24,
                                mb: 24,
                            }}
                        >
                            アカウントを削除しますか？
                        </Text>
                        <HStack mt={24} width="90%">
                            <Icon as={InfoIcon} color={colors.bl} size="xl" mr={8} />
                            <Text
                                sx={{
                                    ...textStyle.H_W3_15,
                                    color: colors.gr2,
                                }}
                            >
                                アカウント削除後、復帰できません {'\n'}
                                登録しているプロフィール情報や障碍者手帳等が完全削除となります。

                            </Text>
                        </HStack>
                        <HStack mt={24} width="90%">
                            <Icon as={TriangleAlert} color={colors.bl} size="xl" mr={8} />
                            <Text
                                sx={{
                                    ...textStyle.H_W3_15,
                                    color: colors.gr2,
                                }}
                            >
                                割引等が使用できなくなります {'\n'}
                                アカウント削除後、割引が適用されなくなりその得点がもらえなくなります。
                            </Text>
                        </HStack>
                    </VStack>
                </ScrollView>
                <VStack
                    style={{
                        paddingHorizontal: 16,
                        paddingBottom: 24,
                        paddingTop: 16,
                        backgroundColor: colors.wt,
                    }}
                >
                    <GradientButton
                        title="アカウントを削除する"
                        onPress={() => setShowConfirmModal(true)}
                        style={{ width: '100%' }}
                        disabled={isLoading}
                    />
                    <TouchableOpacity onPress={() => router.back()} style={{ alignItems: 'center', justifyContent: 'center', marginTop: 16, marginBottom: 16 }}>
                        <Button onPress={() => router.back()} variant="outline" action="primary" style={{ width: '100%', borderColor: colors.gr1, borderWidth: 1, height: 56, borderRadius: 10 }}>
                            <Button.Text
                                sx={{
                                    ...textStyle.H_W6_15,
                                    color: colors.gr1,
                                    textAlign: 'center',
                                }}
                            >
                                戻る
                            </Button.Text>
                        </Button>
                    </TouchableOpacity>
                </VStack>
            </VStack>

            {/* Confirmation Modal */}
            <Modal
                isOpen={showConfirmModal}
                size="lg"
                closeOnOverlayClick={true}
                onClose={() => setShowConfirmModal(false)}
            >
                <ModalBackdrop />
                <ModalContent backgroundColor={colors.wt}>
                    <ModalBody>
                        <VStack
                            alignItems="center"
                            justifyContent="center"
                            paddingVertical={40}
                            paddingHorizontal={24}
                        >
                            <View style={{ marginBottom: 24, transform: [{ scale: 2 }] }}>
                                <Icon
                                    as={AlertCircle}
                                    color={colors.rd}
                                    size="xl"
                                />
                            </View>
                            <Text
                                sx={{
                                    ...textStyle.H_W6_18,
                                    color: colors.gr2,
                                    mb: 16,
                                    textAlign: 'center',
                                }}
                            >
                                アカウント削除
                            </Text>
                            <Text
                                sx={{
                                    ...textStyle.H_W3_15,
                                    color: colors.gr2,
                                    mb: 32,
                                    textAlign: 'center',
                                }}
                            >
                                アカウントを削除してよろしいですか？
                            </Text>
                            <HStack width="100%" gap={12}>
                                <Button
                                    variant="outline"
                                    flex={1}
                                    onPress={() => setShowConfirmModal(false)}
                                    sx={{
                                        borderColor: colors.gr1,
                                        borderWidth: 1,
                                        height: 48,
                                        borderRadius: 10,
                                    }}
                                >
                                    <ButtonText
                                        sx={{
                                            ...textStyle.H_W6_15,
                                            color: colors.gr1,
                                        }}
                                    >
                                        キャンセル
                                    </ButtonText>
                                </Button>
                                <Button
                                    flex={1}
                                    onPress={() => {
                                        setShowConfirmModal(false);
                                        handleDeleteAccount();
                                    }}
                                    sx={{
                                        backgroundColor: colors.rd,
                                        height: 48,
                                        borderRadius: 10,
                                    }}
                                    disabled={isLoading}
                                >
                                    <ButtonText
                                        sx={{
                                            ...textStyle.H_W6_15,
                                            color: colors.wt1,
                                        }}
                                    >
                                        削除する
                                    </ButtonText>
                                </Button>
                            </HStack>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Success Modal */}
            <Modal
                isOpen={showSuccessModal}
                size="lg"
                closeOnOverlayClick={false}
            >
                <ModalBackdrop />
                <ModalContent backgroundColor={colors.wt}>
                    <ModalBody>
                        <VStack
                            alignItems="center"
                            justifyContent="center"
                            paddingVertical={40}
                            paddingHorizontal={24}
                        >
                            <Image
                                source={require('../../assets/images/success-logo.png')}
                                style={{ width: 64, height: 64 }}
                                alt="success-logo"
                            />
                            <Text
                                sx={{
                                    ...textStyle.H_W6_15,
                                    color: colors.gr1,
                                    mt: 32,
                                    mb: 40,
                                    textAlign: 'center',
                                }}
                            >
                                アカウントが削除されました。
                            </Text>
                            <TouchableOpacity
                                onPress={handleNavigateToLogin}
                                style={{
                                    borderRadius: 10,
                                    height: 48,
                                    width: '100%',
                                    ...Platform.select({
                                        ios: {
                                            shadowColor: '#000',
                                            shadowOffset: {
                                                width: 0,
                                                height: -1,
                                            },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 20,
                                        },
                                        android: {
                                            elevation: 3,
                                        },
                                    }),
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <LinearGradient
                                    colors={['#F6575D', '#D5242A']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 0, y: 0 }}
                                    style={{
                                        position: 'absolute',
                                        borderRadius: 10,
                                        height: 48,
                                        width: '100%',
                                    }}
                                />
                                <Text
                                    sx={{
                                        ...textStyle.H_W6_15,
                                        color: colors.wt1,
                                    }}
                                >
                                    ログイン画面へ
                                </Text>
                            </TouchableOpacity>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </SafeAreaView>
    );
};

export default AccountDelete;
