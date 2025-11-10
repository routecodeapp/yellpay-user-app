/**
 * YellPay SDK Flow Validation Utility
 * Ensures proper flow: Auth → Init → Register Card → Payment
 */

import { Platform, Alert } from 'react-native';

export interface FlowValidationResult {
  isValid: boolean;
  errorMessage?: string;
  missingStep?: 'auth' | 'init' | 'card';
}

/**
 * Validates if the user can proceed with card registration
 * Requires: User Initialization (authentication is optional)
 */
export function validateCardRegistration(
  isAuthenticated: boolean,
  userId: string | null
): FlowValidationResult {
  // Authentication is optional - only check userId
  if (!userId) {
    return {
      isValid: false,
      errorMessage: Platform.OS === 'ios'
        ? 'ユーザー初期化が完了していません。\n\ninitUserProduction() を実行してください。'
        : 'User initialization required. Please call initUserProduction() first.',
      missingStep: 'init',
    };
  }

  return { isValid: true };
}

/**
 * Validates if the user can proceed with payment
 * Requires: User Initialization + Card Registration (authentication is optional)
 */
export function validatePayment(
  isAuthenticated: boolean,
  userId: string | null,
  isCardRegistered: boolean
): FlowValidationResult {
  // Authentication is optional - only check userId and card registration
  if (!userId) {
    return {
      isValid: false,
      errorMessage: Platform.OS === 'ios'
        ? 'ユーザー初期化が完了していません。\n\ninitUserProduction() を実行してください。'
        : 'User initialization required. Please call initUserProduction() first.',
      missingStep: 'init',
    };
  }

  if (!isCardRegistered) {
    return {
      isValid: false,
      errorMessage: Platform.OS === 'ios'
        ? 'カードが登録されていません。\n\nまずカードを登録してください。\nregisterCard() を実行してカード登録を完了してください。'
        : 'Card registration required. Please register a card first using registerCard().',
      missingStep: 'card',
    };
  }

  return { isValid: true };
}

/**
 * Shows an alert with flow validation error
 */
export function showFlowValidationError(result: FlowValidationResult) {
  if (result.errorMessage) {
    Alert.alert(
      Platform.OS === 'ios' ? 'エラー' : 'Error',
      result.errorMessage,
      [{ text: 'OK' }]
    );
  }
}

/**
 * Validates and shows error if flow is invalid
 * Returns true if valid, false otherwise
 */
export function validateAndShowError(
  result: FlowValidationResult
): boolean {
  if (!result.isValid) {
    showFlowValidationError(result);
    return false;
  }
  return true;
}

