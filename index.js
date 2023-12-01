/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking,
} from "react-native";
// InAppBrowser Integrated for Supporting Popups
import { InAppBrowser } from "react-native-inappbrowser-reborn";
import { isArray, isEmpty } from "lodash";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import PropTypes from "prop-types";

import styles from "./style";
import SubList from "./components/SubList";
import CustomSub from "./components/CustomSub";
import { getApiDataProgressPayment } from "./components/APIHelper";
import CardDetail from "./components/CardDetail";
import PaySuccess from "./components/PaySuccessPage";
import { currency_symbol } from "./components/staticData";
import Cbutton from "./components/CButton";
import {
  PlatformPay,
  StripeProvider,
  confirmPlatformPayPayment,
} from "@stripe/stripe-react-native";

const PaymentAgreegator = (props) => {
  // styling for whole component
  const deviceHeight = Dimensions.get("screen").height;
  const deviceWidth = Dimensions.get("screen").width;
  const IOS = Platform.OS === "ios";

  // Props for using in other pages
  const {
    PaymentType = "", //require => one_time, subscription, custom_subscription
    paymentData = {}, //require
    onPaymentDone = () => {},
    modalContainerStyles = {},
    webViewStyles = {},
    injectedMessage = "",
    onModalClose = () => {},
    merchantIdentifier = "merchant.com.saayam.saayampayment",
    appCharges = [],
    noCharge = false,
    pluginURL = "staging", //staging, dev, prodapi

    //Main button
    buttonTitle = "Aauti Pay",
    onButtonClick = () => {},
    loaderColor = "white",
    mainButtonContainerStyle = {},
    loader = false,
    buttonTextStyle = {},
    changeBtnText = "Pay",

    // For gradient
    isGradientButton = false,
    linearColorsName = ["#0BBCED", "#1252A5"],
    startPosition = { x: 0, y: 0.5 },
    endPosition = { x: 1, y: 0.5 },
    themeColor = "#F5F9FF",
  } = props;

  const liveUrl = `https://${pluginURL}.aautipay.com/plugin/`;
  // const liveUrl = 'http://192.168.0.126:3000/plugin/';

  const [webViewState, setWebViewState] = useState({
    modalBool: false,
    urlLink: "",
  });

  const [viewState, setViewState] = useState("");
  const [paySuccess, setPaySuccess] = useState(false);
  const [failMessage, setFailMessage] = useState("");
  const [subscriptionData, setSubscriptionData] = useState({});

  const [activeIndex, setActiveIndex] = useState([]);
  const [pageLoade, setPageLoader] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState([]);
  const [chargeData, setChargeData] = useState({});
  const [cardBrandSelect, setCardBrandSelect] = useState(null);
  const [isShow, setisShow] = useState("");

  const PeriodData = [
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  // clearing everytime when this component is open
  useEffect(() => {
    setWebViewState({ ...webViewState, modalBool: false, urlLink: "" });
  }, []);

  // Deep Linking to Get Back to the App
  useEffect(() => {
    const handleDeepLink = (event) => {
      const url = event.url;
      var regex = /[?&]([^=#]+)=([^&#]*)/g,
        params = {},
        match;
      while (!isEmpty(url) && (match = regex.exec(url))) {
        params[match[1]] = match[2];
      }
      // Check if the URL contains the specified pattern
      if (url.includes("payment_intent")) {
        checkStripePayment(url);
      } else if (url.includes("success") && !params?.use_url) {
        setPaySuccess("success");
        onPaymentDone();
        // Close the InAppBrowser
      } else if (url.includes("failure") && !params?.use_url) {
        setPaySuccess("fail", "Authentication failed");
        setTimeout(() => {
          setPaySuccess(false);
        }, 5000);
      }
      InAppBrowser.close();
    };
    Linking.addEventListener("url", handleDeepLink);

    // Cleanup
    return () => {
      // Linking.removeEventListener('url');
    };
  }, []);

  useEffect(() => {
    if (!paySuccess) {
      setisShow("");
    }
  }, [paySuccess]);

  async function getAccessToken() {
    setPageLoader(true);

    const data = {
      app_token: paymentData?.app_token,
      countryCode: paymentData?.country_code,
    };

    try {
      const response = await getApiDataProgressPayment(
        `${liveUrl}login`,
        "POST",
        data,
        chargeData?.auth_token
      );
      if (response?.status == false) {
        Alert.alert(
          "Error",
          response?.message || "Please try again. Something got wrong."
        );
        setPageLoader(false);
      } else {
        !isEmpty(appCharges)
          ? chargesApply(
              appCharges,
              response?.data?.auth_token,
              response?.data?.userData?.portal_mode,
              response?.data?.userData?.public_key
            )
          : getAppCharges(
              response?.data?.auth_token,
              response?.data?.userData?.id,
              response?.data?.userData?.portal_mode,
              response?.data?.userData?.public_key
            );
      }
    } catch (error) {
      setPageLoader(false);
      console.log("error:", error);
    }
  }

  async function getAppCharges(token, useID, mode, public_key) {
    fetch(`${liveUrl}get-app-charges/${useID}/${paymentData?.country_code}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data?.status) {
          chargesApply(data?.data, token, mode, public_key);
        } else {
          setPageLoader(false);
        }
        // Handle the response data here
      })
      .catch((error) => {
        // Handle any errors here
        setPageLoader(false);
      });
  }

  const chargesApply = (mainChargeData, token, mode, public_key) => {
    let sum_per = 0;
    let sum_inc_per = 0;

    const filExc = isArray(mainChargeData)
      ? mainChargeData?.filter((V) => V.type === "exclusive")
      : [];

    const filInc = isArray(mainChargeData)
      ? mainChargeData?.filter((V) => V.type === "inclusive")
      : [];

    isArray(filExc) &&
      !isEmpty(filExc) &&
      filExc.forEach((v) => {
        if (v.slug !== "payment_gateway_fee") {
          sum_per = sum_per + v.value;
        }
      });
    const amountToAdd = (sum_per * paymentData?.amount) / 100;

    isArray(filInc) &&
      !isEmpty(filInc) &&
      filInc.forEach((v) => {
        if (v.slug !== "payment_gateway_fee") {
          sum_inc_per = sum_inc_per + v.value;
        }
      });
    const amountToMin = (sum_inc_per * paymentData?.amount) / 100;

    const isPaymentGateWay =
      isArray(filExc) &&
      !isEmpty(filExc) &&
      filExc.find((v) => v.slug === "payment_gateway_fee");

    const chargeData1 = {
      isPaymentGateWay: !isEmpty(isPaymentGateWay),
      exclusive_Data: filExc,
      withChargeAmount: paymentData?.amount + amountToAdd,
      withoutChargeAmount: paymentData?.amount - amountToMin,
      auth_token: token,
      mainChargeData: mainChargeData,
      amountToAdd: amountToAdd,
      mode: mode,
      public_key: public_key,
    };
    setChargeData(chargeData1);
    getPaymentOption(token, paymentData?.amount + amountToAdd, mode);
  };

  async function checkStripePayment(url) {
    var regex = /[?&]([^=#]+)=([^&#]*)/g,
      params = {},
      match;
    while (!isEmpty(url) && (match = regex.exec(url))) {
      params[match[1]] = match[2];
    }
    const stripeSecretKey = params?.key;
    fetch(
      `https://api.stripe.com/v1/payment_intents/${params?.payment_intent}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data?.status == "succeeded") {
          setPaySuccess("success");
          onPaymentDone();
        } else {
          setPaySuccess("fail");
          setTimeout(() => {
            setPaySuccess(false);
          }, 5000);
        }
        // Handle the response data here
      })
      .catch((error) => {
        // Handle any errors here
      });
  }

  useEffect(() => {
    if (!webViewState?.modalBool) {
      onModalClose();
      setViewState("");
      setSubscriptionData({});
      setPaymentMethod([]);
      setPaySuccess(false);
      setActiveIndex([]);
      setisShow("");
    }
    if (webViewState?.modalBool) {
      setPaySuccess(false);
    }
  }, [webViewState]);

  useEffect(() => {
    if (injectedMessage === "open") {
      setWebViewState({
        ...webViewState,
        modalBool: true,
        urlLink: "",
      });
      getAccessToken();
    }

    if (injectedMessage === "close") {
      onMessageChange();
    }
  }, [injectedMessage]);

  useEffect(() => {
    if (!isEmpty(PaymentType)) {
      if (PaymentType === "one_time" || PaymentType === "subscription") {
        setViewState("cardDetail");
      } else if (PaymentType === "custom_subscription") {
        setViewState("custom");
      }
    }
  }, [webViewState?.modalBool]);

  const onMessageChange = () => {
    setWebViewState({
      ...webViewState,
      modalBool: false,
      urlLink: "",
    });
  };

  async function getSubscriptionList() {
    const data = {
      name: paymentData?.name,
      transaction_code: paymentData?.transaction_code,
      app_token: paymentData?.app_token,
      mode: chargeData?.mode,
      country_code: paymentData?.country_code,
      currency: paymentData?.currency,
      payment_method: "card",
      // card_type: cardTypeSelect,
      card_brand: cardBrandSelect,
    };

    try {
      const response = await getApiDataProgressPayment(
        `${liveUrl}subscription-plan`,
        "POST",
        JSON.stringify(data),
        chargeData?.auth_token
      );
      if (response?.status == false) {
        Alert.alert(
          "Error",
          response?.message || "Please try again. Something got wrong."
        );
      } else {
        setSubscriptionData(response);
        setViewState("sublist");
      }
    } catch (error) {
      console.log("error:", error);
    }
  }

  const getPaymentOption = (auth_token, amountToAdd, mode) => {
    try {
      fetch(
        `${liveUrl}payment-options/${
          paymentData.country_code
        }?method=${""}&mode=${mode}&amount=${
          noCharge ? paymentData?.amount : amountToAdd
        }&currency=${paymentData?.currency}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${auth_token}`,
            "Content-type": "application/json; charset=UTF-8",
          },
        }
      )
        .then((response) => response.json())
        .then((response) => {
          if (response?.status) {
            setPaymentMethod(response?.data);
            setActiveIndex(response?.minimum_index);
            setPageLoader(false);
          } else {
            if (
              response?.statusCode === 401 &&
              response?.message ===
                "Unauthorized. Access token is missing or invalid."
            ) {
            }
            setPageLoader(false);
          }
        })
        .catch((err) => {
          console.log(err.message);
          setPageLoader(false);
        });
    } catch (error) {
      setPageLoader(false);
      console.log("ERRRRR", error);
    }
  };

  return (
    <View style={styles.root}>
      <Cbutton {...props} />
      <Modal
        animationType="slide"
        presentationStyle="overFullScreen"
        transparent={true}
        statusBarTranslucent
        visible={webViewState.modalBool}
        onRequestClose={() => {
          setWebViewState({ ...webViewState, modalBool: false, urlLink: "" });
        }}
      >
        <View style={styles.modalWrapper}>
          <View style={[styles.modalHeader, { backgroundColor: themeColor }]}>
            {/* Close container for modal */}
            <View style={styles.centerTitle}>
              <Text style={[styles.centerTitleText, { color: "#1D1D1D" }]}>
                {`Make Payment of ${
                  currency_symbol[paymentData?.currency]
                }${paymentData.amount?.toFixed(2)}`}
              </Text>

              {paySuccess !== "loading" && (
                <View style={[styles.actionBtn, { alignItems: "center" }]}>
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                      setWebViewState({
                        ...webViewState,
                        modalBool: false,
                        urlLink: "",
                      });
                    }}
                  >
                    <AntDesign name="closecircleo" size={24} color={"red"} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            {paySuccess === "loading" ? null : isEmpty(isShow?.toString()) ? (
              <Text style={[styles.moneyText, { marginTop: 4 }]}>
                Select payment source
              </Text>
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setisShow("");
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 4,
                  width: 200,
                }}
              >
                <MaterialIcons
                  name="arrow-back"
                  style={{ fontSize: 18, opacity: 0.5 }}
                  color="#1D1D1D"
                />
                <Text style={styles.moneyText}>Click here to go back</Text>
              </TouchableOpacity>
            )}
          </View>
          <View
            style={[
              {
                height: deviceHeight * (IOS ? 0.8 : 0.76),
              },
              modalContainerStyles,
            ]}
          >
            <KeyboardAvoidingView behavior="padding">
              <View
                style={{
                  height: "100%",
                  width: "100%",
                  backgroundColor: themeColor,
                }}
              >
                {/* <CardDetails /> */}
                {paySuccess ? (
                  <PaySuccess
                    {...props}
                    responseType={paySuccess}
                    message={failMessage}
                  />
                ) : (
                  <>
                    {pageLoade ? (
                      <View
                        style={{
                          height: "100%",
                          justifyContent: "center",
                        }}
                      >
                        <ActivityIndicator
                          size={"large"}
                          animating
                          color={"#0068EF"}
                        />
                      </View>
                    ) : isEmpty(PaymentType) ||
                      PaymentType === "subscription" ||
                      (PaymentType !== "one_time" &&
                        PaymentType !== "custom_subscription") ? (
                      <View
                        style={{
                          display: "flex",
                          alignItems: "center",
                          height: 400,
                          justifyContent: "center",
                          marginTop: 20,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 20,
                            textAlign: "center",
                          }}
                        >
                          {PaymentType === "subscription"
                            ? "Coming Soon ......."
                            : "Invalid Payment Type"}
                        </Text>
                        <MaterialIcons
                          name={"error"}
                          size={50}
                          style={{ marginTop: 10 }}
                          color="red"
                        />
                        <View
                          style={{
                            width: "100%",
                            paddingHorizontal: 20,
                          }}
                        >
                          <Cbutton
                            {...props}
                            buttonTitle="Ok"
                            onButtonClick={() => {
                              setWebViewState({
                                ...webViewState,
                                modalBool: false,
                                urlLink: "",
                              });
                            }}
                          />
                        </View>
                      </View>
                    ) : viewState === "sublist" ? (
                      <SubList subscriptionData={subscriptionData} />
                    ) : viewState === "custom" ? (
                      <CustomSub paymentData={paymentData} />
                    ) : viewState === "cardDetail" ? (
                      <CardDetail
                        {...props}
                        isShow={isShow}
                        setisShow={(v) => {
                          setisShow(v);
                        }}
                        onPaymentDone={onPaymentDone}
                        paymentMethod={paymentMethod}
                        liveUrl={liveUrl}
                        webViewStyles={webViewStyles}
                        injectedMessage={injectedMessage}
                        activeIndex={activeIndex}
                        chargeData={chargeData}
                        setPaySuccess={(type, message) => {
                          setPaySuccess(type);
                          setFailMessage(message);
                        }}
                      />
                    ) : null}
                  </>
                )}
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

PaymentAgreegator.propTypes = {
  linearColorsName: PropTypes.array,
  startPosition: PropTypes.object,
  endPosition: PropTypes.object,
  buttonTitle: PropTypes.string,
  loader: PropTypes.bool,
  mainButtonContainerStyle: PropTypes.object,
  themeColor: PropTypes.string,
  noCharge: PropTypes.bool,
  merchantIdentifier: PropTypes.string,
  appCharges: PropTypes.array,
  pluginURL: PropTypes.string,
  changeBtnText: PropTypes.string,
};

PaymentAgreegator.defaultProps = {
  linearColorsName: ["#0BBCED", "#1252A5"],
  startPosition: { x: 0, y: 0.5 },
  endPosition: { x: 1, y: 0.5 },
  buttonTitle: "Aauti Pay",
  loader: false,
  mainButtonContainerStyle: {},
  themeColor: "#F5F9FF",
  noCharge: false,
  merchantIdentifier: "merchant.com.saayam.saayampayment",
  appCharges: [],
  pluginURL: "staging",
  changeBtnText: "Pay",
};

export default PaymentAgreegator;
