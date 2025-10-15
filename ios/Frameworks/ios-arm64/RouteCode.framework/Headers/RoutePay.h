//
//  RoutePay.h
//  RouteCode
//
//  Created by PLATFIELD INC.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>


#ifndef TEST_APPLICATION
// SDK用
#import <RouteCode/ResponseBlock.h>

#else
// テストアプリケーション用
#import "ResponseBlock.h"

#endif

NS_ASSUME_NONNULL_BEGIN

typedef NS_ENUM (NSUInteger, kDiscount) {
    kDiscountDisability = 1,
};

typedef NS_ENUM (NSUInteger, kUserDiscountCertificateKind) {
    kUserDiscountCertificateKindNone = 0, // なし
    kUserDiscountCertificateKindFacePhoto,  // 顔写真
    kUserDiscountCertificateKindDisabilityCertifcate, // 障害者手帳
    kUserDiscountCertificateKindOther,  // その他
};

typedef NS_ENUM (NSUInteger, kDiscountExamination) {
    kDiscountExaminationNone = 0, // なし
    kDiscountExaminationExamining,  // 審査中
    kDiscountExaminationRejected, // 却下
    kDiscountExaminationApproved,  // 承認
};

typedef NS_ENUM(NSInteger, EnvironmentModeEnum) {
    EnvironmentModeEnumProduction = 0,
    EnvironmentModeEnumStaging = 1,
    EnvironmentModeEnumDevelop = 2,
    EnvironmentModeEnumDevelop2 = 3,
};

/**
 * RoutePayメインメソッドクラス
 */
@interface RoutePay : NSObject

/**
 * ユーザー情報初期化(環境モード付き)
 *
 * @param[in] serviceId : サービスID
 * @param[in] merchantId : 店舗ID
 * @param[in] environmentMode : サーバー環境
 * @param[out] responseSuccessBlock : ユーザー情報生成レスポンス
 * @param[out] responseFailedBlock : エラーレスポンス
 */
+ (void)initialUuidServiceId:(NSString *)serviceId
                  merchantId:(NSString *)merchantId
             environmentMode:(EnvironmentModeEnum)environmentMode
                 callSuccess:(ResponseInitialUuidSuccessBlockType)responseSuccessBlock
                  callFailed:(ResponseInitialUuidFailedBlockType)responseFailedBlock;

/**
 *  @brief ユーザー情報初期化
 *
 * @param[in] serviceId : サービスID
 * @param[in] merchantId : 店舗ID
 * @param[out] responseSuccessBlock : ユーザー情報生成レスポンス
 * @param[out] responseFailedBlock : エラーレスポンス
 */
+ (void)initialUuidServiceId:(NSString *)serviceId
                  merchantId:(NSString *)merchantId
                 callSuccess:(ResponseInitialUuidSuccessBlockType)responseSuccessBlock
                  callFailed:(ResponseInitialUuidFailedBlockType)responseFailedBlock;


+ (void)callUserInfoDetailCardRegisterUuid:(NSString *)uuid
                                    userNo:(NSInteger)userNo
                                 payUserId:(NSString *)payUserId
                            viewController:(UIViewController *)viewController
                           environmentMode:(EnvironmentModeEnum)environmentMode
                               callSuccess:(ResponseUserDetailSuccessBlockType)responseSuccessBlock
                                callFailed:(ResponseUserDetailFailedBlockType)responseFailedBlock;



/**
 * @brief クレジットカード登録
 *
 * @param uuid : uuid
 * @param userNo : ユーザーNo
 * @param viewController : コールバック用ビューコントローラ
 * @param responseSuccessBlock : カード登録レスポンスブロックス
 * @param responseFailedBlock : エラーレスポンス
 */
+ (void)callCardRegisterUuid:(NSString *)uuid
                      userNo:(NSInteger)userNo
                   payUserId:(NSString *)payUserId
              viewController:(UIViewController *)viewController
                 callSuccess:(ResponseCardRegistSuccessBlockType)responseSuccessBlock
                  callFailed:(ResponseCardRegistFailedBlockType)responseFailedBlock;

/**
 * @brief クレジットカード登録
 *
 * @param uuid : uuid
 * @param userNo : ユーザーNo
 * @param payUserId       : ユーザーID
 * @param viewController : コールバック用ビューコントローラ
 * @param environmentMode : サーバー環境
 * @param responseSuccessBlock : カード登録レスポンスブロックス
 * @param responseFailedBlock : エラーレスポンス
 */
+ (void)callCardRegisterUuid:(NSString *)uuid
                      userNo:(NSInteger)userNo
                   payUserId:(NSString *)payUserId
              viewController:(UIViewController *)viewController
             environmentMode:(EnvironmentModeEnum)environmentMode
                 callSuccess:(ResponseCardRegistSuccessBlockType)responseSuccessBlock
                  callFailed:(ResponseCardRegistFailedBlockType)responseFailedBlock;


/**
 * @brief 決済
 *
 * @param uuid : uuid
 * @param userNo :ユーザーNo
 * @param viewController : コールバック用ビューコントローラ
 * @param responseSuccessBlock : 決済レスポンスブロックス
 * @param responseFailedBlock : エラーレスポンス
 */
+ (void)callPaymentUuid:(NSString *)uuid
                 userNo:(NSInteger)userNo
         viewController:(UIViewController *)viewController
            callSuccess:(ResponsePaymentSuccessBlockType)responseSuccessBlock
             callFailed:(ResponsePaymentFailedBlockType)responseFailedBlock;

/**
 * @brief 決済
 *
 * @param uuid : uuid
 * @param userNo :ユーザーNo
 * @param viewController : コールバック用ビューコントローラ
 * @param environmentMode : サーバー環境
 * @param responseSuccessBlock : 決済レスポンスブロックス
 * @param responseFailedBlock : エラーレスポンス
 */
+ (void)callPaymentUuid:(NSString *)uuid
                 userNo:(NSInteger)userNo
         viewController:(UIViewController *)viewController
        environmentMode:(EnvironmentModeEnum)environmentMode
            callSuccess:(ResponsePaymentSuccessBlockType)responseSuccessBlock
             callFailed:(ResponsePaymentFailedBlockType)responseFailedBlock;

/**
 * @brief 決済(環境モード付き)
 * @param uuid : uuid
 * @param userNo :ユーザーNo
 * @param payUserId :ペイユーザーID
 * @param viewController : コールバック用ビューコントローラ
 * @param environmentMode : サーバー環境
 * @param responseSuccessBlock : 決済レスポンスブロックス
 * @param responseFailedBlock : エラーレスポンス
 */
+ (void)callPaymentUuid:(NSString *)uuid
                 userNo:(NSInteger)userNo
              payUserId:(NSString *)payUserId
         viewController:(UIViewController *)viewController
        environmentMode:(EnvironmentModeEnum)environmentMode
            callSuccess:(ResponsePaymentSuccessBlockType)responseSuccessBlock
             callFailed:(ResponsePaymentFailedBlockType)responseFailedBlock;


/**
 * @brief 受付または決済関数＜ユーザーID＞（QRから起動、環境モードあり）
 *
 * @param uuid : uuid
 * @param userNo : uuidNo
 * @param payUserId :ユーザーID
 * @param viewController : ビューコントローラ
 * @param responseSuccessBlock : カード登録レスポンスブロックス
 * @param responseFailedBlock : エラーレスポンス
 */
+ (void)callPaymentForQRUuid:(NSString *)uuid
                      userNo:(NSInteger)userNo
                   payUserId:(NSString *)payUserId
              viewController:(UIViewController *)viewController
                 callSuccess:(ResponsePaymentSuccessBlockType)responseSuccessBlock
                  callFailed:(ResponsePaymentFailedBlockType)responseFailedBlock;

/**
 * @brief 受付または決済関数＜ユーザーID＞（QRから起動、環境モードあり）
 *
 * @param uuid : uuid
 * @param userNo : uuidNo
 * @param payUserId :ユーザーID
 * @param viewController : ビューコントローラ
 * @param environmentMode : サーバー環境
 * @param responseSuccessBlock : カード登録レスポンスブロックス
 * @param responseFailedBlock : エラーレスポンス
 */
+ (void)callPaymentForQRUuid:(NSString *)uuid
                      userNo:(NSInteger)userNo
                   payUserId:(NSString *)payUserId
              viewController:(UIViewController *)viewController
             environmentMode:(EnvironmentModeEnum)environmentMode
                 callSuccess:(ResponsePaymentSuccessBlockType)responseSuccessBlock
                  callFailed:(ResponsePaymentFailedBlockType)responseFailedBlock;


+ (NSError *)makeError:(NSInteger)errorCode errorMassage:(NSString *)errorMassage;

/**
 * @brief ユーザー情報生成
 * @param serviceId : サービスID
 * @param responseSuccessBlock : 成功レスポンスブロックス
 * @param responseFailedBlock : エラーレスポンスブロックス
 */
+ (void)callInitialUserIdServiceId:(NSString *)serviceId
                       callSuccess:(ResponseInitialUserIdSuccessBlockType)responseSuccessBlock
                        callFailed:(ResponseInitialUserIdFailedBlockType)responseFailedBlock;

/**
 * @brief ユーザー情報生成
 * @param serviceId:サービスID
 * @param environmentMode : サーバー環境
 * @param responseSuccessBlock: 成功レスポンスブロックス
 * @param responseFailedBlock : エラーレスポンス
 */
+ (void)callInitialUserIdServiceId:(NSString *)serviceId
                   environmentMode:(EnvironmentModeEnum)environmentMode
                       callSuccess:(ResponseInitialUserIdSuccessBlockType)responseSuccessBlock
                        callFailed:(ResponseInitialUserIdFailedBlockType)responseFailedBlock;


/**
 * @brief ユーザー情報取得(環境モード付き)
 * @param userId:ペイユーザーID
 * @param responseSuccessBlock : 成功レスポンスブロックス
 * @param responseFailedBlock : エラーレスポンスブロックス
 */
+ (void)callGetUserInfoUserId:(NSString *)userId
                  callSuccess:(ResponseGetUserInfoSuccessBlockType)responseSuccessBlock
                   callFailed:(ResponseGetUserInfoFailedBlockType)responseFailedBlock ;

/**
 * @brief ユーザー情報取得(環境モード付き)
 * @param userId:ペイユーザーID
 * @param environmentMode : サーバー環境
 * @param responseSuccessBlock : 成功レスポンスブロックス
 * @param responseFailedBlock : エラーレスポンスブロックス
 */
+ (void)callGetUserInfoUserId:(NSString *)userId
              environmentMode:(EnvironmentModeEnum)environmentMode
                  callSuccess:(ResponseGetUserInfoSuccessBlockType)responseSuccessBlock
                   callFailed:(ResponseGetUserInfoFailedBlockType)responseFailedBlock;

/**
 * @brief  証明書申請関数(環境モードなし)
 * @param userId : クライアントユーザーID
 * @param viewController : コールバック用ビューコントローラ
 * @param responseSuccessBlock : 成功レスポンスブロックス
 * @param responseFailedBlock : エラーレスポンスブロックス
 */
+ (void)callViewCertificateUserId:(NSString *)userId
                   viewController:(UIViewController *)viewController
                      callSuccess:(ResponseViewCertificateSuccessBlockType)responseSuccessBlock
                       callFailed:(ResponseViewCertificateFailedBlockType)responseFailedBlock;


/**
 * @brief  証明書申請関数(環境モードあり)
 * @param userId : クライアントユーザーID
 * @param viewController : コールバック用ビューコントローラ
 * @param environmentMode : サーバー環境
 * @param responseSuccessBlock : 成功レスポンスブロックス
 * @param responseFailedBlock : エラーレスポンスブロックス
 */
+ (void)callViewCertificateUserId:(NSString *)userId
                   viewController:(UIViewController *)viewController
                  environmentMode:(EnvironmentModeEnum)environmentMode
                      callSuccess:(ResponseViewCertificateSuccessBlockType)responseSuccessBlock
                       callFailed:(ResponseViewCertificateFailedBlockType)responseFailedBlock;

/**
 * @brief チケットURL生成関数(環境モードなし)
 * @param userId : クライアントユーザーID
 * @param ticketId :チケットID
 * @param responseSuccessBlock : 成功レスポンスブロックス
 * @param responseFailedBlock : エラーレスポンスブロックス
 */
+ (void)callGetTicketUrlUserId:(NSString *)userId
                      ticketId:(NSString *)ticketId
                   callSuccess:(ResponseGetTicketUrlSuccessBlockType)responseSuccessBlock
                    callFailed:(ResponseGetTicketUrlFailedBlockType)responseFailedBlock;

/**
 * @brief チケットURL生成関数(環境モードあり)
 * @param userId : クライアントユーザーID
 * @param ticketId :チケットID
 * @param environmentMode : サーバー環境
 * @param responseSuccessBlock : 成功レスポンスブロックス
 * @param responseFailedBlock : エラーレスポンスブロックス
 */
+ (void)callGetTicketUrlUserId:(NSString *)userId
                      ticketId:(NSString *)ticketId
               environmentMode:(EnvironmentModeEnum)environmentMode
                   callSuccess:(ResponseGetTicketUrlSuccessBlockType)responseSuccessBlock
                    callFailed:(ResponseGetTicketUrlFailedBlockType)responseFailedBlock;

/**
 * 決済(スキーマ起動)(環境モードなし)
 *
 * @param uuid            : UUID
 * @param userNo          : UUID番号
 * @param payUserId       : ユーザーID
 * @param streamSeed      : ストリームシード
 * @param streamTime      : ストリーム作成時刻
 * @param viewController : ビューコントローラ
 * @param responseSuccessBlock : 決済レスポンスブロックス
 * @param responseFailedBlock : エラーレスポンス
 */

+ (void)callPaymentSchemeUuid:(NSString *)uuid
                       userNo:(NSInteger)userNo
                    payUserId:(NSString *)payUserId
                   streamSeed:(NSString *)streamSeed
                   streamTime:(NSInteger)streamTime
               viewController:(UIViewController *)viewController
                  callSuccess:(ResponsePaymentSuccessBlockType)responseSuccessBlock
                   callFailed:(ResponsePaymentFailedBlockType)responseFailedBlock;

/**
 * 決済(スキーマ起動)(環境モード付き)
 *
 * @param uuid            : UUID
 * @param userNo          : UUID番号
 * @param payUserId       : ユーザーID
 * @param streamSeed      : ストリームシード
 * @param streamTime      : ストリーム作成時刻
 * @param viewController : ビューコントローラ
 * @param environmentMode : サーバー環境
 * @param responseSuccessBlock : 決済レスポンスブロックス
 * @param responseFailedBlock : エラーレスポンス
 */

+ (void)callPaymentSchemeUuid:(NSString *)uuid
                       userNo:(NSInteger)userNo
                    payUserId:(NSString *)payUserId
                   streamSeed:(NSString *)streamSeed
                   streamTime:(NSInteger)streamTime
               viewController:(UIViewController *)viewController
              environmentMode:(EnvironmentModeEnum)environmentMode
                  callSuccess:(ResponsePaymentSuccessBlockType)responseSuccessBlock
                   callFailed:(ResponsePaymentFailedBlockType)responseFailedBlock;


/*
 * クレジットカード選択関数(環境モード付き)
 *
 * @param[in] serviceId : サービスID
 * @param[in] merchantId : 店舗ID
 * @param viewController : ビューコントローラ
 * @param environmentMode : サーバー環境
 * @param responseSuccessBlock : カード登録レスポンスブロックス
 * @param responseFailedBlock : エラーレスポンス
 */
+ (void)callCardSelectServiceId:(NSString *)serviceId
                     merchantId:(NSString *)merchantId
                      payUserId:(NSString *)payUserId
                 viewController:(UIViewController *)viewController
                environmentMode:(EnvironmentModeEnum)environmentMode
                    callSuccess:(ResponseCardSelectSuccessBlockType)responseSuccessBlock
                     callFailed:(ResponseCardSelectFailedBlockType)responseFailedBlock;

/*
 * クレジットカード選択関数(環境モードなし)
 *
 * @param[in] serviceId : サービスID
 * @param[in] merchantId : 店舗ID
 * @param viewController : ビューコントローラ
 * @param responseSuccessBlock : カード登録レスポンスブロックス
 * @param responseFailedBlock : エラーレスポンス
 */
+ (void)callCardSelectServiceId:(NSString *)serviceId
                     merchantId:(NSString *)merchantId
                      payUserId:(NSString *)payUserId
                 viewController:(UIViewController *)viewController
                    callSuccess:(ResponseCardSelectSuccessBlockType)responseSuccessBlock
                     callFailed:(ResponseCardSelectFailedBlockType)responseFailedBlock;


+ (void)callMainCardSettingUuid:(NSString *)uuid
                         userNo:(NSInteger)userNo
                    callSuccess:(ResponseMainCardSettingSuccessBlockType)responseSuccessBlock
                     callFailed:(ResponseMainCardSettingFailedBlockType)responseFailedBlock;


/*
 * メインクレジットカード取得関数
 *
 * @param responseSuccessBlock : カード登録レスポンスブロックス
 * @param responseFailedBlock : エラーレスポンス
 */
+ (void)callGetMainCreditCardResponseSuccess:(ResponseGetMainCreditCardSuccessBlockType)responseSuccessBlock
                                  callFailed:(ResponseGetMainCreditCardFailedBlockType)responseFailedBlock;


+ (UIImage *)generateCardWithNumber:(NSString *)cardNumber expiryDate:(NSString *)expiryDate;


/**
 * @brief 決済履歴
 *
 * @param viewController : コールバック用ビューコントローラ
 * @param responseSuccessBlock : 決済レスポンスブロックス
 * @param responseFailedBlock : エラーレスポンス
 */
+ (void)callPayHistoryUserId:(NSString *)userId
              viewController:(UIViewController *)viewController
                 callSuccess:(ResponsePayHistorySuccessBlockType)responseSuccessBlock
                  callFailed:(ResponsePayHistoryFailedBlockType)responseFailedBlock;

/**
 * @brief 決済お知らせ取得関数(環境モードあり)
 *
 * @param userId : ユーザーID
 * @param viewController : コールバック用ビューコントローラ
 * @param environmentMode : サーバー環境
 * @param responseSuccessBlock : 決済レスポンスブロックス
 * @param responseFailedBlock : エラーレスポンス
 */

+ (void)callPayHistoryUserId:(NSString *)userId
              viewController:(UIViewController *)viewController
             environmentMode:(EnvironmentModeEnum)environmentMode
                 callSuccess:(ResponsePayHistorySuccessBlockType)responseSuccessBlock
                  callFailed:(ResponsePayHistoryFailedBlockType)responseFailedBlock;

/**
 * @brief お知らせ取得関数(環境モードなし)
 *
 * @param userId : ユーザーID
 * @param responseSuccessBlock : 決済レスポンスブロックス
 * @param responseFailedBlock : エラーレスポンス
 */
+ (void)callGetNotificationUserId:(NSString *)userId
                       lastUpdate:(NSInteger)last_update
                      callSuccess:(ResponseGetNotificationSuccessBlockType)responseSuccessBlock
                       callFailed:(ResponseGetGetNotificationFailedBlockType)responseFailedBlock;

/**
 * @brief お知らせ取得関数(環境モードなし)
 *
 * @param userId : ユーザーID
 * @param environmentMode : サーバー環境
 * @param responseSuccessBlock : 決済レスポンスブロックス
 * @param responseFailedBlock : エラーレスポンス
 */
+ (void)callGetNotificationUserId:(NSString *)userId
                       lastUpdate:(NSInteger)last_update
                  environmentMode:(EnvironmentModeEnum)environmentMode
                      callSuccess:(ResponseGetNotificationSuccessBlockType)responseSuccessBlock
                       callFailed:(ResponseGetGetNotificationFailedBlockType)responseFailedBlock;

+ (void)callGetInformationUserId:(NSString *)userId
          lastUpdateNotification:(NSInteger)lastUpdateNotification
                     callSuccess:(ResponseGetInformationSuccessBlockType)responseGetInformationSuccess
                      callFailed:(ResponseGetInformationFailedBlockType)responseGetInformationFailed;

+ (void)callGetInformationUserId:(NSString *)userId
          lastUpdateNotification:(NSInteger)lastUpdateNotification
                 environmentMode:(EnvironmentModeEnum)environmentMode
                     callSuccess:(ResponseGetInformationSuccessBlockType)responseGetInformationSuccess
                      callFailed:(ResponseGetInformationFailedBlockType)responseGetInformationFailed;

+ (void)callGetConfirmLimitAmountUserId:(NSString *)userId
                            callSuccess:(ResponseGetConfirmLimitAmountSuccessBlockType)responseGetConfirmLimitAmountSuccess
                             callFailed:(ResponseGetConfirmLimitAmountFailedBlockType)responseGetConfirmLimitAmountFailed;



/**
 * @brief 利用金額、上限金額取得関数(環境モードあり)
 *
 * @param userId : ユーザーID
 * @param environmentMode : サーバー環境
 * @param responseGetConfirmLimitAmountSuccess : レスポンスブロックス
 * @param responseGetConfirmLimitAmountFailed : エラーレスポンス
 */
+ (void)callGetConfirmLimitAmountUserId:(NSString *)userId
                        environmentMode:(EnvironmentModeEnum)environmentMode
                            callSuccess:(ResponseGetConfirmLimitAmountSuccessBlockType)responseGetConfirmLimitAmountSuccess
                             callFailed:(ResponseGetConfirmLimitAmountFailedBlockType)responseGetConfirmLimitAmountFailed;

/**
 * @brief 会員登録 + 本人確認 (環境モードなし)
 *
 * @param payUserId : ユーザーID
 * @param responseSuccessBlock : レスポンスブロックス
 * @param responseFailedBlock : エラーレスポンス
 */
+ (void)callUserDetailPayUserId:(NSString *)payUserId
                 viewController:(UIViewController *)viewController
                    callSuccess:(ResponseUserDetailSuccessBlockType)responseSuccessBlock
                     callFailed:(ResponseUserDetailFailedBlockType)responseFailedBlock;


/**
 * @brief 会員登録 + 本人確認 (環境モードあり)
 *
 * @param payUserId : ユーザーID
 * @param environmentMode : サーバー環境
 * @param responseSuccessBlock : レスポンスブロックス
 * @param responseFailedBlock : エラーレスポンス
 */
+ (void)callUserDetailPayUserId:(NSString *)payUserId
                 viewController:(UIViewController *)viewController
                environmentMode:(EnvironmentModeEnum)environmentMode
                    callSuccess:(ResponseUserDetailSuccessBlockType)responseSuccessBlock
                     callFailed:(ResponseUserDetailFailedBlockType)responseFailedBlock;


+ (void)callIdentificationCloseWindw ;

+ (UIViewController *)findViewControllerWithClassName:(NSString *)className ;

@end


NS_ASSUME_NONNULL_END
