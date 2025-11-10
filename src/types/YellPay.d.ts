export interface AuthResponse {
  status: number;
}

export interface AuthApprovalResponse {
  status: number;
  userInfo?: string;
}

export interface PaymentResponse {
  uuid: string;
  userNo: number;
}

export interface ProductionConfig {
  authDomain: string;
  paymentDomain: string;
  serviceId: string;
  environmentMode: string;
}

export interface YellPayModule {
  // ===== CONFIGURATION METHODS =====

  /**
   * Get production environment configuration
   * @returns Promise that resolves to production config
   */
  getProductionConfig(): Promise<ProductionConfig>;

  // ===== AUTHENTICATION METHODS =====

  /**
   * Register authentication key - Shows GUI for key registration
   * @param domainName Server name (e.g., auth.unid.net)
   * @returns Promise that resolves to authentication status
   */
  authRegister(domainName: string): Promise<AuthResponse>;

  /**
   * Perform authentication - Shows GUI for authentication
   * @param domainName Server name (e.g., auth.unid.net)
   * @returns Promise that resolves to authentication status
   */
  authApproval(domainName: string): Promise<AuthResponse>;

  /**
   * Perform authentication with screen mode selection
   * @param domainName Server name (e.g., auth.unid.net)
   * @param isQrStart true: Start from QR reading screen, false: Start from sPin input screen
   * @returns Promise that resolves to authentication status
   */
  authApprovalWithMode(
    domainName: string,
    isQrStart: boolean
  ): Promise<AuthResponse>;

  /**
   * Launch URL scheme for authentication or key registration
   * @param urlType URL type
   * @param providerId Provider ID
   * @param waitingId Waiting ID
   * @param domainName Server name (e.g., auth.unid.net)
   * @returns Promise that resolves to authentication status
   */
  authUrlScheme(
    urlType: string,
    providerId: string,
    waitingId: string,
    domainName: string
  ): Promise<AuthResponse>;

  /**
   * Automatic key registration for unid authentication
   * @param serviceId Service ID
   * @param userInfo External service user identifier (safe for exposure)
   * @param domainName Server name (e.g., auth.unid.net)
   * @returns Promise that resolves to registration status
   */
  autoAuthRegister(
    serviceId: string,
    userInfo: string,
    domainName: string
  ): Promise<AuthResponse>;

  /**
   * Automatic unid authentication - Returns userInfo on success
   * @param serviceId Service ID
   * @param domainName Server name (e.g., auth.unid.net)
   * @returns Promise that resolves to authentication status and userInfo
   */
  autoAuthApproval(
    serviceId: string,
    domainName: string
  ): Promise<AuthApprovalResponse>;

  // ===== PAYMENT METHODS =====

  /**
   * Initialize user with service ID
   * @param serviceId The service identifier
   * @returns Promise that resolves to user ID
   */
  initUser(serviceId: string): Promise<string>;

  /**
   * Register a card for the user
   * @param uuid User unique identifier
   * @param userNo User number
   * @param payUserId Payment user identifier
   * @returns Promise that resolves to registration result
   */
  registerCard(
    uuid: string,
    userNo: number,
    payUserId: string
  ): Promise<PaymentResponse>;

  /**
   * Make a payment
   * @param uuid User unique identifier
   * @param userNo User number
   * @param payUserId Payment user identifier
   * @returns Promise that resolves to payment result
   */
  makePayment(
    uuid: string,
    userNo: number,
    payUserId: string
  ): Promise<PaymentResponse>;

  /**
   * Get payment history for user
   * @param userId User identifier
   * @returns Promise that resolves to payment history
   */
  getHistory(userId: string): Promise<string>;

  /**
   * Make payment using QR code - Opens camera for QR scanning
   * @param uuid User unique identifier
   * @param userNo User number
   * @param payUserId Payment user identifier
   * @returns Promise that resolves to payment result
   */
  paymentForQR(
    uuid: string,
    userNo: number,
    payUserId: string
  ): Promise<PaymentResponse>;

  /**
   * Show card selection interface
   * @param userId User identifier
   * @returns Promise that resolves to selected card result
   */
  cardSelect(userId: string): Promise<PaymentResponse>;

  /**
   * Get main credit card information
   * @returns Promise that resolves to main credit card info
   */
  getMainCreditCard(): Promise<string>;

  /**
   * Get user information
   * @param userId User identifier
   * @returns Promise that resolves to user information
   */
  getUserInfo(userId: string): Promise<string>;

  /**
   * View certificate information
   * @param userId User identifier
   * @returns Promise that resolves to certificate information
   */
  viewCertificate(userId: string): Promise<string>;

  /**
   * Get notifications
   * @param payUserId Payment user identifier
   * @param lastUpdate Last update timestamp
   * @returns Promise that resolves to notifications
   */
  getNotification(payUserId: string, lastUpdate: number): Promise<string>;

  /**
   * Get information
   * @param userId User identifier
   * @param infoType Type of information to retrieve
   * @returns Promise that resolves to information
   */
  getInformation(userId: string, infoType: number): Promise<string>;

  // ===== PRODUCTION CONVENIENCE METHODS =====

  /**
   * Register authentication key using production domain (auth.unid.net)
   * @returns Promise that resolves to authentication status
   */
  authRegisterProduction(): Promise<AuthResponse>;

  /**
   * Perform authentication using production domain (auth.unid.net)
   * @returns Promise that resolves to authentication status
   */
  authApprovalProduction(): Promise<AuthResponse>;

  /**
   * Automatic key registration using production config (yellpay service)
   * @param userInfo External service user identifier
   * @returns Promise that resolves to registration status
   */
  autoAuthRegisterProduction(userInfo: string): Promise<AuthResponse>;

  /**
   * Automatic authentication using production config (yellpay service)
   * @returns Promise that resolves to authentication status and userInfo
   */
  autoAuthApprovalProduction(): Promise<AuthApprovalResponse>;

  /**
   * Initialize user with production service ID (yellpay)
   * @returns Promise that resolves to user ID
   */
  initUserProduction(): Promise<string>;

  /**
   * Initialize user with your existing user ID (production)
   * @param userId Your existing user ID from backend/server
   * @returns Promise that resolves to the same user ID
   */
  initUserWithIdProduction(userId: string): Promise<string>;

  // ===== DEBUG/VALIDATION METHODS =====

  /**
   * Test basic React Native bridge connectivity
   * @returns Promise that resolves to bridge test result
   */
  testBridge(): Promise<{
    message: string;
    timestamp: string;
    success: boolean;
  }>;

  /**
   * Test simple method call
   * @returns Promise that resolves to simple test result
   */
  testSimpleMethod(): Promise<{
    message: string;
    timestamp: string;
  }>;

  /**
   * Test method with parameters
   * @param param1 First parameter
   * @param param2 Second parameter
   * @returns Promise that resolves to params test result
   */
  testMethodWithParams(
    param1: string,
    param2: number
  ): Promise<{
    message: string;
    param1: string;
    param2: number;
    timestamp: string;
  }>;

  /**
   * Test register card signature
   * @param uuid User UUID
   * @param userNo User number
   * @param payUserId Pay user ID
   * @returns Promise that resolves to signature test result
   */
  testRegisterCardSignature(
    uuid: string,
    userNo: number,
    payUserId: string
  ): Promise<{
    message: string;
    uuid: string;
    userNo: number;
    payUserId: string;
    timestamp: string;
  }>;

  /**
   * Test card registration with different method name
   * @param uuid User UUID
   * @param userNo User number
   * @param payUserId Pay user ID
   * @returns Promise that resolves to card registration result
   */
  addCard(
    uuid: string,
    userNo: number,
    payUserId: string
  ): Promise<{
    uuid: string;
    userNo: number;
    message: string;
  }>;

  /**
   * Test RouteCode SDK classes availability
   * @returns Promise that resolves to SDK classes test result
   */
  testRouteCodeSDKClasses(): Promise<{
    routePayClass?: string;
    routePayClassExists: boolean;
    routePayMethods?: string[];
    routePayError?: string;
    routeAuthClass?: string;
    routeAuthClassExists: boolean;
    routeAuthError?: string;
    environmentModeClass?: string;
    environmentModeClassExists: boolean;
    environmentModeError?: string;
    message: string;
  }>;

  /**
   * Test SDK method access and availability
   * @returns Promise that resolves to SDK method access test result
   */
  testSDKMethodAccess(): Promise<{
    routePayClass: string;
    availableMethods: string[];
    hasCardRegister: boolean;
    hasPayment: boolean;
    hasPaymentForQR: boolean;
    environmentModeClass: string;
    environmentValues: string[];
    message: string;
  }>;

  /**
   * Test basic SDK functionality
   * @returns Promise that resolves to basic test result
   */
  testBasicSDKCall(): Promise<{
    testResult: string;
    userId: string;
    message: string;
  }>;

  /**
   * Test card registration prerequisites
   * @param uuid User UUID from initUser
   * @returns Promise that resolves to prerequisite test result
   */
  testCardRegistrationPrerequisites(uuid: string): Promise<{
    uuid: string;
    hasActivity: boolean;
    hasValidUuid: boolean;
    authenticationWorking: boolean;
    certificateCount?: number;
    errorCode?: number;
    errorMessage?: string;
    message: string;
  }>;

  /**
   * Check if RouteCode framework is properly loaded
   * @returns Promise that resolves to framework availability status
   */
  checkFrameworkAvailability(): Promise<{
    available: boolean;
    routeAuth: string;
    routePay: string;
  }>;

  /**
   * Validate if authentication is properly completed
   * @returns Promise that resolves to authentication status
   */
  validateAuthenticationStatus(): Promise<{
    authenticated: boolean;
    status?: number;
    userInfo?: string;
    error?: string;
  }>;

  /**
   * Reset crash protection circuit breaker
   * @returns Promise that resolves to reset status
   */
  resetCrashProtection(): Promise<{
    reset: boolean;
    message: string;
  }>;

  /**
   * Get current crash protection status
   * @returns Promise that resolves to protection status
   */
  getCrashProtectionStatus(): Promise<{
    blockedOperations: string[];
    operationAttempts: { [key: string]: number };
  }>;
}

declare module 'react-native' {
  interface NativeModulesStatic {
    YellPay: YellPayModule;
  }
}
