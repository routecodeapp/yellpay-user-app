// src/screens/RegistrationScreen.tsx
import {
  Button,
  ButtonText,
  Heading,
  Input,
  VStack,
} from '@gluestack-ui/themed';
import React, { useState } from 'react';
import { useAppDispatch } from '../../src/redux/hooks';
import { setRegistration } from '../../src/redux/slice/auth/registrationSlice';

const RegistrationScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const onSubmit = () => {
    const fakeToken = `demo.${Math.random().toString(36).slice(2)}.token`;
    // Create a mock user object to match the new interface
    const mockUser = {
      name,
      furigana: '',
      phoneNumber: '',
      email,
      occupation: '',
      supportClassification: '',
      address: '',
      phone_verified: 'false',
      registration_complete: 'true',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    dispatch(setRegistration({ 
      name, 
      email, 
      token: fakeToken,
      user: mockUser,
    }));
  };

  return (
    <VStack flex={1} justifyContent="center" space="lg" p="$6">
      <Heading size="xl" textAlign="center">
        One-time Registration
      </Heading>
      <Input>
        <Input.Input placeholder="Name" value={name} onChangeText={setName} />
      </Input>
      <Input>
        <Input.Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
      </Input>
      <Button action="primary" onPress={onSubmit} isDisabled={!name || !email}>
        <ButtonText>Register</ButtonText>
      </Button>
    </VStack>
  );
};

export default RegistrationScreen;
