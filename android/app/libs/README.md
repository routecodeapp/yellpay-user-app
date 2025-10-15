# SDK Libraries Directory

This directory should contain the RouteCode YellPay SDK files:

- `routecode-sdk.aar` (or similar .aar file)
- Any additional JAR dependencies

## Setup Instructions

1. Obtain the RouteCode YellPay SDK `.aar` file from the SDK provider
2. Place it in this directory
3. The build.gradle is already configured to include all .aar and .jar files from this directory

## Note

The Android native module has been created, but requires the actual SDK library files to function. Without these files, the app will still crash when trying to use YellPay methods.

Contact the SDK provider to obtain the required library files.
