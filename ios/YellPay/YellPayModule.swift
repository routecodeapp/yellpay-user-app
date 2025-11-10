import Foundation
import React

// Export required methods for TurboModule interop
@objc(YellPayModule)
class YellPayModule: NSObject {
    @objc
    static func moduleName() -> String {
        return "YellPay"
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
}

// React Native method table for explicit export
@objc(YellPayBridge)
public class YellPayBridge: RCTEventEmitter {
    
    public override init() {
        super.init()
    }
    
    public override func supportedEvents() -> [String]! {
        return []
    }
    
    public override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    @objc
    public override func constantsToExport() -> [AnyHashable : Any]! {
        return YellPay.sharedInstance.constantsToExport()
    }
    
    // Bridge all YellPay methods
    @objc(makePayment:userNo:payUserId:resolver:rejecter:)
    func makePayment(_ uuid: String, userNo: NSNumber, payUserId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        YellPay.sharedInstance.makePayment(uuid, userNo: userNo, payUserId: payUserId, resolver: resolve, rejecter: reject)
    }
    
    @objc(registerCard:userNo:payUserId:resolver:rejecter:)
    func registerCard(_ uuid: String, userNo: NSNumber, payUserId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        YellPay.sharedInstance.registerCard(uuid, userNo: userNo, payUserId: payUserId, resolver: resolve, rejecter: reject)
    }
    
    @objc(paymentForQR:userNo:payUserId:resolver:rejecter:)
    func paymentForQR(_ uuid: String, userNo: NSNumber, payUserId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        YellPay.sharedInstance.paymentForQR(uuid, userNo: userNo, payUserId: payUserId, resolver: resolve, rejecter: reject)
    }
    
    // Other method forwards...
    @objc(getProductionConfig:rejecter:)
    func getProductionConfig(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        YellPay.sharedInstance.getProductionConfig(resolve, rejecter: reject)
    }
    
    @objc(authRegisterProduction:rejecter:)
    func authRegisterProduction(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        YellPay.sharedInstance.authRegisterProduction(resolve, rejecter: reject)
    }
    
    @objc(authApprovalProduction:rejecter:)
    func authApprovalProduction(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        YellPay.sharedInstance.authApprovalProduction(resolve, rejecter: reject)
    }
    
    @objc(autoAuthRegisterProduction:resolver:rejecter:)
    func autoAuthRegisterProduction(_ userInfo: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        YellPay.sharedInstance.autoAuthRegisterProduction(userInfo, resolver: resolve, rejecter: reject)
    }
    
    @objc(autoAuthApprovalProduction:rejecter:)
    func autoAuthApprovalProduction(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        YellPay.sharedInstance.autoAuthApprovalProduction(resolve, rejecter: reject)
    }
    
    @objc(initUserProduction:rejecter:)
    func initUserProduction(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        YellPay.sharedInstance.initUserProduction(resolve, rejecter: reject)
    }
    
    @objc(cardSelect:resolver:rejecter:)
    func cardSelect(_ userId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        YellPay.sharedInstance.cardSelect(userId, resolver: resolve, rejecter: reject)
    }
    
    @objc(getMainCreditCard:rejecter:)
    func getMainCreditCard(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        YellPay.sharedInstance.getMainCreditCard(resolve, rejecter: reject)
    }
    
    @objc(getHistory:resolver:rejecter:)
    func getHistory(_ userId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        YellPay.sharedInstance.getHistory(userId, resolver: resolve, rejecter: reject)
    }
    
    @objc(getUserInfo:resolver:rejecter:)
    func getUserInfo(_ userId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        YellPay.sharedInstance.getUserInfo(userId, resolver: resolve, rejecter: reject)
    }
    
    @objc(viewCertificate:resolver:rejecter:)
    func viewCertificate(_ userId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        YellPay.sharedInstance.viewCertificate(userId, resolver: resolve, rejecter: reject)
    }
    
    @objc(getNotification:lastUpdate:resolver:rejecter:)
    func getNotification(_ userId: String, lastUpdate: NSNumber, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        YellPay.sharedInstance.getNotification(userId, lastUpdate: lastUpdate, resolver: resolve, rejecter: reject)
    }
    
    @objc(getInformation:infoType:resolver:rejecter:)
    func getInformation(_ userId: String, infoType: NSNumber, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        YellPay.sharedInstance.getInformation(userId, infoType: infoType, resolver: resolve, rejecter: reject)
    }
}

@objc(YellPay)
class YellPay: NSObject {
    
    static let sharedInstance = YellPay()
    
    private override init() {
        super.init()
    }
    
    // Circuit breaker for crash protection
    private static var crashedOperations: Set<String> = []
    private static var operationAttempts: [String: Int] = [:]
    private static let maxAttempts = 3
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    // Circuit breaker implementation
    private func isOperationBlocked(_ operationName: String) -> Bool {
        return YellPay.crashedOperations.contains(operationName)
    }
    
    private func incrementAttempt(_ operationName: String) {
        YellPay.operationAttempts[operationName] = (YellPay.operationAttempts[operationName] ?? 0) + 1
    }
    
    private func blockOperation(_ operationName: String) {
        YellPay.crashedOperations.insert(operationName)
        print("💥 Operation \(operationName) blocked due to repeated failures")
    }
    
    private func shouldBlockOperation(_ operationName: String) -> Bool {
        let attempts = YellPay.operationAttempts[operationName] ?? 0
        return attempts >= YellPay.maxAttempts
    }
    
    // Basic input sanitization to avoid SDK crashes on unexpected strings
    private func sanitize(_ value: String, maxLength: Int = 256, allowed: CharacterSet? = nil) -> String {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        let characterSet = allowed ?? {
            var set = CharacterSet.alphanumerics
            set.insert(charactersIn: ".-_:@")
            return set
        }()
        let filteredScalars = trimmed.unicodeScalars.filter { characterSet.contains($0) }
        let filtered = String(String.UnicodeScalarView(filteredScalars))
        return String(filtered.prefix(maxLength))
    }
    
    // For new React Native architecture compatibility
    @objc
    func constantsToExport() -> [String: Any]! {
        return [
            "AUTH_DOMAIN": YellPay.AUTH_DOMAIN,
            "PAYMENT_DOMAIN": YellPay.PAYMENT_DOMAIN,
            "SERVICE_ID": YellPay.SERVICE_ID
        ]
    }
    
    // Ensure methods are properly queued on main thread
    @objc
    static func methodQueue() -> DispatchQueue {
        return DispatchQueue.main
    }
    
    // MARK: - Production Configuration Constants
    static let AUTH_DOMAIN = "auth.unid.net"
    static let PAYMENT_DOMAIN = "dev-pay.unid.net"
    static let SERVICE_ID = "yellpay"
    
    // MARK: - Configuration Methods
    
    @objc
    func getProductionConfig(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let config: [String: Any] = [
            "authDomain": YellPay.AUTH_DOMAIN,
            "paymentDomain": YellPay.PAYMENT_DOMAIN,
            "serviceId": YellPay.SERVICE_ID,
            "environmentMode": "Production"
        ]
        resolve(config)
    }
    
    // MARK: - Authentication Methods
    
    @objc
    func authRegister(_ domainName: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        print("🔥 YellPay.authRegister START - domainName: \(domainName)")
        
        let safeDomain = sanitize(domainName, maxLength: 128)
        guard !safeDomain.isEmpty else {
            reject("AUTH_REGISTER_ERROR", "Domain name cannot be empty", nil)
            return
        }
        
        DispatchQueue.main.async {
            print("🔥 YellPay.authRegister - On main thread")
            
            guard let viewController = self.getCurrentViewController() else {
                print("❌ YellPay.authRegister - No safe view controller available")
                reject("AUTH_REGISTER_ERROR", "View controller is busy or not ready. Please try again after any modal dialogs are dismissed.", nil)
                return
            }
            
            print("✅ YellPay.authRegister - Got view controller, calling RouteAuth.callRegister")
            
            // Add timeout handling with proper cleanup
            let timeoutTimer = DispatchSource.makeTimerSource(queue: DispatchQueue.main)
            var isCompleted = false
            
            timeoutTimer.schedule(deadline: .now() + 60) // Increased timeout for user interaction
            timeoutTimer.setEventHandler {
                guard !isCompleted else { return }
                isCompleted = true
                timeoutTimer.cancel()
                print("⏰ YellPay.authRegister - Operation timed out")
                reject("AUTH_REGISTER_ERROR", "Authentication registration timed out. Please try again.", nil)
            }
            timeoutTimer.resume()
            
            do {
                RouteAuth.callRegister(
                    viewController,
                    domainName: safeDomain,
                    callSuccess: { status in
                        guard !isCompleted else { return }
                        isCompleted = true
                        timeoutTimer.cancel()
                        print("✅ YellPay.authRegister - Success: status=\(status)")
                        resolve([
                            "status": status,
                            "message": "Authentication key registered successfully. Please proceed with approval."
                        ])
                    },
                    callFailed: { status, error in
                        guard !isCompleted else { return }
                        isCompleted = true
                        timeoutTimer.cancel()
                        let errorMsg = error?.localizedDescription ?? "Unknown error"
                        print("❌ YellPay.authRegister - Failed: status=\(status), error=\(errorMsg)")
                        
                        // Provide helpful error messages
                        if errorMsg.contains("cancelled") || errorMsg.contains("canceled") {
                            reject("AUTH_REGISTER_ERROR", "Authentication registration was cancelled by user. Please try again and complete the registration process.", error)
                        } else {
                            reject("AUTH_REGISTER_ERROR", "Authentication registration failed (Status: \(status)): \(errorMsg). Please ensure you complete the entire registration process.", error)
                        }
                    }
                )
            } catch {
                guard !isCompleted else { return }
                isCompleted = true
                timeoutTimer.cancel()
                print("💥 YellPay.authRegister - Exception: \(error)")
                reject("AUTH_REGISTER_ERROR", "Failed to start authentication registration: \(error.localizedDescription)", error)
            }
        }
    }
    
    @objc
    func authApproval(_ domainName: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        print("🔥 YellPay.authApproval START - domainName: \(domainName)")
        
        let safeDomain = sanitize(domainName, maxLength: 128)
        guard !safeDomain.isEmpty else {
            reject("AUTH_APPROVAL_ERROR", "Domain name cannot be empty", nil)
            return
        }
        
        DispatchQueue.main.async {
            print("🔥 YellPay.authApproval - On main thread")
            
            guard let viewController = self.getCurrentViewController() else {
                print("❌ YellPay.authApproval - No safe view controller available")
                reject("AUTH_APPROVAL_ERROR", "View controller is busy or not ready. Please try again after any modal dialogs are dismissed.", nil)
                return
            }
            
            print("✅ YellPay.authApproval - Got view controller, calling RouteAuth.callApprovalViewController")
            
            do {
                RouteAuth.callApprovalViewController(
                    viewController,
                    domainName: safeDomain,
                    callSuccess: { status in
                        print("✅ YellPay.authApproval - Success: status=\(status)")
                        resolve([
                            "status": status,
                            "message": "Authentication approval completed successfully."
                        ])
                    },
                    callFailed: { status, error in
                        let errorMsg = error?.localizedDescription ?? "Unknown error"
                        print("❌ YellPay.authApproval - Failed: status=\(status), error=\(errorMsg)")
                        
                        // Check for specific error conditions
                        if errorMsg.contains("key is missing") || errorMsg.contains("register") {
                            reject("AUTH_APPROVAL_ERROR", "Authentication key not found. Please complete authentication registration first before approval. Error: \(errorMsg)", error)
                        } else if errorMsg.contains("cancelled") || errorMsg.contains("canceled") {
                            reject("AUTH_APPROVAL_ERROR", "Authentication approval was cancelled by user. Please try again.", error)
                        } else {
                            reject("AUTH_APPROVAL_ERROR", "Authentication approval failed (Status: \(status)): \(errorMsg)", error)
                        }
                    }
                )
            } catch {
                print("💥 YellPay.authApproval - Exception: \(error)")
                reject("AUTH_APPROVAL_ERROR", "Failed to start authentication approval: \(error.localizedDescription)", error)
            }
        }
    }
    
    @objc
    func authApprovalWithMode(_ domainName: String, isQrStart: Bool, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            guard let viewController = self.getCurrentViewController() else {
                reject("AUTH_APPROVAL_ERROR", "No view controller available", nil)
                return
            }
            
            let safeDomain = self.sanitize(domainName, maxLength: 128)
            guard !safeDomain.isEmpty else {
                reject("AUTH_APPROVAL_ERROR", "Domain name cannot be empty", nil)
                return
            }

            // Fallback to regular approval (SDK may not support isQrStart on iOS)
            RouteAuth.callApprovalViewController(
                viewController,
                domainName: safeDomain,
                callSuccess: { status in
                    resolve(["status": status])
                },
                callFailed: { status, error in
                    reject("AUTH_APPROVAL_ERROR", "Error \(status): \(error?.localizedDescription ?? "Unknown error")", error)
                }
            )
        }
    }
    
    @objc
    func authUrlScheme(_ urlType: String, providerId: String, waitingId: String, domainName: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            guard let viewController = self.getCurrentViewController() else {
                reject("AUTH_URL_SCHEME_ERROR", "No view controller available", nil)
                return
            }
            
            let safeDomain = self.sanitize(domainName, maxLength: 128)
            let safeProvider = self.sanitize(providerId)
            let safeWaiting = self.sanitize(waitingId)
            let urlTypeInt = Int(self.sanitize(urlType, allowed: .decimalDigits)) ?? 0

            RouteAuth.callUrlSchemeUrlType(
                urlTypeInt,
                providerId: safeProvider,
                waitingId: safeWaiting,
                viewController: viewController,
                domainName: safeDomain,
                callSuccess: { status in
                    resolve(["status": status])
                },
                callFailed: { status, error in
                    let message = error?.localizedDescription ?? "Unknown error"
                    reject("AUTH_URL_SCHEME_ERROR", "Error \(status): \(message)", error)
                }
            )
        }
    }
    
    @objc
    func autoAuthRegister(_ serviceId: String, userInfo: String, domainName: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            let safeServiceId = self.sanitize(serviceId)
            let safeUserInfo = self.sanitize(userInfo)
            let safeDomain = self.sanitize(domainName, maxLength: 128)
            guard !safeServiceId.isEmpty, !safeDomain.isEmpty else {
                reject("AUTO_AUTH_REGISTER_ERROR", "ServiceId and domainName are required", nil)
                return
            }
            RouteAuth.callAutoAuthRegisterDomainName(
                safeDomain,
                serviceId: safeServiceId,
                userInfo: safeUserInfo,
                callSuccess: { status in
                    resolve(["status": status])
                },
                callFailed: { status, error in
                    reject("AUTO_AUTH_REGISTER_ERROR", "Error \(status): \(error?.localizedDescription ?? "Unknown error")", error)
                }
            )
        }
    }
    
    @objc
    func autoAuthApproval(_ serviceId: String, domainName: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            let safeServiceId = self.sanitize(serviceId)
            let safeDomain = self.sanitize(domainName, maxLength: 128)
            guard !safeServiceId.isEmpty, !safeDomain.isEmpty else {
                reject("AUTO_AUTH_APPROVAL_ERROR", "ServiceId and domainName are required", nil)
                return
            }
            RouteAuth.callAutoAuthApprovalDomainName(
                safeDomain,
                serviceId: safeServiceId,
                callSuccess: { status, userInfo in
                    resolve([
                        "status": status,
                        "userInfo": userInfo
                    ])
                },
                callFailed: { status, error in
                    // Improve error for missing auth key
                    let message = (error?.localizedDescription ?? "Unknown error")
                    if message.lowercased().contains("missing") || message.lowercased().contains("登録") {
                        reject("AUTO_AUTH_APPROVAL_ERROR", "Authentication key is missing. Please run authRegister and authApproval first.", error)
                    } else {
                        reject("AUTO_AUTH_APPROVAL_ERROR", "Error \(status): \(message)", error)
                    }
                }
            )
        }
    }
    
    // MARK: - Production Authentication Convenience Methods
    
    @objc
    func authRegisterProduction(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        authRegister(YellPay.AUTH_DOMAIN, resolver: resolve, rejecter: reject)
    }
    
    @objc
    func authApprovalProduction(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        authApproval(YellPay.AUTH_DOMAIN, resolver: resolve, rejecter: reject)
    }
    
    @objc
    func autoAuthRegisterProduction(_ userInfo: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        autoAuthRegister(YellPay.SERVICE_ID, userInfo: userInfo, domainName: YellPay.AUTH_DOMAIN, resolver: resolve, rejecter: reject)
    }
    
    @objc
    func autoAuthApprovalProduction(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        autoAuthApproval(YellPay.SERVICE_ID, domainName: YellPay.AUTH_DOMAIN, resolver: resolve, rejecter: reject)
    }
    
    // MARK: - Payment Methods
    
    @objc
    func initUser(_ serviceId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        print("🔥 YellPay.initUser START - serviceId: \(serviceId)")
        
        // Validate input
        guard !serviceId.isEmpty else {
            reject("INIT_ERROR", "ServiceId cannot be empty", nil)
            return
        }
        
        // Simplify by removing nested validation to prevent threading issues
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                reject("INIT_ERROR", "Module deallocated", nil)
                return
            }
            
            print("🔥 YellPay.initUser - On main thread")
            
            guard let viewController = self.getCurrentViewController() else {
                print("❌ YellPay.initUser - No safe view controller available")
                reject("INIT_ERROR", "View controller is busy or not ready. Please try again after any modal dialogs are dismissed.", nil)
                return
            }
            
            print("✅ YellPay.initUser - Got view controller, calling RoutePay.callInitialUserIdServiceId")
            
            // Use autoreleasepool to manage memory
            autoreleasepool {
                do {
                    // Use the version with environmentMode for production
                    RoutePay.callInitialUserIdServiceId(
                        serviceId,
                        environmentMode: EnvironmentModeEnum.production,
                        callSuccess: { [weak self] userId in
                            guard self != nil else { return }
                            print("✅ YellPay.initUser - Success: \(userId)")
                            
                            // Validate the returned userId
                            guard let userIdString = userId as? String, !userIdString.isEmpty else {
                                reject("INIT_ERROR", "Invalid userId returned from SDK", nil)
                                return
                            }
                            
                            resolve(userIdString)
                        },
                        callFailed: { [weak self] errorCode, errorMessage in
                            guard self != nil else { return }
                            let errorMsg = "Init failed - Code: \(errorCode), Message: \(errorMessage)"
                            print("❌ YellPay.initUser - \(errorMsg)")
                            
                            // Provide more helpful error messages for common issues
                            if errorCode == -100 || errorCode == -101 {
                                reject("INIT_ERROR", "Authentication required. Please complete the full authentication flow first. Error: \(errorMsg)", nil)
                            } else {
                                reject("INIT_ERROR", errorMsg, nil)
                            }
                        }
                    )
                } catch {
                    print("💥 YellPay.initUser - Exception: \(error)")
                    reject("INIT_ERROR", "SDK call failed: \(error.localizedDescription)", error)
                }
            }
        }
    }
    
    @objc
    func initUserProduction(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        initUser(YellPay.SERVICE_ID, resolver: resolve, rejecter: reject)
    }
    
    func registerCard(_ uuid: String, userNo: NSNumber, payUserId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        print("🔥 YellPay.registerCard START - uuid: \(uuid), userNo: \(userNo), payUserId: \(payUserId)")
        
        // Validate inputs
        let safeUuid = sanitize(uuid)
        let safePayUserId = sanitize(payUserId)
        guard !safeUuid.isEmpty else {
            reject("REGISTER_ERROR", "UUID cannot be empty. Please initialize user first with initUser().", nil)
            return
        }
        guard !safePayUserId.isEmpty else {
            reject("REGISTER_ERROR", "payUserId cannot be empty.", nil)
            return
        }
        
        DispatchQueue.main.async {
            print("🔥 YellPay.registerCard - On main thread")
            
            guard let viewController = self.getCurrentViewController() else {
                print("❌ YellPay.registerCard - No safe view controller available")
                reject("REGISTER_ERROR", "View controller is busy or not ready. Please try again after any modal dialogs are dismissed.", nil)
                return
            }
            
            print("✅ YellPay.registerCard - Got view controller, calling RoutePay.callCardRegisterUuid")
            
            // Add timeout protection
            var isCompleted = false
            let timeoutWorkItem = DispatchWorkItem { [weak self] in
                guard !isCompleted, let self = self else { return }
                isCompleted = true
                print("⏰ YellPay.registerCard - Operation timed out")
                reject("REGISTER_TIMEOUT", "Card registration timed out. Please try again.", nil)
            }
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 30, execute: timeoutWorkItem)
            
            do {
                // Verify we're on main thread before SDK call
                assert(Thread.isMainThread, "registerCard must be called on main thread")
                
                // Use the version with environmentMode for production environment
                RoutePay.callCardRegisterUuid(
                    safeUuid,
                    userNo: userNo.intValue,
                    payUserId: safePayUserId,
                    viewController: viewController,
                    environmentMode: EnvironmentModeEnum.production,
                    callSuccess: { uuid, userNo in
                        // SDK may call from background thread - ensure we're on main thread
                        if Thread.isMainThread {
                            guard !isCompleted else { return }
                            isCompleted = true
                            timeoutWorkItem.cancel()
                            print("✅ YellPay.registerCard - Success: uuid=\(String(describing: uuid)), userNo=\(userNo)")
                            resolve([
                                "uuid": uuid ?? "",
                                "userNo": userNo
                            ])
                        } else {
                            DispatchQueue.main.async {
                                guard !isCompleted else { return }
                                isCompleted = true
                                timeoutWorkItem.cancel()
                                print("✅ YellPay.registerCard - Success: uuid=\(String(describing: uuid)), userNo=\(userNo)")
                                resolve([
                                    "uuid": uuid ?? "",
                                    "userNo": userNo
                                ])
                            }
                        }
                    },
                    callFailed: { errorCode, errorMessage in
                        // SDK may call from background thread - ensure we're on main thread
                        if Thread.isMainThread {
                            guard !isCompleted else { return }
                            isCompleted = true
                            timeoutWorkItem.cancel()
                        
                            print("❌ YellPay.registerCard - Failed: Code=\(errorCode), Message=\(errorMessage)")
                            
                            // Handle specific error codes with appropriate messages
                            var errorCodeString: String = "CARD_REGISTER_ERROR"
                            var errorDescription: String = String(describing: errorMessage)
                            
                            switch errorCode {
                            case -100, -101:
                                errorCodeString = "AUTHENTICATION_ERROR"
                                errorDescription = "Authentication required. Please complete authentication and user initialization first. (\(String(describing: errorMessage)))"
                            case -200:
                                errorCodeString = "INVALID_PARAMETERS"
                                errorDescription = "Invalid parameters provided. Please check your input. (\(String(describing: errorMessage)))"
                            case -300:
                                errorCodeString = "NETWORK_ERROR"
                                errorDescription = "Network error occurred. Please check your connection and try again. (\(String(describing: errorMessage)))"
                            case -400:
                                errorCodeString = "CARD_ALREADY_REGISTERED"
                                errorDescription = "Card is already registered. (\(String(describing: errorMessage)))"
                            case -500:
                                errorCodeString = "CARD_REGISTRATION_FAILED"
                                errorDescription = "Card registration failed. Please try again. (\(String(describing: errorMessage)))"
                            default:
                                // For unknown error codes, use the original message from SDK
                                // This preserves Japanese error messages from the SDK
                                errorDescription = String(describing: errorMessage)
                            }
                            
                            // If the error message contains Japanese text, preserve it
                            let errorMessageString = String(describing: errorMessage)
                            if errorMessageString.contains("登録") || errorMessageString.contains("失敗") || errorMessageString.contains("再登録") || errorMessageString.contains("最初から") {
                                errorDescription = errorMessageString
                            }
                            
                            reject(errorCodeString, errorDescription, nil)
                        } else {
                            DispatchQueue.main.async {
                                guard !isCompleted else { return }
                                isCompleted = true
                                timeoutWorkItem.cancel()
                                
                                print("❌ YellPay.registerCard - Failed: Code=\(errorCode), Message=\(errorMessage)")
                                
                                // Handle specific error codes with appropriate messages
                                var errorCodeString: String = "CARD_REGISTER_ERROR"
                                var errorDescription: String = String(describing: errorMessage)
                                
                                switch errorCode {
                                case -100, -101:
                                    errorCodeString = "AUTHENTICATION_ERROR"
                                    errorDescription = "Authentication required. Please complete authentication and user initialization first. (\(String(describing: errorMessage)))"
                                case -200:
                                    errorCodeString = "INVALID_PARAMETERS"
                                    errorDescription = "Invalid parameters provided. Please check your input. (\(String(describing: errorMessage)))"
                                case -300:
                                    errorCodeString = "NETWORK_ERROR"
                                    errorDescription = "Network error occurred. Please check your connection and try again. (\(String(describing: errorMessage)))"
                                case -400:
                                    errorCodeString = "CARD_ALREADY_REGISTERED"
                                    errorDescription = "Card is already registered. (\(String(describing: errorMessage)))"
                                case -500:
                                    errorCodeString = "CARD_REGISTRATION_FAILED"
                                    errorDescription = "Card registration failed. Please try again. (\(String(describing: errorMessage)))"
                                default:
                                    errorDescription = String(describing: errorMessage)
                                }
                                
                                let errorMessageString = String(describing: errorMessage)
                                if errorMessageString.contains("登録") || errorMessageString.contains("失敗") || errorMessageString.contains("再登録") || errorMessageString.contains("最初から") {
                                    errorDescription = errorMessageString
                                }
                                
                                reject(errorCodeString, errorDescription, nil)
                            }
                        }
                    }
                )
            } catch {
                guard !isCompleted else { return }
                isCompleted = true
                timeoutWorkItem.cancel()
                print("💥 YellPay.registerCard - Exception: \(error)")
                reject("REGISTER_EXCEPTION", "SDK call failed: \(error.localizedDescription)", error)
            }
        }
    }
    
    func makePayment(_ uuid: String, userNo: NSNumber, payUserId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        print("🔥 YellPay.makePayment START - uuid: \(uuid), userNo: \(userNo), payUserId: \(payUserId)")
        
        // Validate input parameters
        let safeUuid = sanitize(uuid)
        let safePayUserId = sanitize(payUserId)
        guard !safeUuid.isEmpty else {
            reject("PAYMENT_ERROR", "Invalid uuid: cannot be empty", nil)
            return
        }
        guard !safePayUserId.isEmpty else {
            reject("PAYMENT_ERROR", "Invalid payUserId: cannot be empty", nil)
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                reject("PAYMENT_ERROR", "Module deallocated", nil)
                return
            }
            
            print("🔥 YellPay.makePayment - On main thread")
            
            guard let viewController = self.getCurrentViewController() else {
                print("❌ YellPay.makePayment - No safe view controller available")
                reject("PAYMENT_ERROR", "View controller is busy or not ready. Please try again after any modal dialogs are dismissed.", nil)
                return
            }
            
            print("✅ YellPay.makePayment - Got view controller: \(viewController)")
            
            self.enforceLightMode(on: viewController.view.window)
            
            // Simplified timeout handling
            var isCompleted = false
            let timeoutWorkItem = DispatchWorkItem { [weak self] in
                guard !isCompleted, self != nil else { return }
                isCompleted = true
                print("⏰ YellPay.makePayment - Payment timed out")
                reject("PAYMENT_ERROR", "Payment operation timed out", nil)
            }
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 60, execute: timeoutWorkItem)
            
            autoreleasepool {
                do {
                    // Verify we're on main thread before SDK call
                    assert(Thread.isMainThread, "makePayment must be called on main thread")
                    
                    print("🔥 YellPay.makePayment - Calling RoutePay.callPaymentUuid")
                    // Use the correct SDK method name according to documentation
                    // This version includes payUserId and requires environmentMode
                    RoutePay.callPaymentUuid(
                        safeUuid,
                        userNo: userNo.intValue,
                        payUserId: safePayUserId,
                        viewController: viewController,
                        environmentMode: EnvironmentModeEnum.production,
                        callSuccess: { [weak self] uuid, userNo in
                            // SDK may call from background thread - ensure we're on main thread
                            if Thread.isMainThread {
                                guard !isCompleted, self != nil else { return }
                                isCompleted = true
                                timeoutWorkItem.cancel()
                                print("✅ YellPay: Payment successful - uuid: \(String(describing: uuid)), userNo: \(userNo)")
                                resolve([
                                    "uuid": uuid ?? "",
                                    "userNo": userNo
                                ])
                            } else {
                                DispatchQueue.main.async {
                                    guard !isCompleted, self != nil else { return }
                                    isCompleted = true
                                    timeoutWorkItem.cancel()
                                    print("✅ YellPay: Payment successful - uuid: \(String(describing: uuid)), userNo: \(userNo)")
                                    resolve([
                                        "uuid": uuid ?? "",
                                        "userNo": userNo
                                    ])
                                }
                            }
                        },
                        callFailed: { [weak self] errorCode, errorMessage in
                            // SDK may call from background thread - ensure we're on main thread
                            if Thread.isMainThread {
                                guard !isCompleted, self != nil else { return }
                                isCompleted = true
                                timeoutWorkItem.cancel()
                                print("❌ YellPay: Payment failed - errorCode: \(errorCode), message: \(errorMessage)")
                                
                                // Handle specific error codes with appropriate messages
                                var errorCodeString: String = "PAYMENT_ERROR"
                                var errorDescription: String = String(describing: errorMessage)
                                
                                switch errorCode {
                                case -100, -101:
                                    errorCodeString = "AUTHENTICATION_ERROR"
                                    errorDescription = "Authentication required. Please complete authentication first. (\(String(describing: errorMessage)))"
                                case -200:
                                    errorCodeString = "INVALID_PARAMETERS"
                                    errorDescription = "Invalid parameters provided. Please check your input. (\(String(describing: errorMessage)))"
                                case -300:
                                    errorCodeString = "NETWORK_ERROR"
                                    errorDescription = "Network error occurred. Please check your connection and try again. (\(String(describing: errorMessage)))"
                                case -400:
                                    errorCodeString = "CARD_NOT_REGISTERED"
                                    errorDescription = "Card not registered. Please register a card first. (\(String(describing: errorMessage)))"
                                case -500:
                                    errorCodeString = "PAYMENT_FAILED"
                                    errorDescription = "Payment failed. Please try again. (\(String(describing: errorMessage)))"
                                default:
                                    // For unknown error codes, use the original message from SDK
                                    // This preserves Japanese error messages from the SDK
                                    errorDescription = String(describing: errorMessage)
                                }
                                
                                // If the error message contains Japanese text, preserve it
                                let errorMessageString = String(describing: errorMessage)
                                if errorMessageString.contains("支払い") || errorMessageString.contains("失敗") || errorMessageString.contains("エラー") || errorMessageString.contains("登録") {
                                    errorDescription = errorMessageString
                                }
                                
                                reject(errorCodeString, errorDescription, nil)
                            } else {
                                DispatchQueue.main.async {
                                    guard !isCompleted, self != nil else { return }
                                    isCompleted = true
                                    timeoutWorkItem.cancel()
                                    print("❌ YellPay: Payment failed - errorCode: \(errorCode), message: \(errorMessage)")
                                    
                                    var errorCodeString: String = "PAYMENT_ERROR"
                                    var errorDescription: String = String(describing: errorMessage)
                                    
                                    switch errorCode {
                                    case -100, -101:
                                        errorCodeString = "AUTHENTICATION_ERROR"
                                        errorDescription = "Authentication required. Please complete authentication first. (\(String(describing: errorMessage)))"
                                    case -200:
                                        errorCodeString = "INVALID_PARAMETERS"
                                        errorDescription = "Invalid parameters provided. Please check your input. (\(String(describing: errorMessage)))"
                                    case -300:
                                        errorCodeString = "NETWORK_ERROR"
                                        errorDescription = "Network error occurred. Please check your connection and try again. (\(String(describing: errorMessage)))"
                                    case -400:
                                        errorCodeString = "CARD_NOT_REGISTERED"
                                        errorDescription = "Card not registered. Please register a card first. (\(String(describing: errorMessage)))"
                                    case -500:
                                        errorCodeString = "PAYMENT_FAILED"
                                        errorDescription = "Payment failed. Please try again. (\(String(describing: errorMessage)))"
                                    default:
                                        errorDescription = String(describing: errorMessage)
                                    }
                                    
                                    let errorMessageString = String(describing: errorMessage)
                                    if errorMessageString.contains("支払い") || errorMessageString.contains("失敗") || errorMessageString.contains("エラー") || errorMessageString.contains("登録") {
                                        errorDescription = errorMessageString
                                    }
                                    
                                    reject(errorCodeString, errorDescription, nil)
                                }
                            }
                        }
                    )
                } catch {
                    guard !isCompleted else { return }
                    isCompleted = true
                    timeoutWorkItem.cancel()
                    print("💥 YellPay: Payment crashed - error: \(error)")
                    reject("PAYMENT_ERROR", "Payment method crashed: \(error.localizedDescription)", error)
                }
            }
        }
    }
    
    func paymentForQR(_ uuid: String, userNo: NSNumber, payUserId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            guard let viewController = self.getCurrentViewController() else {
                reject("QR_PAYMENT_ERROR", "No view controller available", nil)
                return
            }
            
            let safeUuid = self.sanitize(uuid)
            let safePayUserId = self.sanitize(payUserId)
            guard !safeUuid.isEmpty, !safePayUserId.isEmpty else {
                reject("QR_PAYMENT_ERROR", "Invalid parameters", nil)
                return
            }

            self.enforceLightMode(on: viewController.view.window)
            
            // Verify we're on main thread before SDK call
            assert(Thread.isMainThread, "paymentForQR must be called on main thread")
            
            // Use the renamed SDK method for QR payment with environmentMode
            // callPaymentForQRUuid has been renamed to callPayment(forQRUuid:...)
            RoutePay.callPayment(
                forQRUuid: safeUuid,
                userNo: userNo.intValue,
                payUserId: safePayUserId,
                viewController: viewController,
                environmentMode: EnvironmentModeEnum.production,
                callSuccess: { resultUuid, resultUserNo in
                    // SDK may call from background thread - ensure we're on main thread
                    if Thread.isMainThread {
                        resolve([
                            "uuid": resultUuid ?? "",
                            "userNo": resultUserNo
                        ])
                    } else {
                        DispatchQueue.main.async {
                            resolve([
                                "uuid": resultUuid ?? "",
                                "userNo": resultUserNo
                            ])
                        }
                    }
                },
                callFailed: { status, error in
                    // SDK may call from background thread - ensure we're on main thread
                    if Thread.isMainThread {
                        let errorMessage = error?.localizedDescription ?? "Unknown error"
                        reject("QR_PAYMENT_ERROR", "Error \(status): \(errorMessage)", error)
                    } else {
                        DispatchQueue.main.async {
                            let errorMessage = error?.localizedDescription ?? "Unknown error"
                            reject("QR_PAYMENT_ERROR", "Error \(status): \(errorMessage)", error)
                        }
                    }
                }
            )
        }
    }
    
    @objc
    func getHistory(_ userId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let operationKey = "getHistory"
        guard !YellPay.crashedOperations.contains(operationKey) else {
            reject("GET_HISTORY_CIRCUIT_BREAKER", "Get history operation has failed too many times", nil)
            return
        }
        
        // Input validation
        let safeUserId = sanitize(userId)
        guard !safeUserId.isEmpty else {
            reject("GET_HISTORY_ERROR", "userId cannot be empty", nil)
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                reject("GET_HISTORY_ERROR", "Module deallocated", nil)
                return
            }
            
            guard let viewController = self.getCurrentViewController() else {
                reject("GET_HISTORY_ERROR", "No view controller available", nil)
                return
            }
            
            var isCompleted = false
            let timeoutWorkItem = DispatchWorkItem { [weak self] in
                guard !isCompleted, let self = self else { return }
                isCompleted = true
                print("⏰ YellPay.getHistory - Operation timed out")
                
                if self.shouldBlockOperation(operationKey) {
                    self.blockOperation(operationKey)
                }
                
                reject("GET_HISTORY_TIMEOUT", "Get history operation timed out", nil)
            }
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 30, execute: timeoutWorkItem)
            
            autoreleasepool {
                do {
                    RoutePay.callHistoryUserId(
                        safeUserId,
                        viewController: viewController,
                        callSuccess: { [weak self] history in
                            guard !isCompleted, let self = self else { return }
                            isCompleted = true
                            timeoutWorkItem.cancel()
                            resolve(history)
                        },
                        callFailed: { [weak self] errorCode, errorMessage in
                            guard !isCompleted, let self = self else { return }
                            isCompleted = true
                            timeoutWorkItem.cancel()
                            
                            YellPay.operationAttempts[operationKey] = (YellPay.operationAttempts[operationKey] ?? 0) + 1
                            if YellPay.operationAttempts[operationKey]! >= YellPay.maxAttempts {
                                YellPay.crashedOperations.insert(operationKey)
                            }
                            
                            reject("GET_HISTORY_ERROR", "Error \(errorCode): \(errorMessage)", nil)
                        }
                    )
                } catch {
                    guard !isCompleted else { return }
                    isCompleted = true
                    timeoutWorkItem.cancel()
                    
                    YellPay.operationAttempts[operationKey] = (YellPay.operationAttempts[operationKey] ?? 0) + 1
                    if YellPay.operationAttempts[operationKey]! >= YellPay.maxAttempts {
                        YellPay.crashedOperations.insert(operationKey)
                    }
                    
                    print("💥 YellPay.getHistory - Exception: \(error)")
                    reject("GET_HISTORY_EXCEPTION", "Exception: \(error.localizedDescription)", error)
                }
            }
        }
    }
    
    @objc
    func cardSelect(_ userId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let operationKey = "cardSelect"
        guard !YellPay.crashedOperations.contains(operationKey) else {
            reject("CARD_SELECT_CIRCUIT_BREAKER", "Card select operation has failed too many times", nil)
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            // Force light mode
            if let window = UIApplication.shared.windows.first {
                window.overrideUserInterfaceStyle = .light
            }
            
            guard let viewController = self.getCurrentViewController() else {
                reject("CARD_SELECT_ERROR", "No view controller available", nil)
                return
            }
            
            // Force light mode on view controller
            viewController.overrideUserInterfaceStyle = .light
            
            // Suppress Auto Layout constraint warnings from SDK's internal UI
            // These warnings are harmless - the SDK recovers by breaking constraints
            let originalValue = UserDefaults.standard.bool(forKey: "_UIConstraintBasedLayoutLogUnsatisfiable")
            UserDefaults.standard.set(false, forKey: "_UIConstraintBasedLayoutLogUnsatisfiable")
            
            let timeoutTimer = DispatchSource.makeTimerSource(queue: DispatchQueue.main)
            var isCompleted = false
            
            timeoutTimer.schedule(deadline: .now() + 60) // 60 second timeout
            timeoutTimer.setEventHandler {
                if !isCompleted {
                    isCompleted = true
                    
                    // Restore original constraint logging setting
                    UserDefaults.standard.set(originalValue, forKey: "_UIConstraintBasedLayoutLogUnsatisfiable")
                    
                    reject("CARD_SELECT_TIMEOUT", "Card selection timed out", nil)
                }
                timeoutTimer.cancel()
            }
            timeoutTimer.resume()
            
            autoreleasepool {
                do {
                    // Use the actual SDK method that exists - looks like there may not be a cardSelect method
                    // Based on other working methods, let's try the pattern that works
                    RoutePay.callCardSelectServiceId(
                        YellPay.SERVICE_ID,
                        merchantId: "yellpay", // Default merchant ID
                        payUserId: userId,
                        viewController: viewController,
                        callSuccess: { [weak self] selectedCard in
                            guard !isCompleted else { return }
                            isCompleted = true
                            timeoutTimer.cancel()
                            
                            // Restore original constraint logging setting
                            UserDefaults.standard.set(originalValue, forKey: "_UIConstraintBasedLayoutLogUnsatisfiable")
                            
                            resolve(selectedCard)
                        },
                        callFailed: { [weak self] status, error in
                            guard !isCompleted else { return }
                            isCompleted = true
                            timeoutTimer.cancel()
                            
                            // Restore original constraint logging setting
                            UserDefaults.standard.set(originalValue, forKey: "_UIConstraintBasedLayoutLogUnsatisfiable")
                            
                            YellPay.operationAttempts[operationKey] = (YellPay.operationAttempts[operationKey] ?? 0) + 1
                            if YellPay.operationAttempts[operationKey]! >= YellPay.maxAttempts {
                                YellPay.crashedOperations.insert(operationKey)
                            }
                            
                            let errorMessage = error?.localizedDescription ?? "Unknown error"
                            reject("CARD_SELECT_ERROR", "Error \(status): \(errorMessage)", error)
                        }
                    )
                } catch {
                    guard !isCompleted else { return }
                    isCompleted = true
                    timeoutTimer.cancel()
                    
                    // Restore original constraint logging setting
                    UserDefaults.standard.set(originalValue, forKey: "_UIConstraintBasedLayoutLogUnsatisfiable")
                    
                    reject("CARD_SELECT_EXCEPTION", "Exception: \(error.localizedDescription)", error)
                }
            }
        }
    }
    
    @objc
    func getMainCreditCard(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let operationKey = "getMainCreditCard"
        guard !YellPay.crashedOperations.contains(operationKey) else {
            reject("GET_MAIN_CARD_CIRCUIT_BREAKER", "Get main credit card operation has failed too many times", nil)
            return
        }
        
        autoreleasepool {
            do {
                // Use the actual SDK method name that exists
                RoutePay.callGetMainCreditCardResponseSuccess(
                    { [weak self] cardInfo in
                        // cardInfo is the card information
                        resolve(cardInfo)
                    },
                    callFailed: { [weak self] status, error in
                        YellPay.operationAttempts[operationKey] = (YellPay.operationAttempts[operationKey] ?? 0) + 1
                        if YellPay.operationAttempts[operationKey]! >= YellPay.maxAttempts {
                            YellPay.crashedOperations.insert(operationKey)
                        }
                        
                        let errorMessage = error?.localizedDescription ?? "Unknown error"
                        reject("GET_MAIN_CARD_ERROR", "Error \(status): \(errorMessage)", error)
                    }
                )
            } catch {
                reject("GET_MAIN_CARD_EXCEPTION", "Exception: \(error.localizedDescription)", error)
            }
        }
    }
    
    @objc
    func getUserInfo(_ userId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let operationKey = "getUserInfo"
        guard !YellPay.crashedOperations.contains(operationKey) else {
            reject("GET_USER_INFO_CIRCUIT_BREAKER", "Get user info operation has failed too many times", nil)
            return
        }
        
        // Input validation
        let safeUserId = sanitize(userId)
        guard !safeUserId.isEmpty else {
            reject("GET_USER_INFO_ERROR", "userId cannot be empty", nil)
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                reject("GET_USER_INFO_ERROR", "Module deallocated", nil)
                return
            }
            
            print("🔄 YellPay.getUserInfo - Calling SDK with userId: \(safeUserId)")
            var isCompleted = false
            let timeoutWorkItem = DispatchWorkItem { [weak self] in
                guard !isCompleted, let self = self else { return }
                isCompleted = true
                print("⏰ YellPay.getUserInfo - Timeout")
                reject("GET_USER_INFO_TIMEOUT", "Operation timed out", nil)
            }
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 30, execute: timeoutWorkItem)
            
            autoreleasepool {
                do {
                    // Verify we're on main thread before SDK call
                    assert(Thread.isMainThread, "getUserInfo must be called on main thread")
                    
                    // Use the version with environmentMode for production
                    // Note: getUserInfo does NOT require authentication - it only needs userId
                    RoutePay.callGetUserInfoUserId(
                        safeUserId,
                        environmentMode: EnvironmentModeEnum.production,
                        callSuccess: { [weak self] userCertificates in
                            // SDK may call from background thread - ensure we're on main thread
                            if Thread.isMainThread {
                                guard !isCompleted, let self = self else { return }
                                isCompleted = true
                                timeoutWorkItem.cancel()
                                
                                var certificatesArray: [[String: Any]] = []
                                if let certificates = userCertificates {
                                    for certificate in certificates {
                                        if let certDict = certificate as? [String: Any] {
                                            certificatesArray.append([
                                                "certificateType": certDict["certificateType"] as? String ?? "",
                                                "status": certDict["status"] as? Int ?? 0,
                                                "additionalInfo": certDict["additionalInfo"] as? String ?? ""
                                            ])
                                        }
                                    }
                                }
                                print("✅ YellPay.getUserInfo - Returning \(certificatesArray.count) certificates")
                                resolve(certificatesArray)
                            } else {
                                DispatchQueue.main.async {
                                    guard !isCompleted, let self = self else { return }
                                    isCompleted = true
                                    timeoutWorkItem.cancel()
                                    
                                    var certificatesArray: [[String: Any]] = []
                                    if let certificates = userCertificates {
                                        for certificate in certificates {
                                            if let certDict = certificate as? [String: Any] {
                                                certificatesArray.append([
                                                    "certificateType": certDict["certificateType"] as? String ?? "",
                                                    "status": certDict["status"] as? Int ?? 0,
                                                    "additionalInfo": certDict["additionalInfo"] as? String ?? ""
                                                ])
                                            }
                                        }
                                    }
                                    print("✅ YellPay.getUserInfo - Returning \(certificatesArray.count) certificates")
                                    resolve(certificatesArray)
                                }
                            }
                        },
                        callFailed: { [weak self] errorCode, errorMessage in
                            // SDK may call from background thread - ensure we're on main thread
                            if Thread.isMainThread {
                                guard !isCompleted else { return }
                                isCompleted = true
                                timeoutWorkItem.cancel()
                                
                                print("❌ YellPay.getUserInfo failed - Code: \(errorCode), Message: \(errorMessage)")
                                
                                YellPay.operationAttempts[operationKey] = (YellPay.operationAttempts[operationKey] ?? 0) + 1
                                if YellPay.operationAttempts[operationKey]! >= YellPay.maxAttempts {
                                    YellPay.crashedOperations.insert(operationKey)
                                }
                                
                                reject("GET_USER_INFO_ERROR", "Error \(errorCode): \(errorMessage)", nil)
                            } else {
                                DispatchQueue.main.async {
                                    guard !isCompleted else { return }
                                    isCompleted = true
                                    timeoutWorkItem.cancel()
                                    
                                    print("❌ YellPay.getUserInfo failed - Code: \(errorCode), Message: \(errorMessage)")
                                    
                                    YellPay.operationAttempts[operationKey] = (YellPay.operationAttempts[operationKey] ?? 0) + 1
                                    if YellPay.operationAttempts[operationKey]! >= YellPay.maxAttempts {
                                        YellPay.crashedOperations.insert(operationKey)
                                    }
                                    
                                    reject("GET_USER_INFO_ERROR", "Error \(errorCode): \(errorMessage)", nil)
                                }
                            }
                        }
                    )
                } catch {
                    guard !isCompleted else { return }
                    isCompleted = true
                    timeoutWorkItem.cancel()
                    
                    YellPay.operationAttempts[operationKey] = (YellPay.operationAttempts[operationKey] ?? 0) + 1
                    if YellPay.operationAttempts[operationKey]! >= YellPay.maxAttempts {
                        YellPay.crashedOperations.insert(operationKey)
                    }
                    
                    print("💥 YellPay.getUserInfo - Exception: \(error)")
                    reject("GET_USER_INFO_EXCEPTION", "Exception: \(error.localizedDescription)", error)
                }
            }
        }
    }
    
    @objc
    func viewCertificate(_ userId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let operationKey = "viewCertificate"
        guard !YellPay.crashedOperations.contains(operationKey) else {
            reject("VIEW_CERTIFICATE_CIRCUIT_BREAKER", "View certificate operation has failed too many times", nil)
            return
        }
        
        // Input validation
        let safeUserId = sanitize(userId)
        guard !safeUserId.isEmpty else {
            reject("VIEW_CERTIFICATE_ERROR", "userId cannot be empty", nil)
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                reject("VIEW_CERTIFICATE_ERROR", "Module deallocated", nil)
                return
            }
            
            guard let viewController = self.getCurrentViewController() else {
                reject("VIEW_CERTIFICATE_ERROR", "No view controller available", nil)
                return
            }
            
            var isCompleted = false
            let timeoutWorkItem = DispatchWorkItem { [weak self] in
                guard !isCompleted, let self = self else { return }
                isCompleted = true
                print("⏰ YellPay.viewCertificate - Operation timed out")
                
                if self.shouldBlockOperation(operationKey) {
                    self.blockOperation(operationKey)
                }
                
                reject("VIEW_CERTIFICATE_TIMEOUT", "View certificate operation timed out", nil)
            }
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 30, execute: timeoutWorkItem)
            
            autoreleasepool {
                do {
                    RoutePay.callViewCertificateUserId(
                        safeUserId,
                        viewController: viewController,
                        callSuccess: { [weak self] in
                            guard !isCompleted, let self = self else { return }
                            isCompleted = true
                            timeoutWorkItem.cancel()
                            resolve(["success": true])
                        },
                        callFailed: { [weak self] errorCode, errorMessage in
                            guard !isCompleted, let self = self else { return }
                            isCompleted = true
                            timeoutWorkItem.cancel()
                            
                            YellPay.operationAttempts[operationKey] = (YellPay.operationAttempts[operationKey] ?? 0) + 1
                            if YellPay.operationAttempts[operationKey]! >= YellPay.maxAttempts {
                                YellPay.crashedOperations.insert(operationKey)
                            }
                            
                            reject("VIEW_CERTIFICATE_ERROR", "Error \(errorCode): \(errorMessage)", nil)
                        }
                    )
                } catch {
                    guard !isCompleted else { return }
                    isCompleted = true
                    timeoutWorkItem.cancel()
                    
                    YellPay.operationAttempts[operationKey] = (YellPay.operationAttempts[operationKey] ?? 0) + 1
                    if YellPay.operationAttempts[operationKey]! >= YellPay.maxAttempts {
                        YellPay.crashedOperations.insert(operationKey)
                    }
                    
                    print("💥 YellPay.viewCertificate - Exception: \(error)")
                    reject("VIEW_CERTIFICATE_EXCEPTION", "Exception: \(error.localizedDescription)", error)
                }
            }
        }
    }
    
    @objc
    func getNotification(_ userId: String, lastUpdate: NSNumber, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let operationKey = "getNotification"
        guard !YellPay.crashedOperations.contains(operationKey) else {
            reject("GET_NOTIFICATION_CIRCUIT_BREAKER", "Get notification operation has failed too many times", nil)
            return
        }
        
        // Input validation
        let safeUserId = sanitize(userId)
        guard !safeUserId.isEmpty else {
            reject("GET_NOTIFICATION_ERROR", "userId cannot be empty", nil)
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                reject("GET_NOTIFICATION_ERROR", "Module deallocated", nil)
                return
            }
            
            var isCompleted = false
            let timeoutWorkItem = DispatchWorkItem { [weak self] in
                guard !isCompleted, let self = self else { return }
                isCompleted = true
                print("⏰ YellPay.getNotification - Operation timed out")
                
                if self.shouldBlockOperation(operationKey) {
                    self.blockOperation(operationKey)
                }
                
                reject("GET_NOTIFICATION_TIMEOUT", "Get notification operation timed out", nil)
            }
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 30, execute: timeoutWorkItem)
            
            autoreleasepool {
                do {
                    RoutePay.callGetNotificationUserId(
                        safeUserId,
                        lastUpdate: lastUpdate.intValue,
                        callSuccess: { [weak self] notificationCount, notifications in
                            guard !isCompleted, let self = self else { return }
                            isCompleted = true
                            timeoutWorkItem.cancel()
                            
                            // Convert notifications array to serializable format
                            var notificationsArray: [[String: Any]] = []
                            if let notificationList = notifications {
                                for notification in notificationList {
                                    if let notifDict = notification as? [String: Any] {
                                        notificationsArray.append([
                                            "id": notifDict["notificationId"] as? String ?? "",
                                            "title": notifDict["title"] as? String ?? "",
                                            "message": notifDict["message"] as? String ?? "",
                                            "date": notifDict["date"] as? String ?? ""
                                        ])
                                    }
                                }
                            }
                            
                            resolve([
                                "count": notificationCount,
                                "notifications": notificationsArray
                            ])
                        },
                        callFailed: { [weak self] errorCode, errorMessage in
                            guard !isCompleted, let self = self else { return }
                            isCompleted = true
                            timeoutWorkItem.cancel()
                            
                            YellPay.operationAttempts[operationKey] = (YellPay.operationAttempts[operationKey] ?? 0) + 1
                            if YellPay.operationAttempts[operationKey]! >= YellPay.maxAttempts {
                                YellPay.crashedOperations.insert(operationKey)
                            }
                            
                            reject("GET_NOTIFICATION_ERROR", "Error \(errorCode): \(errorMessage)", nil)
                        }
                    )
                } catch {
                    guard !isCompleted else { return }
                    isCompleted = true
                    timeoutWorkItem.cancel()
                    
                    YellPay.operationAttempts[operationKey] = (YellPay.operationAttempts[operationKey] ?? 0) + 1
                    if YellPay.operationAttempts[operationKey]! >= YellPay.maxAttempts {
                        YellPay.crashedOperations.insert(operationKey)
                    }
                    
                    print("💥 YellPay.getNotification - Exception: \(error)")
                    reject("GET_NOTIFICATION_EXCEPTION", "Exception: \(error.localizedDescription)", error)
                }
            }
        }
    }
    
    @objc(getInformation:infoType:resolver:rejecter:)
    func getInformation(_ userId: String, infoType: NSNumber, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let operationKey = "getInformation"
        guard !YellPay.crashedOperations.contains(operationKey) else {
            reject("GET_INFORMATION_CIRCUIT_BREAKER", "Get information operation has failed too many times", nil)
            return
        }
        
        // Input validation
        let safeUserId = sanitize(userId)
        guard !safeUserId.isEmpty else {
            reject("GET_INFORMATION_ERROR", "userId cannot be empty", nil)
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                reject("GET_INFORMATION_ERROR", "Module deallocated", nil)
                return
            }
            
            var isCompleted = false
            let timeoutWorkItem = DispatchWorkItem { [weak self] in
                guard !isCompleted, let self = self else { return }
                isCompleted = true
                print("⏰ YellPay.getInformation - Operation timed out")
                
                if self.shouldBlockOperation(operationKey) {
                    self.blockOperation(operationKey)
                }
                
                reject("GET_INFORMATION_TIMEOUT", "Get information operation timed out", nil)
            }
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 30, execute: timeoutWorkItem)
            
            autoreleasepool {
                do {
                    RoutePay.callGetInformationUserId(
                        safeUserId,
                        lastUpdateNotification: infoType.intValue,
                        callSuccess: { [weak self] informationCount, informationMeta1, informationList, meta2, meta3 in
                            guard !isCompleted, let self = self else { return }
                            isCompleted = true
                            timeoutWorkItem.cancel()
                            
                            // Convert information array to serializable format
                            var informationArray: [[String: Any]] = []
                            if let infoList = informationList {
                                for info in infoList {
                                    if let infoDict = info as? [String: Any] {
                                        informationArray.append([
                                            "id": infoDict["informationId"] as? String ?? "",
                                            "title": infoDict["title"] as? String ?? "",
                                            "content": infoDict["content"] as? String ?? "",
                                            "date": infoDict["date"] as? String ?? ""
                                        ])
                                    }
                                }
                            }
                            
                            resolve([
                                "count": informationCount,
                                "information": informationArray
                            ])
                        },
                        callFailed: { [weak self] errorCode, errorMessage in
                            guard !isCompleted, let self = self else { return }
                            isCompleted = true
                            timeoutWorkItem.cancel()
                            
                            YellPay.operationAttempts[operationKey] = (YellPay.operationAttempts[operationKey] ?? 0) + 1
                            if YellPay.operationAttempts[operationKey]! >= YellPay.maxAttempts {
                                YellPay.crashedOperations.insert(operationKey)
                            }
                            
                            reject("GET_INFORMATION_ERROR", "Error \(errorCode): \(errorMessage)", nil)
                        }
                    )
                } catch {
                    guard !isCompleted else { return }
                    isCompleted = true
                    timeoutWorkItem.cancel()
                    
                    YellPay.operationAttempts[operationKey] = (YellPay.operationAttempts[operationKey] ?? 0) + 1
                    if YellPay.operationAttempts[operationKey]! >= YellPay.maxAttempts {
                        YellPay.crashedOperations.insert(operationKey)
                    }
                    
                    print("💥 YellPay.getInformation - Exception: \(error)")
                    reject("GET_INFORMATION_EXCEPTION", "Exception: \(error.localizedDescription)", error)
                }
            }
        }
    }
    
    // MARK: - Helper Methods
    
    @objc
    func checkFrameworkAvailability(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Check if RouteCode framework classes are available
        guard NSClassFromString("RouteAuth") != nil else {
            reject("FRAMEWORK_ERROR", "RouteAuth class not found - RouteCode framework not properly loaded", nil)
            return
        }
        
        guard NSClassFromString("RoutePay") != nil else {
            reject("FRAMEWORK_ERROR", "RoutePay class not found - RouteCode framework not properly loaded", nil)
            return
        }
        
        resolve([
            "available": true,
            "routeAuth": "available",
            "routePay": "available"
        ])
    }
    
    @objc
    func validateAuthenticationStatus(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let operationName = "validateAuthenticationStatus"
        print("🔥 YellPay.\(operationName) START")
        
        // Circuit breaker check
        if isOperationBlocked(operationName) {
            print("🚫 Operation \(operationName) blocked due to previous crashes")
            resolve([
                "authenticated": false,
                "error": "Operation blocked due to previous crashes"
            ])
            return
        }
        
        incrementAttempt(operationName)
        
        // Much shorter timeout for validation
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                resolve([
                    "authenticated": false,
                    "error": "Module deallocated"
                ])
                return
            }
            
            var isCompleted = false
            
            // Very short timeout to prevent hangs
            let timeoutWorkItem = DispatchWorkItem { [weak self] in
                guard !isCompleted, let self = self else { return }
                isCompleted = true
                print("⏰ YellPay.\(operationName) - Validation timed out quickly")
                
                if self.shouldBlockOperation(operationName) {
                    self.blockOperation(operationName)
                }
                
                resolve([
                    "authenticated": false,
                    "error": "Validation timed out (3s)"
                ])
            }
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 3, execute: timeoutWorkItem)
            
            // Try a very basic check first - just see if RouteAuth exists
            do {
                guard NSClassFromString("RouteAuth") != nil else {
                    timeoutWorkItem.cancel()
                    isCompleted = true
                    resolve([
                        "authenticated": false,
                        "error": "RouteAuth framework not available"
                    ])
                    return
                }
                
                // Skip the potentially problematic SDK call for now
                timeoutWorkItem.cancel()
                isCompleted = true
                print("✅ YellPay.\(operationName) - Basic framework check passed")
                resolve([
                    "authenticated": false,
                    "error": "Framework available but authentication status unknown (safe mode)"
                ])
                
            } catch {
                guard !isCompleted else { return }
                isCompleted = true
                timeoutWorkItem.cancel()
                print("💥 YellPay.\(operationName) - Exception: \(error)")
                
                if self.shouldBlockOperation(operationName) {
                    self.blockOperation(operationName)
                }
                
                resolve([
                    "authenticated": false,
                    "error": "Framework check failed: \(error.localizedDescription)"
                ])
            }
        }
    }
    
    @objc
    func resetCrashProtection(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        YellPay.crashedOperations.removeAll()
        YellPay.operationAttempts.removeAll()
        print("🔄 Crash protection reset - all operations unblocked")
        resolve([
            "reset": true,
            "message": "All blocked operations have been reset"
        ])
    }
    
    @objc
    func getCrashProtectionStatus(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        resolve([
            "blockedOperations": Array(YellPay.crashedOperations),
            "operationAttempts": YellPay.operationAttempts
        ])
    }
    
    private func getCurrentViewController() -> UIViewController? {
        // Find active window scene first
        guard let windowScene = UIApplication.shared.connectedScenes.first(where: { 
            $0.activationState == .foregroundActive 
        }) as? UIWindowScene else {
            print("YellPay: No active window scene found")
            return nil
        }
        
        // Find key window
        guard let window = windowScene.windows.first(where: { $0.isKeyWindow }) else {
            print("YellPay: No key window found")
            return nil
        }
        
        // Enforce light mode globally for this window
        enforceLightMode(on: window)
        
        // Get root view controller
        guard let rootViewController = window.rootViewController else {
            print("YellPay: No root view controller found")
            return nil
        }
        
        // Helper to check if a view controller is safe to present on
        func isSafeToPresentOn(_ controller: UIViewController) -> Bool {
            // Check if controller is in any transition state
            if controller.isBeingPresented || controller.isBeingDismissed {
                return false
            }
            
            // Check if controller is a React Native modal type
            let controllerType = String(describing: type(of: controller))
            if controllerType.contains("RCTRedBox") || 
               controllerType.contains("RCTPresentedViewController") ||
               controllerType.contains("RCTDevLoadingView") {
                return false
            }
            
            // Check if controller has a modal currently being presented/dismissed
            if let presented = controller.presentedViewController {
                if presented.isBeingPresented || presented.isBeingDismissed {
                    return false
                }
            }
            
            return true
        }
        
        // If root is not safe, return nil to prevent crash
        guard isSafeToPresentOn(rootViewController) else {
            print("YellPay: Root view controller is not safe to present on")
            return nil
        }
        
        // Find topmost presented view controller that's safe
        var topController = rootViewController
        while let presentedViewController = topController.presentedViewController {
            // If the presented VC is not safe, stop here
            if !isSafeToPresentOn(presentedViewController) {
                print("YellPay: Presented view controller is not safe, stopping at current level")
                break
            }
            
            topController = presentedViewController
        }
        
        // Final safety check
        if !isSafeToPresentOn(topController) {
            print("YellPay: Final view controller is not safe to present on")
            return nil
        }
        
        print("YellPay: Found safe view controller: \(String(describing: topController))")
        return topController
    }
    
    private func enforceLightMode(on window: UIWindow?) {
        guard let window = window else { return }
        if #available(iOS 13.0, *) {
            window.overrideUserInterfaceStyle = .light
        }
    }
    
}
