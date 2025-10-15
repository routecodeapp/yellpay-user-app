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

/**
 * RoutePayメインメソッドクラス
 */
@interface RouteAuth : NSObject
+ (void)callAuthRegisterViewController:(UIViewController *)viewController
                        domainName:(NSString*)domainName
                       callSuccess:(ResponseAuthRegisterSuccessBlockType)responseSuccessBlock
                        callFailed:(ResponseAuthRegisterFailedBlockType)responseFailedBlock;

+ (void)callAuthApprovalViewController:(UIViewController *)viewController
                        domainName:(NSString*)domainName
                        callSuccess:(ResponseAuthApprovalSuccessBlockType)responseSuccessBlock
                         callFailed:(ResponseAuthApprovalFailedBlockType)responseFailedBlock;

+ (void)callAuthUrlSchemeUrlType:(NSInteger)urlType
                  providerId:(NSString*)providerId
                   waitingId:(NSString*)waitingId
              viewController:(UIViewController *)viewController
                  domainName:(NSString*)domainName
                 callSuccess:(ResponseAuthUrlSchemeSuccessBlockType)responseSuccessBlock
                  callFailed:(ResponseAuthUrlSchemeFailedBlockType)responseFailedBlock;

// unid自動認証 鍵登録
+ (void)callAutoAuthRegisterDomainName:(NSString *)domainName
                                 serviceId:(NSString *)serviceId
                                  userInfo:(NSString *)userInfo
                               callSuccess:(ResponseAutoAuthRegisterSuccessBlockType)responseAutoAuthRegisterSuccess
                                callFailed:(ResponseAutoAuthRegisterFailedBlockType)responseAutoAuthRegisterFailed;

// unid自動認証 ログイン認証
+ (void)callAutoAuthApprovalDomainName:(NSString *)domainName
                                 serviceId:(NSString *)serviceId
                               callSuccess:(ResponseAutoAuthApprovalSuccessBlockType)responseAutoAuthApprovalSuccess
                                callFailed:(ResponseAutoAuthApprovalFailedBlockType)responseAutoAuthApprovalFailed;

@end


NS_ASSUME_NONNULL_END
