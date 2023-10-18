# Aauti Payment Gateway

# Groovy TechnoWeb Pvt. Ltd.

- It is for both the platforms iOS and Android

![](https://img.shields.io/badge/os-android-green) ![](https://img.shields.io/badge/os-iOS-blue)

# Installation

`npm install react-native-aauti-pay`
`yarn add react-native-aauti-pay`

### Manual installation

##### You need to manually installed below plugins.

- [react-native-paper](https://www.npmjs.com/package/react-native-paper)
- [react-native-inappbrowser-reborn](https://www.npmjs.com/package/react-native-inappbrowser-reborn)
- [react-native-reanimated](https://www.npmjs.com/package/react-native-reanimated)
- [react-native-google-pay](https://www.npmjs.com/package/react-native-google-pay)
- [@stripe/stripe-react-native](https://www.npmjs.com/package/@stripe/stripe-react-native)

##### Enable Android Pay in your Manifest

To enable Google Pay in your app, you need to add the following Google Pay API meta-data element to the `<application>` element of your project's AndroidManifest.xml file.

```xml
<meta-data
    android:name="com.google.android.gms.wallet.api.enabled"
    android:value="true" />
```

Please go through once with [react-native-inappbrowser-reborn](https://www.npmjs.com/package/react-native-inappbrowser-reborn?activeTab=readme) documentation

##### Authentication Flow using Deep Linking

For Deep linking integration you can checkout [Deep Linking](https://reactnavigation.org/docs/deep-linking/) documentation

In order to redirect back to your application from a web browser, you must specify a unique URI to your app. To do this, add below code to your `AndroidManifest` file.

- Enable deep linking (Android) - AndroidManifest.xml

```
<activity
  ...
  android:launchMode="singleTask">
  <intent-filter>
      <action android:name="android.intent.action.VIEW" />
      <category android:name="android.intent.category.DEFAULT" />
      <category android:name="android.intent.category.BROWSABLE" />
      <data android:scheme="intent" android:host="aauti-pay" />
  </intent-filter>
</activity>
```

- Enable deep linking (iOS) - Info.plist

```
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>intent</string>
    </array>
  </dict>
</array>
```

## Usage

```
# Import this line
import PaymentAggregator from “react-native-aauti-pay”;

# Pass data in an object like this
# All parameters must be same as below and its mandatory
const [change, setChange] = useState(""); // this state is for passing the value via webhook
const pay_data = {
	"name": ‘Name of the payer',
	"email": Email of the payer,
	"amount": Amount to be paid in Number,
	"country_code": Two digit country code,
	"app_token": 'unique application token',
	"currency": "currency short code", // INR, USD, AUD, CAD, GBP, etc.
	"transaction_code": "unique transaction id for payment",
};


# Usage of the plugin
 <PaymentAggregator
          paymentData={pay_data}
		  onButtonClick={() => {
			// here is your main button click in this you do for opening a payment modal bu passing open in injectedMessage
		  }}
          onPaymentDone={() => {
			// Code here it will give you a response when payment is completed
          }}
          injectedMessage={change} // this prop is also for closing the modal and it is compulsory
          onModalClose={() => {}} // this prop is also for closing the modal
          PaymentType = "", //require => one_time, subscription
        />

# It must be mandatory to pass "open" message in injectedMessage for opening the modal
# It must be mandatory to pass "close" message in injectedMessage for closing the modal

```

Parameters you can use in this is below:

For close icons we have to use react-native-vector-icons/AntDesign only.

| Param Name               | Type     | Default Value                                                                                                                                                                                                                                                    | Required | Description                                                                                                                                                                                         |
| ------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PaymentType              | String   | ''                                                                                                                                                                                                                                                               | Yes      | For Payment Type for ex: one_time => one time payment, subscription => for subscription plan                                                                                                        |
| paymentData              | Object   | { name: ‘Name of the payer', email: Email of the payer, amount: Amount to be paid, country_code: country code, app_token: 'unique app token', currency: "short code of your currency", transactionId: "Unique transaction id for payment", mode: "live or test"} | Yes      | Pass data in this format for payment process                                                                                                                                                        |
| appCharges               | Array    | []                                                                                                                                                                                                                                                               | No       | Pass the app charges in array with changes. You'll get default app array in aauti portal.                                                                                                           |
| onPaymentDone            | Function | () => {}                                                                                                                                                                                                                                                         | Yes      | When you done payment this function will trigger and you get response back in this function.                                                                                                        |
| modalContainerStyles     | Object   | {}                                                                                                                                                                                                                                                               | No       | Modal container styles                                                                                                                                                                              |
| merchantIdentifier       | String   | 'merchant.com.app.saayampayment'                                                                                                                                                                                                                                 | Yes      | Enable Apple Pay for your app [ApplePay Guide](https://developer.apple.com/library/archive/ApplePay_Guide/Configuration.html) & pass merchant ID in this param. It is required to enable Apple Pay. |
| pluginURL                | String   | 'staging'                                                                                                                                                                                                                                                        | No       | Pass slug according to your server (`staging`, `dev`, `prodapi`)                                                                                                                                    |
| noCharge                 | Boolean  | false                                                                                                                                                                                                                                                            | No       | if this is true no `appCharges` will be applied                                                                                                                                                     |
| webViewStyles            | Object   | {}                                                                                                                                                                                                                                                               | No       | Webview container styles                                                                                                                                                                            |
| injectedMessage          | String   | Empty string                                                                                                                                                                                                                                                     | Yes      | it is for closing the modal via webhook calls                                                                                                                                                       |
| onModalClose             | Function | () => {}                                                                                                                                                                                                                                                         | No       | Closing the modal when state changes                                                                                                                                                                |
| buttonTitle              | String   | Aauti Pay                                                                                                                                                                                                                                                        | No       | Button Title                                                                                                                                                                                        |
| onButtonClick            | Function | () => {}                                                                                                                                                                                                                                                         | Yes      | If you want to something to be happen on this button click                                                                                                                                          |
| buttonTextStyle          | Object   | {}                                                                                                                                                                                                                                                               | No       | Button text styles                                                                                                                                                                                  |
| mainButtonContainerStyle | Object   | {}                                                                                                                                                                                                                                                               | No       | Main Button container styles                                                                                                                                                                        |
| loaderColor              | String   | white                                                                                                                                                                                                                                                            | No       | Loader color                                                                                                                                                                                        |
| loader                   | Boolean  | false                                                                                                                                                                                                                                                            | No       | Main button loader                                                                                                                                                                                  |
| isGradientButton         | Boolean  | false                                                                                                                                                                                                                                                            | No       | If you want gradient or multicolor button than you have to pass `true`                                                                                                                              |
| linearColorsName         | Array    | [ "red", "pink" ]                                                                                                                                                                                                                                                | No       | If you have enable `isGradientButton` and you want to change colors than you have to pass particular color name default is red. Like [ "red", "pink" ]                                              |
| startPosition            | Object   | { x: 0, y: 0.5 }                                                                                                                                                                                                                                                 | No       | Start position                                                                                                                                                                                      |
| endPosition              | Object   | { x: 1, y: 0.5 }                                                                                                                                                                                                                                                 | No       | End position                                                                                                                                                                                        |
| themeColor               | String   | '#F5F9FF'                                                                                                                                                                                                                                                        | No       | Theme color for whole plugin (Note:- Please add light color of your App theme color)                                                                                                                |
