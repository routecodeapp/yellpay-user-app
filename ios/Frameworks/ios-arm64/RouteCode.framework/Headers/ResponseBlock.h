//
//  ResponseBlock.h
//  RouteCode
//
//  Created by PLATFIELD INC.
//


#ifndef ResponseBlock_h
#define ResponseBlock_h

/***
 * ユーザー情報生成レスポンスブロックス
 */
typedef void  (^ResponseInitialUuidSuccessBlockType)(NSString *uuid, int userNo);
typedef void  (^ResponseInitialUuidFailedBlockType)(int status, NSError *error);

/***
 * カード登録レスポンスブロックス
 */
typedef void  (^ResponseCardRegistSuccessBlockType)(NSString *uuid, int userNo);
typedef void  (^ResponseCardRegistFailedBlockType)(int status, NSError *error);

/***
 * ユーザー情報登録レスポンスブロックス
 */
typedef void  (^ResponseUserDetailSuccessBlockType)(void);
typedef void  (^ResponseUserDetailFailedBlockType)(int status, NSError *error);

/***
 * 決済レスポンスブロックス
 */
typedef void  (^ResponsePaymentSuccessBlockType)(NSString *uuid, int userNo);
typedef void  (^ResponsePaymentFailedBlockType)(int status, NSError *error);

typedef void  (^ResponseInitialUserIdSuccessBlockType)(NSString *userId);
typedef void  (^ResponseInitialUserIdFailedBlockType)(int status, NSError *error);

typedef void  (^ResponseGetAccessTokenSuccessBlockType)(NSString *userId);
typedef void  (^ResponseGetAccessTokenFailedBlockType)(int status, NSError *error);

typedef void  (^ResponseGetUserInfoSuccessBlockType)(NSArray *certificateInfos);
typedef void  (^ResponseGetUserInfoFailedBlockType)(int status, NSError *error);

typedef void  (^ResponseStartCertificateSendSuccessBlockType)(void);
typedef void  (^ResponseStartCertificateSendFailedBlockType)(int status, NSError *error);

typedef void  (^ResponseViewCertificateExaminingSuccessBlockType)(NSArray *certificateInfos);
typedef void  (^ResponseViewCertificateExaminingFailedBlockType)(int status, NSError *error);

typedef void  (^ResponseViewCertificateRejectedSuccessBlockType)(NSArray *certificateInfos);
typedef void  (^ResponseViewCertificateRejectedFailedBlockType)(int status, NSError *error);

typedef void  (^ResponseViewCertificateSuccessBlockType)(void);
typedef void  (^ResponseViewCertificateFailedBlockType)(int status, NSError *error);

typedef void  (^ResponseGetTicketUrlSuccessBlockType)(NSString *urAddress);
typedef void  (^ResponseGetTicketUrlFailedBlockType)(int status, NSError *error);

typedef void  (^ResponseCardSelectSuccessBlockType)(NSDictionary *card);
typedef void  (^ResponseCardSelectFailedBlockType)(int status, NSError *error);


typedef void  (^ResponseMainCardSettingSuccessBlockType)(NSDictionary *card);
typedef void  (^ResponseMainCardSettingFailedBlockType)(int status, NSError *error);

typedef void  (^ResponseGetMainCreditCardSuccessBlockType)(NSDictionary *card);
typedef void  (^ResponseGetMainCreditCardFailedBlockType)(int status, NSError *error);

typedef void  (^ResponsePayHistorySuccessBlockType)(NSString *payUserId);
typedef void  (^ResponsePayHistoryFailedBlockType)(int status, NSError *error);

typedef void  (^ResponseGetNotificationSuccessBlockType)(NSInteger lastUpdateNotification , NSArray *notifications);
typedef void  (^ResponseGetGetNotificationFailedBlockType)(int status, NSError *error);

typedef void  (^ResponseSaveDeviceTokenSuccessBlockType)(NSInteger status);
typedef void  (^ResponseSaveDeviceTokenFailedBlockType)(int status, NSError *error);



typedef void  (^ResponseGetPayStatusSuccessBlockType)(NSString *receiptCode, NSString *waitingCode,  NSArray *notifications);
typedef void  (^ResponseGetGetPayStatusFailedBlockType)(int status, NSError *error);


typedef void  (^ResponseWebViewSuccessBlockType)(NSInteger status);
typedef void  (^ResponseWebViewFailedBlockType)(int status, NSError *error);

typedef void  (^ResponseGetInformationSuccessBlockType)(NSDictionary* userInfo,NSDictionary* alert,NSArray *bannerInformation ,NSInteger lastUpdateNotification , NSArray *notifications);
typedef void  (^ResponseGetInformationFailedBlockType)(int status, NSError *error);

typedef void  (^ResponseGetConfirmLimitAmountSuccessBlockType)(NSDictionary* userInfo,NSDictionary* alert);
typedef void  (^ResponseGetConfirmLimitAmountFailedBlockType)(int status, NSError *error);


// routeAuth用

typedef void  (^ResponseAuthRegisterSuccessBlockType)(int status);
typedef void  (^ResponseAuthRegisterFailedBlockType)(int status, NSError *error);

typedef void  (^ResponseAuthApprovalSuccessBlockType)(int status);
typedef void  (^ResponseAuthApprovalFailedBlockType)(int status, NSError *error);

typedef void  (^ResponseAuthUrlSchemeSuccessBlockType)(int status);
typedef void  (^ResponseAuthUrlSchemeFailedBlockType)(int status, NSError *error);

// unid自動認証 鍵登録コールバック
typedef void  (^ResponseAutoAuthRegisterSuccessBlockType)(int status);
typedef void  (^ResponseAutoAuthRegisterFailedBlockType)(int status, NSError *error);

// unid自動認証 ログイン認証コールバック
typedef void  (^ResponseAutoAuthApprovalSuccessBlockType)(int status, NSString *userInfo);
typedef void  (^ResponseAutoAuthApprovalFailedBlockType)(int status, NSError *error);


#endif /* ResponseBrock_h */
