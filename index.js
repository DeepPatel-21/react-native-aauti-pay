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
import { isEmpty } from "lodash";
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

// this API call will give you which payment we have to do
// const liveUrl = 'https://staging.aautipay.com/plugin/';
// const liveUrl = 'http://192.168.0.126:3000/plugin/';
// const liveUrl = 'http://192.168.0.125:3000/plugin/';
const liveUrl = "https://dev.aautipay.com/plugin/";

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
    isPlateformfeeIncluded = false,
    merchantIdentifier = "com.app.saayamdemo",

    //Main button
    buttonTitle = "Aauti Pay",
    onButtonClick = () => {},
    loaderColor = "white",
    mainButtonContainerStyle = {},
    loader = false,
    buttonTextStyle = {},

    // For gradient
    isGradientButton = false,
    linearColorsName = ["#0BBCED", "#1252A5"],
    startPosition = { x: 0, y: 0.5 },
    endPosition = { x: 1, y: 0.5 },
    themeColor = "#F5F9FF",
  } = props;

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
      // Check if the URL contains the specified pattern
      if (url.includes("payment_intent")) {
        checkStripePayment(url);
      } else if (url.includes("success")) {
        console.log("Payment Done.");
        setPaySuccess("success");
        onPaymentDone();
        // Close the InAppBrowser
      } else if (url.includes("failure")) {
        setPaySuccess("fail");
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
        const chargeData1 = {
          service_type: response?.data?.userData?.service_type,
          service_charge: response?.data?.userData?.service_charge,
          auth_token: response?.data?.auth_token,
        };
        setChargeData(chargeData1);
        getPaymentOption(
          response?.data?.userData?.service_charge,
          response?.data?.auth_token,
          response?.data?.userData?.service_type
        );
      }
    } catch (error) {
      setPageLoader(false);
      console.log("error:", error);
    }
  }

  async function checkStripePayment(url) {
    const stripeSecretKey =
      "sk_test_51Lp74WLvsFbqn13Lg5HIXlLhey0yNEaDiJOHzBxjRweXf4DAiE6VSriOhEi71XB2WODBO0E19ZQbRsCoYMlgoGMY00kZzA0HJ6";

    var regex = /[?&]([^=#]+)=([^&#]*)/g,
      params = {},
      match;
    while ((match = regex.exec(url))) {
      params[match[1]] = match[2];
    }
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
      mode: paymentData?.mode,
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

  const getPaymentOption = (chargePer, auth_token, service_type) => {
    const amountToAdd = (chargePer * paymentData?.amount) / 100;

    try {
      fetch(
        `${liveUrl}payment-options/${
          paymentData.country_code
        }?method=${""}&mode=${paymentData?.mode}&amount=${
          service_type === "inclusive"
            ? paymentData?.amount
            : paymentData?.amount + amountToAdd
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
    <StripeProvider
      publishableKey="pk_test_51Lp74WLvsFbqn13LVwHWLWuHOMzx3Jyn8dZSAVjGf9oIetpNOgvbbMMRjp5WRRheejXuSftYmD9uoebv2y0Rdm1h003RC3YCS6"
      merchantIdentifier={`merchant.${merchantIdentifier}`}
    >
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
    </StripeProvider>
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
  isPlateformfeeIncluded: PropTypes.bool,
  merchantIdentifier: PropTypes.string,
};

PaymentAgreegator.defaultProps = {
  linearColorsName: ["#0BBCED", "#1252A5"],
  startPosition: { x: 0, y: 0.5 },
  endPosition: { x: 1, y: 0.5 },
  buttonTitle: "Aauti Pay",
  loader: false,
  mainButtonContainerStyle: {},
  themeColor: "#F5F9FF",
  isPlateformfeeIncluded: false,
  merchantIdentifier: "com.app.saayamdemo",
};

export default PaymentAgreegator;
