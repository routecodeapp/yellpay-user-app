//
//  RouteCode.h
//  RouteCode
//
//  Created by PLATFIELD INC.
//

#import <Foundation/Foundation.h>

//! Project version number for RouteCode.
FOUNDATION_EXPORT double RouteCodeVersionNumber;

//! Project version string for RouteCode.
FOUNDATION_EXPORT const unsigned char RouteCodeVersionString[];

#ifndef TEST_APPLICATION
// SDK用
    #import <RouteCode/RoutePay.h>
    #import <RouteCode/RouteAuth.h>
    #import <RouteCode/Util.h>
#else
// テストアプリケーション用
//    #import <RoutePay.h>
//    #import <RouteAuth.h>
//    #import <Util.h>
#import "RoutePay.h"
#import "RouteAuth.h"
#import "Util.h"

#endif

//#import "UserInfo.h"

