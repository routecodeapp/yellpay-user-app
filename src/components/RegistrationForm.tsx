import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Button,
  ChevronDownIcon,
  Divider,
  HStack,
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
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Keyboard,
  Platform,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import * as Yup from 'yup';
import { useAppSelector } from '../redux/hooks';
import { colors } from '../theme/colors';
import { textStyle } from '../theme/text-style';
import { RegistrationFormData } from '../types/registration';
import { fetchJapaneseAddress } from '../utils/fetchJapaneseAddress';
import { toConvertKatakana } from '../utils/katakanaConverter';
import Indicator from './Indicator';
import LabelWithRequired from './LabelWIthRequired';

const ValidationSchema = Yup.object({
  name: Yup.string().required('お名前を入力してください'),
  furigana: Yup.string()
    .test(
      'is-katakana',
      'ふりがなで入力してください',
      (value: string | undefined) => {
        if (!value) return true; // optional field
        return /^[ァ-ヾ゛゜\s]*$/.test(value);
      }
    )
    .required('ふりがなで入力してください'),
  phoneNumber: Yup.string()
    .matches(/^\d{10,11}$/, 'ハイフンなしで電話番号を入力してください')
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
  prefecture: Yup.string().required('都道府県を選択してください'),
  city: Yup.string().required('番地を入力してください'),
  streetAddress: Yup.string().required('番地を入力してください'),
  building: Yup.string().optional(),
  work: Yup.string().required('職業を選択してください'),
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
  referralCode: string;
};

const RegistrationForm = ({
  totalSteps,
  activeIndex,
  setFormData,
  handleNext,
  initialData,
}: {
  totalSteps: number;
  activeIndex: number;
  setFormData: React.Dispatch<React.SetStateAction<RegistrationFormData | null>>;
  handleNext: () => void;
  initialData: RegistrationFormData | null;
}) => {
  const scrollViewRef = React.useRef<ScrollView>(null);
  const postalCode1Ref = useRef<TextInput>(null);
  const postalCode2Ref = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    trigger,
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(ValidationSchema) as any,
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      name: initialData?.name ?? '',
      furigana: initialData?.furigana ?? '',
      phoneNumber: initialData?.phoneNumber ?? '',
      email: initialData?.email ?? '',
      postalCodePart1: initialData?.postalCodePart1 ?? '',
      postalCodePart2: initialData?.postalCodePart2 ?? '',
      prefecture: initialData?.prefecture ?? '',
      city: initialData?.city ?? '',
      streetAddress: initialData?.streetAddress ?? '',
      building: initialData?.building ?? '',
      work: initialData?.work ?? '',
      referralCode: initialData?.referralCode ?? '',
    },
  });

  React.useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        furigana: initialData.furigana,
        phoneNumber: initialData.phoneNumber,
        email: initialData.email,
        postalCodePart1: initialData.postalCodePart1,
        postalCodePart2: initialData.postalCodePart2,
        prefecture: initialData.prefecture,
        city: initialData.city,
        streetAddress: initialData.streetAddress,
        building: initialData.building,
        work: initialData.work,
        referralCode: initialData.referralCode,
      });
    }
  }, [initialData, reset]);

  const watchedValues = watch();

  // Prefill phone number from Redux (login/verification) and lock input
  const storedPhoneNumber = useAppSelector(
    state => state.registration.user?.phoneNumber
  ) || '';
  React.useEffect(() => {
    if (storedPhoneNumber) {
      setValue('phoneNumber', storedPhoneNumber, {
        shouldValidate: true,
        shouldDirty: false,
      });
    }
  }, [storedPhoneNumber, setValue]);

  const scrollToInput = (yOffset: number = 0) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: yOffset,
        animated: true,
      });
    }, 100);
  };

  const onSubmit = (values: FormValues) => {
    Keyboard.dismiss();
    setFormData(values);
    handleNext();
  };

  const handleNameChange = async (text: string) => {
    setValue('name', text);
    const convertedText = await toConvertKatakana(text);
    setValue('furigana', convertedText);
    // Only trigger validation if there are existing errors
    if (errors.name || errors.furigana) {
      trigger(['name', 'furigana']);
    }
  };

  const handlePostalCodeSearch = async () => {
    const postalCode =
      watchedValues.postalCodePart1 + watchedValues.postalCodePart2;
    if (postalCode.length === 7) {
      const address = await fetchJapaneseAddress(postalCode);
      setValue('prefecture', address?.address1 || '');
      setValue('city', (address?.address2 || '') + (address?.address3 || ''));
      // Trigger validation for these fields
      trigger(['prefecture', 'city', 'postalCodePart1', 'postalCodePart2']);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{
            paddingBottom: 100,
            flexGrow: 1,
            zIndex: 1000,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            // Auto-scroll when content changes
            if (Platform.OS === 'android') {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }
          }}
        >
          <VStack flex={1} px={8}>
            {/* <Text
              sx={{
                ...textStyle.H_W6_20,
                textAlign: 'center',
                py: 48,
                color: colors.rd,
              }}
            >
              会員情報登録
            </Text> */}

            <VStack>
              <LabelWithRequired label="お名前" required />
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    onChangeText={handleNameChange}
                    onBlur={onBlur}
                    onFocus={() => {
                      scrollToInput(100);
                    }}
                    value={value}
                    placeholder="山田　花子"
                    placeholderTextColor={colors.line}
                    style={{
                      borderWidth: 1,
                      padding: 10,
                      borderRadius: 5,
                      paddingTop: 8,
                      marginBottom: errors.name ? 6 : 16,
                      marginTop: 4,
                      height: 48,
                      borderColor: errors.name ? colors.rd : colors.line,
                    }}
                  />
                )}
              />
              {errors.name && (
                <Text
                  sx={{
                    color: colors.wt,
                    ...textStyle.H_W3_13,
                    mb: 16,
                    px: 4,
                    py: 2,
                    borderRadius: 4,
                    backgroundColor: colors.rd,
                  }}
                >
                  {errors.name.message}
                </Text>
              )}

              <LabelWithRequired label="ふりがな" required />
              <Controller
                control={control}
                name="furigana"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    onChangeText={text => {
                      onChange(text);
                      // Only trigger validation if there are existing errors
                      if (errors.furigana) {
                        trigger('furigana');
                      }
                    }}
                    onBlur={onBlur}
                    onFocus={() => {
                      scrollToInput(150);
                    }}
                    value={value}
                    placeholder="やまだ　はなこ"
                    placeholderTextColor={colors.line}
                    style={{
                      borderWidth: 1,
                      padding: 10,
                      borderRadius: 5,
                      paddingTop: 8,
                      marginBottom: errors.furigana ? 6 : 16,
                      marginTop: 4,
                      height: 48,
                      borderColor: errors.furigana ? colors.rd : colors.line,
                    }}
                  />
                )}
              />
              {errors.furigana && (
                <Text
                  sx={{
                    color: colors.wt,
                    ...textStyle.H_W3_13,
                    mb: 16,
                    px: 4,
                    py: 2,
                    borderRadius: 4,
                    backgroundColor: colors.rd,
                  }}
                >
                  {errors.furigana.message}
                </Text>
              )}

              <LabelWithRequired label="電話番号" required />
              <Controller
                control={control}
                name="phoneNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    onChangeText={text => {
                      onChange(text);
                      // Only trigger validation if there are existing errors
                      if (errors.phoneNumber) {
                        trigger('phoneNumber');
                      }
                    }}
                    onBlur={onBlur}
                    onFocus={() => {
                      scrollToInput(200);
                    }}
                    maxLength={11}
                    value={value}
                    placeholder="1234567989"
                    keyboardType="numeric"
                    editable={false}
                    selectTextOnFocus={false}
                    placeholderTextColor={colors.line}
                    style={{
                      borderWidth: 1,
                      padding: 10,
                      borderRadius: 5,
                      paddingTop: 5,
                      marginBottom: errors.phoneNumber ? 6 : 16,
                      marginTop: 4,
                      height: 48,
                      borderColor: errors.phoneNumber ? colors.rd : colors.line,
                    }}
                  />
                )}
              />
              {errors.phoneNumber && (
                <Text
                  sx={{
                    color: colors.wt,
                    ...textStyle.H_W3_13,
                    mb: 16,
                    px: 4,
                    py: 2,
                    borderRadius: 4,
                    backgroundColor: colors.rd,
                  }}
                >
                  {errors.phoneNumber.message}
                </Text>
              )}

              <LabelWithRequired label="メールアドレス" required />
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    onChangeText={text => {
                      onChange(text);
                      // Only trigger validation if there are existing errors
                      if (errors.email) {
                        trigger('email');
                      }
                    }}
                    onBlur={onBlur}
                    onFocus={() => {
                      scrollToInput(250);
                    }}
                    value={value}
                    placeholder="yellpay@email.com"
                    keyboardType="email-address"
                    placeholderTextColor={colors.line}
                    style={{
                      borderWidth: 1,
                      padding: 10,
                      borderRadius: 5,
                      paddingTop: 8,
                      marginBottom: errors.email ? 6 : 16,
                      marginTop: 4,
                      height: 48,
                      borderColor: errors.email ? colors.rd : colors.line,
                    }}
                  />
                )}
              />
              {errors.email && (
                <Text
                  sx={{
                    color: colors.wt,
                    ...textStyle.H_W3_13,
                    mb: 16,
                    px: 4,
                    py: 2,
                    borderRadius: 4,
                    backgroundColor: colors.rd,
                  }}
                >
                  {errors.email.message}
                </Text>
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
                          // Auto-focus to second field when 3 digits are entered
                          if (text.length === 3) {
                            postalCode2Ref.current?.focus();
                          }
                          // Only trigger validation if there are existing errors
                          if (
                            errors.postalCodePart1 ||
                            errors.postalCodePart2
                          ) {
                            trigger(['postalCodePart1', 'postalCodePart2']);
                          }
                        }}
                        onBlur={onBlur}
                        onFocus={() => {
                          scrollToInput(300);
                        }}
                        maxLength={3}
                        value={value}
                        placeholder="120"
                        keyboardType="numeric"
                        placeholderTextColor={colors.line}
                        style={{
                          borderWidth: 1,
                          padding: 10,
                          borderRadius: 5,
                          paddingTop: 8,
                          marginBottom:
                            errors.postalCodePart1 || errors.postalCodePart2
                              ? 6
                              : 16,
                          marginTop: 4,
                          height: 48,
                          width: 75,
                          borderColor:
                            errors.postalCodePart1 || errors.postalCodePart2
                              ? colors.rd
                              : colors.line,
                        }}
                      />
                    )}
                  />
                  <Divider
                    sx={{
                      height: 1,
                      mt:
                        errors.postalCodePart1 || errors.postalCodePart2
                          ? 0
                          : -8,
                      width: 11,
                      mx: 6,
                      backgroundColor: '#333333',
                    }}
                  />
                  <Controller
                    control={control}
                    name="postalCodePart2"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        ref={postalCode2Ref}
                        onChangeText={text => {
                          onChange(text);
                          // Auto-focus back to first field when all digits are removed
                          if (text.length === 0) {
                            postalCode1Ref.current?.focus();
                          }
                          // Only trigger validation if there are existing errors
                          if (
                            errors.postalCodePart1 ||
                            errors.postalCodePart2
                          ) {
                            trigger(['postalCodePart1', 'postalCodePart2']);
                          }
                        }}
                        onBlur={onBlur}
                        onFocus={() => {
                          scrollToInput(300);
                        }}
                        maxLength={4}
                        value={value}
                        placeholder="4567"
                        keyboardType="numeric"
                        placeholderTextColor={colors.line}
                        style={{
                          borderWidth: 1,
                          padding: 10,
                          borderRadius: 5,
                          paddingTop: 8,
                          marginBottom:
                            errors.postalCodePart2 || errors.postalCodePart1
                              ? 6
                              : 16,
                          marginTop: 4,
                          height: 48,
                          width: 96,
                          borderColor:
                            errors.postalCodePart2 || errors.postalCodePart1
                              ? colors.rd
                              : colors.line,
                        }}
                      />
                    )}
                  />
                </HStack>
                <Button
                  variant="outline"
                  borderColor={colors.rd}
                  sx={{
                    height: 48,
                    marginBottom:
                      errors.postalCodePart1 || errors.postalCodePart2 ? 4 : 16,
                  }}
                  onPress={handlePostalCodeSearch}
                >
                  <Text sx={{ color: colors.rd, ...textStyle.H_W6_14 }}>
                    住所検索
                  </Text>
                </Button>
              </HStack>
              {(errors.postalCodePart1 || errors.postalCodePart2) && (
                <Text
                  sx={{
                    color: colors.wt,
                    ...textStyle.H_W3_13,
                    mb: 16,
                    px: 4,
                    py: 2,
                    borderRadius: 4,
                    backgroundColor: colors.rd,
                  }}
                >
                  {errors.postalCodePart1?.message ||
                    errors.postalCodePart2?.message}
                </Text>
              )}

              <LabelWithRequired label="都道府県" required />
              <HStack position="relative" width={216}>
                <Controller
                  control={control}
                  name="prefecture"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onFocus={() => {
                        scrollToInput(350);
                      }}
                      value={value}
                      placeholder="東京都"
                      keyboardType="default"
                      placeholderTextColor={colors.line}
                      editable={false}
                      style={{
                        borderWidth: 1,
                        padding: 10,
                        borderRadius: 5,
                        paddingTop: 8,
                        marginBottom: errors.prefecture ? 6 : 16,
                        marginTop: 4,
                        width: 216,
                        height: 48,
                        borderColor: errors.prefecture
                          ? colors.rd
                          : colors.line,
                      }}
                    />
                  )}
                />
                <Ionicons
                  name="chevron-down"
                  size={24}
                  color={colors.line}
                  position="absolute"
                  right={10}
                  top={17}
                />
              </HStack>
              {errors.prefecture && (
                <Text
                  sx={{
                    color: colors.wt,
                    ...textStyle.H_W3_13,
                    mb: 16,
                    px: 4,
                    py: 2,
                    borderRadius: 4,
                    backgroundColor: colors.rd,
                  }}
                >
                  {errors.prefecture.message}
                </Text>
              )}

              <LabelWithRequired label="市区町村" required />
              <Controller
                control={control}
                name="city"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onFocus={() => {
                      scrollToInput(250);
                    }}
                    value={value}
                    placeholder="○○区"
                    editable={false}
                    keyboardType="default"
                    placeholderTextColor={colors.line}
                    style={{
                      borderWidth: 1,
                      padding: 10,
                      borderRadius: 5,
                      paddingTop: 8,
                      marginBottom: errors.city ? 6 : 16,
                      marginTop: 4,
                      height: 48,
                      borderColor: errors.city ? colors.rd : colors.line,
                    }}
                  />
                )}
              />
              {errors.city && (
                <Text
                  sx={{
                    color: colors.wt,
                    ...textStyle.H_W3_13,
                    mb: 16,
                    px: 4,
                    py: 2,
                    borderRadius: 4,
                    backgroundColor: colors.rd,
                  }}
                >
                  {errors.city.message}
                </Text>
              )}

              <LabelWithRequired label="番地" required />
              <Controller
                control={control}
                name="streetAddress"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    onChangeText={text => {
                      onChange(text);
                      // Only trigger validation if there are existing errors
                      if (errors.streetAddress) {
                        trigger('streetAddress');
                      }
                    }}
                    onBlur={onBlur}
                    onFocus={() => {
                      scrollToInput(300);
                    }}
                    value={value}
                    placeholder="１−１−１"
                    keyboardType="default"
                    placeholderTextColor={colors.line}
                    style={{
                      borderWidth: 1,
                      padding: 10,
                      borderRadius: 5,
                      paddingTop: 8,
                      marginBottom: errors.streetAddress ? 6 : 16,
                      marginTop: 4,
                      height: 48,
                      borderColor: errors.streetAddress
                        ? colors.rd
                        : colors.line,
                    }}
                  />
                )}
              />
              {errors.streetAddress && (
                <Text
                  sx={{
                    color: colors.wt,
                    ...textStyle.H_W3_13,
                    mb: 16,
                    px: 4,
                    py: 2,
                    borderRadius: 4,
                    backgroundColor: colors.rd,
                  }}
                >
                  {errors.streetAddress.message}
                </Text>
              )}

              <LabelWithRequired label="建物名" required={false} />
              <Controller
                control={control}
                name="building"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    onChangeText={text => {
                      onChange(text);
                      // Only trigger validation if there are existing errors
                      if (errors.building) {
                        trigger('building');
                      }
                    }}
                    onBlur={onBlur}
                    onFocus={() => {
                      scrollToInput(300);
                    }}
                    value={value}
                    keyboardType="default"
                    placeholderTextColor={colors.line}
                    style={{
                      borderWidth: 1,
                      padding: 10,
                      borderRadius: 5,
                      paddingTop: 8,
                      marginBottom: errors.building ? 6 : 16,
                      marginTop: 4,
                      height: 48,
                      borderColor: errors.building ? colors.rd : colors.line,
                    }}
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
                      // Only trigger validation if there are existing errors
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
                        borderRadius: 5,
                        padding: 5,
                        paddingTop: 8,
                        marginBottom: errors.work ? 6 : 16,
                        marginTop: 4,
                        borderColor: errors.work ? colors.rd : colors.line,
                      }}
                    >
                      <SelectInput placeholder="職業を選択してください" />
                      <SelectIcon className="mr-3" as={ChevronDownIcon} />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        <SelectItem label="UX Research" value="ux" />
                        <SelectItem label="Web Development" value="web" />
                        <SelectItem label="CPDP" value="cdp" />
                        <SelectItem
                          label="UI Designing"
                          value="ui"
                          isDisabled={true}
                        />
                        <SelectItem
                          label="Backend Development"
                          value="backend"
                        />
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                )}
              />
              {errors.work && (
                <Text
                  sx={{
                    color: colors.wt,
                    ...textStyle.H_W3_13,
                    mb: 16,
                    px: 4,
                    py: 2,
                    borderRadius: 4,
                    backgroundColor: colors.rd,
                  }}
                >
                  {errors.work.message}
                </Text>
              )}


              <LabelWithRequired label="招待コード" required={false} />
              <Controller
                control={control}
                name="referralCode"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    onChangeText={text => {
                      onChange(text);
                      // Only trigger validation if there are existing errors
                      if (errors.referralCode) {
                        trigger('referralCode');
                      }
                    }}
                    onBlur={onBlur}
                    onFocus={() => {
                      scrollToInput(300);
                    }}
                    value={value}
                    keyboardType="default"
                    placeholderTextColor={colors.line}
                    style={{
                      borderWidth: 1,
                      padding: 10,
                      borderRadius: 5,
                      paddingTop: 8,
                      marginBottom: errors.referralCode ? 6 : 16,
                      marginTop: 4,
                      height: 48,
                      borderColor: errors.referralCode
                        ? colors.rd
                        : colors.line,
                    }}
                  />
                )}
              />

              <Button
                mt={30}
                variant="solid"
                sx={{
                  borderColor: colors.rd,
                  backgroundColor: colors.rd,
                  borderRadius: 10,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  width: '100%',
                  height: 52,
                  boxShadow: '0px 0px 10px 0px #D5242A4F',
                }}
                onPress={handleSubmit(onSubmit as any)}
                isDisabled={isSubmitting}
              >
                <Text
                  sx={{
                    ...textStyle.H_W6_15,
                    color: colors.wt,
                  }}
                >
                  入力情報を確認
                </Text>
              </Button>
            </VStack>
          </VStack>
          <View style={{ position: 'absolute', bottom: 0, width: '100%' }}>
            <Indicator total={totalSteps} activeIndex={activeIndex} />
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default RegistrationForm;
