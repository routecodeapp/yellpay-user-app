//
//  Dialog.h
//  RouteCodeTest
//
//  Created by GoYamada on 2023/07/28.
//

#import <Foundation/Foundation.h>

#ifndef TEST_APPLICATION
// SDK用
#import <RouteCode/ResponseBlock.h>

#else
// テストアプリケーション用
#import "ResponseBlock.h"

#endif

@class UIImage;
@class UIViewController;

NS_ASSUME_NONNULL_BEGIN

typedef void  (^ResponseDialogBlockType)(long select);

@interface Util : NSObject
+ (void)dialogTitle:(NSString *)title
              image:(UIImage *)image
          imageSize:(CGSize)imageSize
            message:(NSString *)message
       cancelButton:(NSString *)cancelButton
  selectButtonArray:(NSArray *)selectButtonArray
     viewController:(UIViewController *)viewController
responseDialogBlock:(ResponseDialogBlockType)responseDialogBlock;

+ (void)dialogLRTitle:(NSString *)title
                image:(UIImage *)image
            imageSize:(CGSize)imageSize
              message:(NSString *)message
         cancelButton:(NSString *)cancelButton
    selectButtonArray:(NSArray *)selectButtonArray
       viewController:(UIViewController *)viewController
  responseDialogBlock:(ResponseDialogBlockType)responseDialogBlock;

+ (void)dialogTitle:(NSString *)title
              image:(UIImage *)image
          imageSize:(CGSize)imageSize
            message:(NSString *)message
  selectButtonArray:(NSArray *)selectButtonArray
     viewController:(UIViewController *)viewController
responseDialogBlock:(ResponseDialogBlockType)responseDialogBlock;

+ (void)dialogTitle:(NSString *)title
            message:(NSString *)message
       cancelButton:(NSString *)cancelButton
  selectButtonArray:(NSArray *)selectButtonArray
     viewController:(UIViewController *)viewController
responseDialogBlock:(ResponseDialogBlockType)responseDialogBlock;


+ (void)dialogTitle:(NSString *)title
            message:(NSString *)message
       cancelButton:(NSString *)cancelButton
           okButton:(NSString *)okButton
     viewController:(UIViewController *)viewController
responseDialogBlock:(ResponseDialogBlockType)responseDialogBlock;

+ (void)dialogTitle:(NSString *)title
            message:(NSString *)message
           okButton:(NSString *)okButton
     viewController:(UIViewController *)viewController
responseDialogBlock:(ResponseDialogBlockType)responseDialogBlock;


+ (void)dialogTitle:(NSString *)title
           okButton:(NSString *)okButton
     viewController:(UIViewController *)viewController
responseDialogBlock:(ResponseDialogBlockType)responseDialogBlock;


+ (void)   dialogTitle:(NSString *)title
selectImageButtonArray:(NSArray *)selectImageButtonArray
              okButton:(NSString *)okButton
        viewController:(UIViewController *)viewController
   responseDialogBlock:(ResponseDialogBlockType)responseDialogBlock;

+ (void)dialogTitle:(NSString *)title
            message:(NSString *)message
     viewController:(UIViewController *)viewController;

+ (void)indicatorStart:(NSString *)message view:(UIView *)view;

+ (void)indicatorStart:(NSString *)message viewController:(UIViewController *)viewController;

+ (void)indicatorStartTitle:(NSString *)title message:(NSString *)message view:(UIView *)view;

+ (void)indicatorStartTitle:(NSString *)title message:(NSString *)message viewController:(UIViewController *)viewController;

+ (void)indicatorStop:(UIView *)view;

+ (void)indicatorStopViewController:(UIViewController *)viewController;

+ (BOOL)addSkipBackupAttributeToItemAtURL:(NSURL *)URL;


+ (void)openWebTitle:(NSString *)title
           urlString:(NSString *)urlString
      viewController:(UIViewController *)viewController
         callSuccess:(ResponseWebViewSuccessBlockType)responseWebViewSuccessBlock
          callFailed:(ResponseWebViewFailedBlockType)responseWebViewFailedBlock ;

+ (void)openWebTitle:(NSString *)title
           urlString:(NSString *)urlString
navigationController:(UINavigationController *)navigationController
         callSuccess:(ResponseWebViewSuccessBlockType)responseWebViewSuccessBlock
          callFailed:(ResponseWebViewFailedBlockType)responseWebViewFailedBlock ;

+ (void)openWebPostTitle:(NSString *)title
               urlString:(NSString *)urlString
                postData:(NSString *)postData
          viewController:(UIViewController *)viewController
             callSuccess:(ResponseWebViewSuccessBlockType)responseWebViewSuccessBlock
              callFailed:(ResponseWebViewFailedBlockType)responseWebViewFailedBlock ;

+ (void)openWebPostTitle:(NSString *)title
               urlString:(NSString *)urlString
                postData:(NSString *)postData
    navigationController:(UINavigationController *)navigationController
             callSuccess:(ResponseWebViewSuccessBlockType)responseWebViewSuccessBlock
              callFailed:(ResponseWebViewFailedBlockType)responseWebViewFailedBlock ;


+ (NSError *)makeError:(NSInteger)errorCode
          errorMassage:(NSString *)errorMassage ;
@end

NS_ASSUME_NONNULL_END
