import {
    Button,
    ChevronDownIcon,
    HStack,
    SafeAreaView,
    Select,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicator,
    SelectDragIndicatorWrapper,
    SelectIcon,
    SelectInput,
    SelectItem,
    SelectPortal,
    SelectTrigger,
    Spinner,
    Text,
    VStack,
} from '@gluestack-ui/themed';
import { yupResolver } from '@hookform/resolvers/yup';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    Alert,
    Keyboard,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import * as Yup from 'yup';
import LabelWithRequired from '../../src/components/LabelWIthRequired';
import { useAppDispatch, useAppSelector } from '../../src/redux/hooks';
import { setUser } from '../../src/redux/slice/auth/registrationSlice';
import { RootState } from '../../src/redux/store';
import {
    type Address,
    type User,
    useLazyGetUserProfileQuery,
    useUpdateUserProfileMutation,
} from '../../src/services/appApi';
import { colors } from '../../src/theme/colors';
import { textStyle } from '../../src/theme/text-style';
import { fetchJapaneseAddress } from '../../src/utils/fetchJapaneseAddress';
import { toConvertKatakana } from '../../src/utils/katakanaConverter';

const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
    <VStack marginBottom={12}>
        <Text sx={{ ...textStyle.H_W6_13, color: colors.gr2 }}>{label}</Text>
        <Text sx={{ ...textStyle.H_W6_15, color: colors.gr1 }}>
            {value && value !== '' ? value : '-'}
        </Text>
    </VStack>
);

const ValidationSchema = Yup.object({
    name: Yup.string().required('お名前を入力してください'),
    furigana: Yup.string()
        .test(
            'is-katakana',
            'フリガナで入力してください',
            (value: string | undefined) => {
                if (!value) return true;
                return /^[ァ-ヾ゛゜\s]*$/.test(value);
            }
        )
        .required('フリガナで入力してください'),
    phoneNumber: Yup.string()
        .matches(/^(\d{10}|\d{11})$/, 'ハイフンなしで電話番号を入力してください')
        .required('電話番号を入力してください'),
    email: Yup.string()
        .email('メールアドレスフォーマットで入力してください')
        .required('メールアドレスフォーマットで入力してください'),
    postalCodePart1: Yup.string()
        .matches(/^\d{3}$/, '郵便番号を3桁で入力してください')
        .required('郵便番号を入力してください'),
    postalCodePart2: Yup.string()
        .matches(/^\d{4}$/, '郵便番号を4桁で入力してください')
        .required('郵便番号を入力してください'),
    prefecture: Yup.string().required('都道府県を入力してください'),
    city: Yup.string().required('市区町村を入力してください'),
    streetAddress: Yup.string().required('番地を入力してください'),
    building: Yup.string().optional(),
    work: Yup.string().required('職業を入力してください'),
    supportClassification: Yup.string().optional(),
    referralCode: Yup.string().optional(),
});

type FormValues = {
    name: string;
    furigana: string;
    phoneNumber: string;
    email: string;
    postalCodePart1: string;
    postalCodePart2: string;
    prefecture: string;
    city: string;
    streetAddress: string;
    building: string;
    work: string;
    supportClassification: string;
    referralCode: string;
};

type OptionalPayloadFields = Partial<
    Pick<
        ProfileUpdatePayload,
        'support_classification' | 'building_name' | 'referrer_code'
    >
>;

type ProfileUpdatePayload = {
    name: string;
    furigana: string;
    phone_number: string;
    email: string;
    occupation: string;
    postal_code: string;
    prefecture: string;
    city: string;
    street_number: string;
    support_classification?: string;
    building_name?: string;
    referrer_code?: string;
};

const EMPTY_ADDRESS: Address = {
    postal_code: '',
    prefecture: '',
    city: '',
    street_number: '',
    building_name: '',
};

const occupationOptions = [
    { label: 'UX Research', value: 'ux' },
    { label: 'Web Development', value: 'web' },
    { label: 'CPDP', value: 'cdp' },
    { label: 'UI Designing', value: 'ui', disabled: true },
    { label: 'Backend Development', value: 'backend' },
];

const normalizeAddress = (rawAddress?: Address | string | null): Address | null => {
    if (!rawAddress) {
        return null;
    }

    if (typeof rawAddress === 'string') {
        try {
            const parsed = JSON.parse(rawAddress);
            if (parsed && typeof parsed === 'object') {
                return {
                    postal_code: parsed.postal_code ?? '',
                    prefecture: parsed.prefecture ?? '',
                    city: parsed.city ?? '',
                    street_number: parsed.street_number ?? '',
                    building_name: parsed.building_name ?? '',
                };
            }
        } catch {
            return null;
        }
    }

    return typeof rawAddress === 'object' ? rawAddress : null;
};

const splitPostalCode = (postalCode?: string | null) => {
    const digitsOnly = postalCode?.replace(/\D/g, '') ?? '';
    return {
        part1: digitsOnly.slice(0, 3),
        part2: digitsOnly.slice(3, 7),
    };
};

const mergeUserWithPayload = (
    currentUser: User | null,
    payload: ProfileUpdatePayload
): User | null => {
    if (!currentUser) {
        return null;
    }

    const normalized = normalizeAddress(currentUser.address) ?? { ...EMPTY_ADDRESS };

    return {
        ...currentUser,
        name: payload.name,
        furigana: payload.furigana,
        phoneNumber: payload.phone_number,
        email: payload.email,
        occupation: payload.occupation,
        support_classification:
            payload.support_classification ?? currentUser.support_classification,
        referrer_code: payload.referrer_code ?? currentUser.referrer_code,
        address: {
            ...normalized,
            postal_code: payload.postal_code,
            prefecture: payload.prefecture,
            city: payload.city,
            street_number: payload.street_number,
            building_name:
                payload.building_name ?? normalized.building_name ?? '',
        },
    };
};

const ProfileEdit = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state: RootState) => state.registration);
    const [showForm, setShowForm] = useState(false);
    const [updateProfile, { isLoading: isUpdating }] =
        useUpdateUserProfileMutation();
    const [fetchProfile] = useLazyGetUserProfileQuery();
    const scrollViewRef = useRef<ScrollView>(null);
    const postalCode1Ref = useRef<TextInput>(null);
    const postalCode2Ref = useRef<TextInput>(null);

    const normalizedAddress = useMemo(
        () => normalizeAddress(user?.address ?? null),
        [user?.address]
    );

    const postalParts = useMemo(
        () => splitPostalCode(normalizedAddress?.postal_code),
        [normalizedAddress?.postal_code]
    );

    const defaultValues = useMemo<FormValues>(
        () => ({
            name: user?.name ?? '',
            furigana: user?.furigana ?? '',
            phoneNumber: user?.phoneNumber ?? '',
            email: user?.email ?? '',
            postalCodePart1: postalParts.part1 ?? '',
            postalCodePart2: postalParts.part2 ?? '',
            prefecture: normalizedAddress?.prefecture ?? '',
            city: normalizedAddress?.city ?? '',
            streetAddress: normalizedAddress?.street_number ?? '',
            building: normalizedAddress?.building_name ?? '',
            work: user?.occupation ?? '',
            supportClassification: user?.support_classification ?? '',
            referralCode: user?.referrer_code ?? '',
        }),
        [user, normalizedAddress, postalParts.part1, postalParts.part2]
    );

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        trigger,
        formState: { errors },
        reset,
    } = useForm<FormValues>({
        resolver: yupResolver(ValidationSchema) as any,
        defaultValues,
        mode: 'onBlur',
        reValidateMode: 'onChange',
    });

    const watchedValues = watch();

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    useEffect(() => {
        if (user?.phoneNumber) {
            setValue('phoneNumber', user.phoneNumber, {
                shouldValidate: true,
                shouldDirty: false,
            });
        }
    }, [user?.phoneNumber, setValue]);

    const handleNameChange = async (text: string) => {
        setValue('name', text);
        const converted = await toConvertKatakana(text);
        setValue('furigana', converted);
        if (errors.name || errors.furigana) {
            trigger(['name', 'furigana']);
        }
    };

    const handlePostalCodeSearch = async () => {
        const code = (
            (watchedValues.postalCodePart1 || '') +
            (watchedValues.postalCodePart2 || '')
        ).replace(/\D/g, '');

        if (code.length !== 7) {
            Alert.alert('エラー', '郵便番号は7桁で入力してください。');
            return;
        }

        const fetched = await fetchJapaneseAddress(code);
        setValue('prefecture', fetched?.address1 || '');
        setValue('city', (fetched?.address2 || '') + (fetched?.address3 || ''));
        trigger(['prefecture', 'city']);
    };

    const onSubmit = async (values: FormValues) => {
        try {
            const postalCode = (
                values.postalCodePart1 + values.postalCodePart2
            ).replace(/\D/g, '');

            const basePayload: ProfileUpdatePayload = {
                name: values.name.trim(),
                furigana: values.furigana.trim(),
                phone_number: values.phoneNumber,
                email: values.email.trim(),
                occupation: values.work.trim(),
                postal_code: postalCode,
                prefecture: values.prefecture.trim(),
                city: values.city.trim(),
                street_number: values.streetAddress.trim(),
            };

            const optionalFields: OptionalPayloadFields = {
                support_classification: values.supportClassification?.trim() || '',
                building_name: values.building?.trim() || '',
                referrer_code: values.referralCode?.trim() || '',
            };

            const payload = Object.entries(optionalFields).reduce<ProfileUpdatePayload>(
                (acc, [key, value]) => {
                    const trimmed = (value || '').trim();
                    if (trimmed && trimmed.length > 0) {
                        acc[key as keyof OptionalPayloadFields] = trimmed;
                    }
                    return acc;
                },
                { ...basePayload }
            );

            console.log('📤 Sending profile update payload:', JSON.stringify(payload, null, 2));

            const updateResult = await updateProfile(payload).unwrap();
            console.log('✅ Profile update API response:', JSON.stringify(updateResult, null, 2));

            // Verify update was successful
            if (updateResult.status !== 'success') {
                throw new Error(updateResult.message || 'Profile update failed');
            }

            const optimisticUser = mergeUserWithPayload(user, payload);
            if (optimisticUser) {
                console.log('🔄 Optimistic update - merged user:', JSON.stringify(optimisticUser, null, 2));
                dispatch(setUser(optimisticUser));
            }

            // Wait a bit to ensure backend has processed the update
            await new Promise(resolve => setTimeout(resolve, 1000));

            const refreshed = await fetchProfile(undefined, false).unwrap();
            console.log('📥 Profile fetch response:', JSON.stringify(refreshed, null, 2));

            if (refreshed.status === 'success' && refreshed.data) {
                console.log('✅ Updating Redux with fetched data:', JSON.stringify(refreshed.data, null, 2));
                console.log('📍 Address in fetched data:', JSON.stringify(refreshed.data.address, null, 2));
                dispatch(setUser(refreshed.data));
            } else {
                console.warn('⚠️ Profile fetch returned non-success status:', refreshed.status);
            }
            Alert.alert('成功', 'プロフィールを更新しました。', [
                {
                    text: 'OK',
                    onPress: () => setShowForm(false),
                },
            ]);
        } catch (error: any) {
            console.error('Profile update error:', error);
            Alert.alert(
                'エラー',
                error?.data?.message || 'プロフィール更新中にエラーが発生しました。'
            );
        }
    };

    if (!user) {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <Stack.Screen
                    options={{
                        title: 'プロフィール編集',
                        headerShown: true,
                        headerTitle: 'プロフィール編集',
                        headerTitleAlign: 'center',
                    }}
                />
                <VStack flex={1} justifyContent="center" alignItems="center">
                    <Text>ユーザー情報が見つかりません。</Text>
                </VStack>
            </SafeAreaView>
        );
    }

    const renderInfoView = () => (
        <VStack padding={16} gap={16}>
            <Text sx={{ ...textStyle.H_W6_18, color: colors.gr1 }}>
                登録済みの情報
            </Text>
            <InfoRow label="氏名" value={user.name} />
            <InfoRow label="フリガナ" value={user.furigana} />
            <InfoRow label="電話番号" value={user.phoneNumber} />
            <InfoRow label="メール" value={user.email} />
            <InfoRow label="職業" value={user.occupation} />
            {normalizedAddress ? (
                <>
                    <InfoRow label="郵便番号" value={normalizedAddress.postal_code} />
                    <InfoRow label="都道府県" value={normalizedAddress.prefecture} />
                    <InfoRow label="市区町村" value={normalizedAddress.city} />
                    <InfoRow label="丁目・番地" value={normalizedAddress.street_number} />
                    <InfoRow label="建物名" value={normalizedAddress.building_name} />
                </>
            ) : (
                <InfoRow
                    label="住所"
                    value={
                        typeof user.address === 'string' && user.address.length > 0
                            ? user.address
                            : '-'
                    }
                />
            )}
            <InfoRow label="紹介コード" value={user.referrer_code || '-'} />

            <TouchableOpacity
                style={{
                    backgroundColor: colors.rd,
                    paddingVertical: 14,
                    borderRadius: 8,
                    alignItems: 'center',
                }}
                onPress={() => {
                    reset(defaultValues);
                    setShowForm(true);
                }}
            >
                <Text sx={{ ...textStyle.H_W6_15, color: colors.wt }}>
                    編集する
                </Text>
            </TouchableOpacity>
        </VStack>
    );

    const renderForm = () => (
        <TouchableOpacity
            activeOpacity={1}
            onPress={Keyboard.dismiss}
            style={{ flex: 1 }}
        >
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <VStack gap={16}>
                    <Text sx={{ ...textStyle.H_W6_18, color: colors.gr1 }}>
                        情報を編集
                    </Text>

                    <LabelWithRequired label="お名前" required />
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onBlur, value } }) => (
                            <TextInput
                                onChangeText={handleNameChange}
                                onBlur={onBlur}
                                value={value}
                                placeholder="山田　花子"
                                placeholderTextColor={colors.line}
                                style={[
                                    styles.input,
                                    { borderColor: errors.name ? colors.rd : colors.line },
                                ]}
                            />
                        )}
                    />
                    {errors.name && (
                        <Text style={styles.errorText}>{errors.name.message}</Text>
                    )}

                    <LabelWithRequired label="フリガナ" required />
                    <Controller
                        control={control}
                        name="furigana"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                onChangeText={text => {
                                    onChange(text);
                                    if (errors.furigana) trigger('furigana');
                                }}
                                onBlur={onBlur}
                                value={value}
                                placeholder="やまだ　はなこ"
                                placeholderTextColor={colors.line}
                                style={[
                                    styles.input,
                                    { borderColor: errors.furigana ? colors.rd : colors.line },
                                ]}
                            />
                        )}
                    />
                    {errors.furigana && (
                        <Text style={styles.errorText}>{errors.furigana.message}</Text>
                    )}

                    <LabelWithRequired label="電話番号" required />
                    <Controller
                        control={control}
                        name="phoneNumber"
                        render={({ field: { value } }) => (
                            <TextInput
                                value={value}
                                editable={false}
                                selectTextOnFocus={false}
                                placeholder="1234567890"
                                placeholderTextColor={colors.line}
                                style={[styles.input, { backgroundColor: colors.gr4 }]}
                            />
                        )}
                    />

                    <LabelWithRequired label="メールアドレス" required />
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                onChangeText={text => {
                                    onChange(text);
                                    if (errors.email) trigger('email');
                                }}
                                onBlur={onBlur}
                                value={value}
                                placeholder="yellpay@email.com"
                                keyboardType="email-address"
                                placeholderTextColor={colors.line}
                                style={[
                                    styles.input,
                                    { borderColor: errors.email ? colors.rd : colors.line },
                                ]}
                            />
                        )}
                    />
                    {errors.email && (
                        <Text style={styles.errorText}>{errors.email.message}</Text>
                    )}

                    <LabelWithRequired label="郵便番号" required />
                    <HStack alignItems="center" justifyContent="space-between">
                        <HStack alignItems="center">
                            <Controller
                                control={control}
                                name="postalCodePart1"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        ref={postalCode1Ref}
                                        onChangeText={text => {
                                            onChange(text);
                                            if (text.length === 3) {
                                                postalCode2Ref.current?.focus();
                                            }
                                            if (errors.postalCodePart1 || errors.postalCodePart2) {
                                                trigger(['postalCodePart1', 'postalCodePart2']);
                                            }
                                        }}
                                        onBlur={onBlur}
                                        value={value}
                                        maxLength={3}
                                        keyboardType="numeric"
                                        placeholder="123"
                                        placeholderTextColor={colors.line}
                                        style={[
                                            styles.postalInput,
                                            {
                                                borderColor:
                                                    errors.postalCodePart1 || errors.postalCodePart2
                                                        ? colors.rd
                                                        : colors.line,
                                            },
                                        ]}
                                    />
                                )}
                            />
                            <Text style={{ marginHorizontal: 8 }}>-</Text>
                            <Controller
                                control={control}
                                name="postalCodePart2"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        ref={postalCode2Ref}
                                        onChangeText={text => {
                                            onChange(text);
                                            if (text.length === 0) {
                                                postalCode1Ref.current?.focus();
                                            }
                                            if (errors.postalCodePart1 || errors.postalCodePart2) {
                                                trigger(['postalCodePart1', 'postalCodePart2']);
                                            }
                                        }}
                                        onBlur={onBlur}
                                        value={value}
                                        maxLength={4}
                                        keyboardType="numeric"
                                        placeholder="4567"
                                        placeholderTextColor={colors.line}
                                        style={[
                                            styles.postalInput,
                                            {
                                                width: 96,
                                                borderColor:
                                                    errors.postalCodePart1 || errors.postalCodePart2
                                                        ? colors.rd
                                                        : colors.line,
                                            },
                                        ]}
                                    />
                                )}
                            />
                        </HStack>
                        <Button
                            variant="outline"
                            borderColor={colors.rd}
                            sx={{ height: 48 }}
                            onPress={handlePostalCodeSearch}
                        >
                            <Text sx={{ color: colors.rd, ...textStyle.H_W6_14 }}>住所検索</Text>
                        </Button>
                    </HStack>
                    {(errors.postalCodePart1 || errors.postalCodePart2) && (
                        <Text style={styles.errorText}>
                            {errors.postalCodePart1?.message || errors.postalCodePart2?.message}
                        </Text>
                    )}

                    <LabelWithRequired label="都道府県" required />
                    <Controller
                        control={control}
                        name="prefecture"
                        render={({ field: { value } }) => (
                            <TextInput
                                value={value}
                                editable={false}
                                placeholder="東京都"
                                placeholderTextColor={colors.line}
                                style={[styles.input, { backgroundColor: colors.gr4 }]}
                            />
                        )}
                    />
                    {errors.prefecture && (
                        <Text style={styles.errorText}>{errors.prefecture.message}</Text>
                    )}

                    <LabelWithRequired label="市区町村" required />
                    <Controller
                        control={control}
                        name="city"
                        render={({ field: { value } }) => (
                            <TextInput
                                value={value}
                                editable={false}
                                placeholder="○○区"
                                placeholderTextColor={colors.line}
                                style={[styles.input, { backgroundColor: colors.gr4 }]}
                            />
                        )}
                    />
                    {errors.city && (
                        <Text style={styles.errorText}>{errors.city.message}</Text>
                    )}

                    <LabelWithRequired label="番地" required />
                    <Controller
                        control={control}
                        name="streetAddress"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                onChangeText={text => {
                                    onChange(text);
                                    if (errors.streetAddress) trigger('streetAddress');
                                }}
                                onBlur={onBlur}
                                value={value}
                                placeholder="１−１−１"
                                placeholderTextColor={colors.line}
                                style={[
                                    styles.input,
                                    {
                                        borderColor: errors.streetAddress ? colors.rd : colors.line,
                                    },
                                ]}
                            />
                        )}
                    />
                    {errors.streetAddress && (
                        <Text style={styles.errorText}>{errors.streetAddress.message}</Text>
                    )}

                    <LabelWithRequired label="建物名" required={false} />
                    <Controller
                        control={control}
                        name="building"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                onChangeText={onChange}
                                value={value}
                                placeholder="○○ビル101"
                                placeholderTextColor={colors.line}
                                style={styles.input}
                            />
                        )}
                    />

                    <LabelWithRequired label="職業" required />
                    <Controller
                        control={control}
                        name="work"
                        render={({ field: { onChange, value } }) => (
                            <Select
                                onValueChange={newValue => {
                                    onChange(newValue);
                                    if (errors.work) {
                                        trigger('work');
                                    }
                                }}
                                selectedValue={value}
                            >
                                <SelectTrigger
                                    variant="outline"
                                    size="md"
                                    sx={{
                                        height: 48,
                                        borderWidth: 1,
                                        borderRadius: 8,
                                        padding: 5,
                                        paddingTop: 8,
                                        marginBottom: errors.work ? 6 : 16,
                                        borderColor: errors.work ? colors.rd : colors.line,
                                    }}
                                >
                                    <SelectInput placeholder="職業を選択してください" />
                                    <SelectIcon as={ChevronDownIcon} />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectBackdrop />
                                    <SelectContent>
                                        <SelectDragIndicatorWrapper>
                                            <SelectDragIndicator />
                                        </SelectDragIndicatorWrapper>
                                        {occupationOptions.map(option => (
                                            <SelectItem
                                                key={option.value}
                                                label={option.label}
                                                value={option.value}
                                                isDisabled={option.disabled}
                                            />
                                        ))}
                                    </SelectContent>
                                </SelectPortal>
                            </Select>
                        )}
                    />
                    {errors.work && (
                        <Text style={styles.errorText}>{errors.work.message}</Text>
                    )}

                    <VStack gap={12} marginTop={8}>
                        <TouchableOpacity
                            style={{
                                backgroundColor: colors.rd,
                                paddingVertical: 14,
                                borderRadius: 8,
                                alignItems: 'center',
                            }}
                            onPress={handleSubmit(onSubmit)}
                            disabled={isUpdating}
                        >
                            {isUpdating ? (
                                <Spinner color={colors.wt} />
                            ) : (
                                <Text sx={{ ...textStyle.H_W6_15, color: colors.wt }}>
                                    保存する
                                </Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                backgroundColor: colors.gr4,
                                paddingVertical: 14,
                                borderRadius: 8,
                                alignItems: 'center',
                            }}
                            onPress={() => {
                                reset(defaultValues);
                                setShowForm(false);
                            }}
                        >
                            <Text sx={{ ...textStyle.H_W6_15, color: colors.gr1 }}>
                                キャンセル
                            </Text>
                        </TouchableOpacity>
                    </VStack>
                </VStack>
            </ScrollView>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Stack.Screen
                options={{
                    title: 'プロフィール編集',
                    headerShown: true,
                    headerTitle: 'プロフィール編集',
                    headerTitleAlign: 'center',
                }}
            />
            <ScrollView
                style={{ flex: 1, backgroundColor: colors.wt }}
                contentContainerStyle={{ paddingBottom: 40 }}
                keyboardShouldPersistTaps="handled"
            >
                {showForm ? renderForm() : renderInfoView()}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: colors.gr1,
        backgroundColor: colors.wt,
    },
    postalInput: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        width: 80,
        color: colors.gr1,
        backgroundColor: colors.wt,
    },
    errorText: {
        color: colors.wt,
        backgroundColor: colors.rd,
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 4,
        fontSize: 13,
        lineHeight: 18,
    },
});

export default ProfileEdit;
