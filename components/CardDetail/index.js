/* eslint-disable react-native/no-inline-styles */
import _, { isEmpty, isArray, isUndefined, isNull } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  ScrollView,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import CryptoJS from "react-native-crypto-js";
import { BaseColors } from "../theme";
import TabSwitch from "../TabSwitch";
import CustomCard from "../CustomCard";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { WebView } from "react-native-webview";
import { getApiDataProgressPayment } from "../APIHelper";
import InAppBrowser from "react-native-inappbrowser-reborn";
import styles from "./style";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeOut,
  FadeOutLeft,
  FadeOutUp,
} from "react-native-reanimated";
import DForm from "../DynamicForm";
import { GooglePay } from "react-native-google-pay";
import {
  PlatformPay,
  confirmPlatformPayPayment,
  isPlatformPaySupported,
} from "@stripe/stripe-react-native";
import { Card } from "react-native-paper";
import { currency_symbol } from "../staticData";
import RBSheet from "react-native-raw-bottom-sheet";
import LinearGradient from "react-native-linear-gradient";

export default function CardDetail(props) {
  const {
    onPaymentDone,
    paymentData,
    paymentMethod,
    webViewStyles,
    liveUrl,
    injectedMessage,
    setPaySuccess,
    activeIndex,
    isShow,
    setisShow,
    chargeData,
  } = props;

  const deviceHeight = Dimensions.get("screen").height;
  const deviceWidth = Dimensions.get("screen").width;
  const webviewRef = useRef(null);
  const customCardRef = useRef(null);
  const bottomSheetRef = useRef(null);
  const horizontalScrollRef = useRef(null);

  const [showCustom, setShowCustom] = useState("");
  const [cardBrandSelect, setCardBrandSelect] = useState(null);
  const [tabSelected, setTabSelected] = useState({});
  const [subLoader, setSubLoader] = useState(false);
  const [contentLoade, setContentLoader] = useState(false);

  const [longPressData, setLongPressData] = useState([]);

  const [paymentType, setPaymentType] = useState([]);
  const [url, setURL] = useState("");
  const [isApplePaySupported, setIsApplePaySupported] = useState(false);

  const [hideArrow, setHideArrow] = useState("top");

  const SMALL_BOX_WIDTH = 120;
  const IOS = Platform.OS === "ios";

  const isCard = paymentMethod?.filter(
    (item) => item?.type === "card" && !isEmpty(item?.charge_object)
  );
  const isBank = paymentMethod?.filter(
    (item) => item?.type === "bank" && !isEmpty(item?.charge_object)
  );
  const isOther = paymentMethod?.filter(
    (item) => item?.type === "digital wallet" && !isEmpty(item?.charge_object)
  );

  const amountToAdd = Number(
    ((chargeData?.service_charge * paymentData?.amount) / 100)?.toFixed(2)
  );

  useEffect(() => {
    Platform.OS === "android" &&
      GooglePay.setEnvironment(GooglePay.ENVIRONMENT_TEST);
  }, []);

  useEffect(() => {
    if (!isEmpty(isShow?.toString())) {
      setTimeout(() => {
        scrollToIndex();
      }, 100);
    }

    if (isEmpty(isShow?.toString())) {
      setTabSelected({});
    }
  }, [isShow]);

  const scrollToIndex = () => {
    if (horizontalScrollRef.current) {
      horizontalScrollRef.current.scrollTo({
        x: isShow * SMALL_BOX_WIDTH,
        animated: true,
      });
    }
  };

  useEffect(() => {
    if (!isEmpty(paymentMethod) && contentLoade) {
      setContentLoader(false);
    }
  }, [paymentMethod]);

  useEffect(() => {
    if (IOS) {
      (async function () {
        setIsApplePaySupported(await isPlatformPaySupported());
      })();
    }
  }, [isPlatformPaySupported]);

  useEffect(() => {
    if (!isEmpty(tabSelected)) {
      if (tabSelected?.is_custom_checkout === 0) {
        // PaymentApiCall(tabSelected, 'sub');
      } else if (
        !isEmpty(isShow?.toString()) &&
        (paymentMethod[isShow]["payment_method.payment_method"] ===
          "Credit Card" ||
          paymentMethod[isShow]["payment_method.payment_method"] ===
            "Debit Card" ||
          paymentMethod[isShow]["payment_method.payment_method"] === "ACH") &&
        tabSelected?.is_custom_checkout == 1
      ) {
        setShowCustom("custom");
      } else {
        SaveOrder(tabSelected, "saveO");
      }
      setCardBrandSelect(tabSelected);
    }
  }, [tabSelected]);

  const getPaymentOption = (method, index) => {
    setContentLoader(true);
    try {
      fetch(
        `${liveUrl}payment-options/${paymentData.country_code}?method=${
          method ? method : ""
        }&mode=${paymentData?.mode}&amount=${
          paymentData?.amount + amountToAdd
        }&currency=${paymentData?.currency}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${chargeData?.auth_token}`,
            "Content-type": "application/json; charset=UTF-8",
          },
        }
      )
        .then((response) => response.json())
        .then((response) => {
          if (response?.status) {
            setPaymentType(response?.data);

            if (
              method &&
              paymentMethod[index]["payment_method.payment_method"] !==
                "Net Banking" &&
              paymentMethod[index]["payment_method.payment_method"] !== "Wallet"
            ) {
              setTabSelected(response?.data[0]);
            }

            setContentLoader(false);
          } else {
            if (
              response?.statusCode === 401 &&
              response?.message ===
                "Unauthorized. Access token is missing or invalid."
            ) {
            }
            setContentLoader(false);
          }
        })
        .catch((err) => {
          console.log(err.message);
          setContentLoader(false);
        });
    } catch (error) {
      setContentLoader(false);
      console.log("ERRRRR", error);
    }
  };

  async function paymentApi(data, code) {
    setSubLoader(true);
    let final_data = {
      amount: {
        amount: paymentData?.amount,
        final_amount: data?.charge_object?.charges_obj?.final_amount,
      },
    };

    // Encrypt
    let ciphertext = CryptoJS.AES.encrypt(
      JSON.stringify(final_data),
      "470cb677d807b1e0017c50b"
    ).toString();

    const Ddata = {
      data: ciphertext,
      order_code: code,
      is_new: 1,
    };

    try {
      const response = await getApiDataProgressPayment(
        `${liveUrl}custom-checkout`,
        "POST",
        JSON.stringify(Ddata),
        chargeData?.auth_token
      );
      if (isUndefined(response) || response?.status === false) {
        setPaySuccess("fail", response?.message);
        setTimeout(() => {
          setPaySuccess(false);
        }, 3000);
      } else {
        if (!isEmpty(data)) {
          if (
            paymentMethod["payment_method.payment_method"] === "Net Banking" ||
            paymentMethod["payment_method.payment_method"] === "Wallet"
          ) {
            setURL(response?.data?.redirect_url);
            setShowCustom("url");
          } else {
            // Let's open the In App Browser to handle Netbanking url
            const result = await InAppBrowser.open(
              response?.data.redirect_url,
              {
                // iOS Properties
                dismissButtonStyle: "cancel",
                preferredBarTintColor: "#000000",
                preferredControlTintColor: "white",
                readerMode: false,
                animated: true,
                modalPresentationStyle: "pageSheet",
                modalTransitionStyle: "coverVertical",
                modalEnabled: true,
                enableBarCollapsing: true,
                // Android Properties
                showTitle: false,
                toolbarColor: "#000000",
                secondaryToolbarColor: "black",
                navigationBarColor: "black",
                navigationBarDividerColor: "white",
                enableUrlBarHiding: true,
                enableDefaultShare: true,
                forceCloseOnRedirection: false,
                // Specify full animation resource identifier(package:anim/name)
                // or only resource name(in case of animation bundled with app).
                animations: {
                  startEnter: "slide_in_right",
                  startExit: "slide_out_left",
                  endEnter: "slide_in_left",
                  endExit: "slide_out_right",
                },
              }
            );
            if (result?.type === "cancel") {
              setTabSelected({});
              setPaySuccess("fail");
              setTimeout(() => {
                setPaySuccess(false);
              }, 3000);
            }
          }
        } else {
          setPaySuccess("success");
          onPaymentDone();
        }
      }
      setSubLoader(false);
    } catch (error) {
      setSubLoader(false);
      console.log("error:", error);
    }
  }

  async function SaveOrder(subData, type) {
    setPaySuccess("loading");
    try {
      const data = {
        name: paymentData?.name,
        amount: paymentData?.amount + amountToAdd,
        final_amount: subData?.charge_object?.charges_obj?.final_amount,
        app_token: paymentData?.app_token,
        country_id: subData?.country_id,
        currency: paymentData?.currency,
        mode: paymentData?.mode,
        payment_method_id: subData?.payment_method_id,
        payment_sub_method_id: subData?.payment_sub_method_id,
        transaction_code: paymentData?.transaction_code,
        gateway_code: subData?.charge_object?.gateway_code,
        gateway_id: subData?.gateway_id,
        email: paymentData?.email,
        service_type: chargeData?.service_type,
        base_amount: paymentData?.amount,
        charge_id: subData?.charge_object?.charges_obj?.id,
      };
      const response = await getApiDataProgressPayment(
        `${liveUrl}save-order`,
        "POST",
        JSON.stringify(data),
        chargeData?.auth_token
      );
      if (response?.status == false) {
        setPaySuccess("fail", response?.message);
        setTimeout(() => {
          setPaySuccess(false);
        }, 3000);
      } else {
        setTimeout(() => {
          if (type === "gPay") {
            googlePayCall(response?.code, subData);
          } else if (type === "aPay") {
            PaycallBack(response?.code, "", type, subData);
          } else {
            paymentApi(subData, response?.code);
          }
        }, 1000);
      }
    } catch (error) {
      console.log("error:", error);
    }
  }

  async function PaycallBack(code, token, type, subData) {
    try {
      const data = {
        token,
      };

      const response = await getApiDataProgressPayment(
        `${liveUrl}pay-callback/${code}`,
        "POST",
        type === "gPay" ? JSON.stringify(data) : {},
        chargeData?.auth_token
      );
      if (response?.status == false) {
        Alert.alert(
          "Error",
          response?.message || "Please try again. Something got wrong."
        );

        setPaySuccess("fail");
        setTimeout(() => {
          setPaySuccess(false);
        }, 2000);
      } else {
        if (type === "aPay") {
          applePay(subData, response?.data?.client_secret);
        } else {
          setPaySuccess("success");
          onPaymentDone();
        }
      }
    } catch (error) {
      setPaySuccess("fail");
      setTimeout(() => {
        setPaySuccess(false);
      }, 2000);
      console.log("error:", error);
    }
  }

  const allowedCardNetworks = ["VISA", "MASTERCARD"];
  const allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];

  const googlePayCall = (code, subData) => {
    const requestData = {
      cardPaymentMethod: {
        tokenizationSpecification:
          subData?.charge_object?.charges_obj?.gateway_name === "adyen"
            ? {
                type: "PAYMENT_GATEWAY",
                gateway: "adyen",
                gatewayMerchantId: "GroovywebECOM",
              }
            : {
                type: "PAYMENT_GATEWAY",
                gateway: "stripe",
                gatewayMerchantId: "",
                stripe: {
                  publishableKey:
                    "pk_test_51Lp74WLvsFbqn13LVwHWLWuHOMzx3Jyn8dZSAVjGf9oIetpNOgvbbMMRjp5WRRheejXuSftYmD9uoebv2y0Rdm1h003RC3YCS6",
                  version: "2018-11-08",
                },
              },
        allowedCardNetworks,
        allowedCardAuthMethods,
      },
      transaction: {
        totalPrice:
          chargeData?.service_type === "inclusive"
            ? (paymentData?.amount + amountToAdd)?.toString()
            : subData?.charge_object?.charges_obj?.final_amount?.toString(),
        totalPriceStatus: "FINAL",
        currencyCode: paymentData?.currency,
      },
      merchantName: "Aauti Pay",
    };

    if (Platform.OS === "android") {
      GooglePay.isReadyToPay(allowedCardNetworks, allowedCardAuthMethods).then(
        (ready) => {
          if (ready) {
            // Request payment token
            GooglePay.requestPayment(requestData)
              .then((token) => {
                PaycallBack(
                  code,
                  subData?.charge_object?.charges_obj?.gateway_name === "adyen"
                    ? token
                    : JSON.parse(token)?.id,
                  "gPay"
                );
                // Send a token to your payment gateway
              })
              .catch((error) => {
                setPaySuccess("fail");
                setTimeout(() => {
                  setPaySuccess(false);
                }, 2000);
                console.log(error.code, error.message);
              });
          }
        }
      );
    }
  };

  const applePay = async (item, clientSecret) => {
    const { error } = await confirmPlatformPayPayment(clientSecret, {
      applePay: {
        cartItems: [
          {
            label: "Total",
            amount:
              chargeData?.service_type === "inclusive"
                ? (paymentData?.amount + amountToAdd)?.toString()
                : item?.charge_object?.charges_obj?.final_amount?.toString(),
            paymentType: PlatformPay.PaymentType.Immediate,
          },
        ],
        merchantCountryCode: paymentData?.country_code,
        currencyCode: paymentData?.currency,
        // requiredShippingAddressFields: [PlatformPay.ContactField.PostalAddress],
        // requiredBillingContactFields: [PlatformPay.ContactField.PhoneNumber],
      },
    });
    if (error) {
      setPaySuccess("fail");
      setTimeout(() => {
        setPaySuccess(false);
      }, 2000);
      // handle error
    } else {
      setPaySuccess("success");
      onPaymentDone();
    }
  };

  function renderFirstDisplay(type) {
    return paymentMethod?.map((item, index) => {
      const isHighlightIndex =
        isArray(activeIndex) &&
        IOS &&
        paymentMethod[activeIndex[0]]["payment_method.payment_method"] ==
          "Google Pay"
          ? activeIndex[1]
          : activeIndex[0];
      return (Platform.OS === "android" &&
        item["payment_method.payment_method"] === "Apple Pay") ||
        (Platform.OS === "ios" &&
          item["payment_method.payment_method"] === "Google Pay")
        ? null
        : item?.type === type && (
            <Card
              key={item?.id}
              style={[
                styles.paymentBox,
                {
                  borderColor:
                    isHighlightIndex === index ? "#3cd070" : "#F8F8F8",
                },
              ]}
            >
              <Animated.View
                entering={FadeInDown}
                exiting={FadeOutUp}
                activeOpacity={0.8}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    paymentMethod[index]["payment_method.payment_method"] !==
                      "Apple Pay" &&
                      paymentMethod[index]["payment_method.payment_method"] !==
                        "Google Pay" &&
                      paymentMethod[index]["payment_method.payment_method"] !==
                        "UPI" &&
                      setisShow(index);
                    setShowCustom("");
                    setCardBrandSelect(null);
                    setPaymentType([]);

                    if (
                      paymentMethod[index]["payment_method.payment_method"] ===
                      "UPI"
                    ) {
                      SaveOrder(paymentMethod[index], "saveO");
                      setPaymentType([]);
                    } else if (
                      paymentMethod[index]["payment_method.payment_method"] ===
                      "Apple Pay"
                    ) {
                      isApplePaySupported
                        ? SaveOrder(paymentMethod[index], "aPay")
                        : Alert.alert(
                            "",
                            "Apple Pay is not supported on this device."
                          );
                    } else if (
                      paymentMethod[index]["payment_method.payment_method"] ===
                      "Google Pay"
                    ) {
                      SaveOrder(paymentMethod[index], "gPay");
                    } else {
                      item["payment_method.payment_method"] === "ACH"
                        ? getPaymentOption()
                        : getPaymentOption(
                            paymentMethod[index]?.payment_method_id,
                            index
                          );
                    }
                  }}
                  style={{ height: "100%", width: "100%" }}
                >
                  <View style={styles.boxImageWrapper}>
                    <Image
                      source={{
                        uri: item["payment_method.logo"],
                      }}
                      style={{
                        width: 70,
                        height: 70,
                      }}
                      resizeMode="contain"
                      alt={item["payment_method.payment_method"]}
                    />
                  </View>
                  <View style={styles.boxTextWrapper}>
                    <Text style={styles.paymentMethodText}>
                      {item["payment_method.payment_method"]}
                    </Text>
                    {chargeData?.service_type !== "inclusive" && (
                      <Text style={styles.startAtText}>
                        {`Starts @${
                          Number(
                            item?.charge_object?.charges_obj?.transaction_per ||
                              0
                          ) +
                          Number(
                            item?.charge_object?.charges_obj
                              ?.currency_conversion_percentage || 0
                          ) +
                          Number(
                            item?.charge_object?.charges_obj
                              ?.international_charge_percentage || 0
                          )
                        }% fee`}{" "}
                        {item?.charge_object?.charges_obj?.fixed_fee_amount &&
                          `+ ${currency_symbol[paymentData?.currency]}${
                            item?.charge_object?.charges_obj
                              ?.fixed_fee_amount || ""
                          }`}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </Card>
          );
    });
  }

  const handleScroll = (event) => {
    setHideArrow("");

    const { contentOffset } = event.nativeEvent;

    if (contentOffset.x === 0) {
      // ScrollView is at the top
      // console.log('ScrollView is at the top');
      setHideArrow("top");
    }

    // To check if ScrollView is at the bottom, you can compare with contentHeight
    const contentHeight = event.nativeEvent.contentSize.width;
    if (
      contentOffset.x >=
      contentHeight - event.nativeEvent.layoutMeasurement.width
    ) {
      // ScrollView is at the bottom
      // console.log('ScrollView is at the bottom');
      setHideArrow("bottom");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flex: isEmpty(isShow.toString()) ? 1 : null,
        }}
      >
        {isArray(paymentMethod) && !isEmpty(paymentMethod) ? (
          isEmpty(isShow.toString()) ? (
            <ScrollView bounces={false}>
              {!isEmpty(isOther) && (
                <>
                  <Text style={styles.typeText}>Digital Wallets</Text>
                  <View style={styles.paymentBoxWrapper}>
                    {renderFirstDisplay("digital wallet")}
                  </View>
                </>
              )}

              {!isEmpty(isCard) && (
                <>
                  <Text style={styles.typeText}>Card Payment</Text>
                  <View style={styles.paymentBoxWrapper}>
                    {renderFirstDisplay("card")}
                  </View>
                </>
              )}

              {!isEmpty(isBank) && (
                <>
                  <Text style={styles.typeText}>Net Banking</Text>
                  <View style={styles.paymentBoxWrapper}>
                    {renderFirstDisplay("bank")}
                  </View>
                </>
              )}
            </ScrollView>
          ) : (
            <>
              {hideArrow !== "top" && (
                <>
                  <LinearGradient
                    colors={[
                      "rgba(0,0,0,0.09)",
                      "rgba(0,0,0,0.07)",
                      "rgba(0,0,0,0.05)",
                      "rgba(0,0,0,0.03)",
                      "rgba(0,0,0,0.01)",
                    ]}
                    style={{
                      position: "absolute",
                      left: 10,
                      height: "100%",
                      width: 10,
                      zIndex: 1,
                    }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                  <MaterialIcons
                    name="keyboard-arrow-left"
                    style={{
                      position: "absolute",
                      left: 6,
                      top: "40%",
                      height: "100%",
                      // width: 10,
                      zIndex: 4,
                    }}
                    size={20}
                  />
                </>
              )}
              <ScrollView
                ref={horizontalScrollRef}
                onScroll={handleScroll}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
              >
                {paymentMethod?.map((item, index) => {
                  return (Platform.OS === "android" &&
                    item["payment_method.payment_method"] === "Apple Pay") ||
                    (Platform.OS === "ios" &&
                      item["payment_method.payment_method"] ===
                        "Google Pay") ? null : (
                    <Animated.View
                      entering={FadeInRight}
                      exiting={FadeOutLeft}
                      key={item?.id}
                      activeOpacity={0.8}
                    >
                      <Card
                        style={[
                          styles.paymentSmallBox,
                          {
                            width: SMALL_BOX_WIDTH,
                            minHeight:
                              deviceHeight *
                              (chargeData?.service_type !== "inclusive"
                                ? 0.14
                                : 0.12),
                            borderColor:
                              isShow === index ? "#0068EF" : "#F8F8F8",
                          },
                          index === paymentMethod?.length - 1 && {
                            marginRight: 16,
                          },
                        ]}
                      >
                        <TouchableOpacity
                          onLongPress={() => {
                            if (
                              item["payment_method.payment_method"] === "ACH"
                            ) {
                              setLongPressData(
                                item?.charge_object?.longpress_data
                              );
                              // bottomSheetRef?.current?.present();
                              bottomSheetRef?.current?.open();
                            }
                          }}
                          onPress={() => {
                            setTabSelected({});
                            setisShow(index);
                            setShowCustom("");
                            setCardBrandSelect(null);
                            setPaymentType([]);
                            if (
                              paymentMethod[index][
                                "payment_method.payment_method"
                              ] === "UPI"
                            ) {
                              SaveOrder(paymentMethod[index], "saveO");
                              setPaymentType([]);
                            } else if (
                              paymentMethod[index][
                                "payment_method.payment_method"
                              ] === "Apple Pay"
                            ) {
                              isApplePaySupported
                                ? SaveOrder(paymentMethod[index], "aPay")
                                : Alert.alert(
                                    "",
                                    "Apple Pay is not supported on this device."
                                  );
                            } else if (
                              paymentMethod[index][
                                "payment_method.payment_method"
                              ] === "Google Pay"
                            ) {
                              SaveOrder(paymentMethod[index], "gPay");
                            } else {
                              item["payment_method.payment_method"] === "ACH"
                                ? getPaymentOption()
                                : getPaymentOption(
                                    paymentMethod[index]?.payment_method_id,
                                    index
                                  );
                            }
                          }}
                        >
                          <Image
                            source={{
                              uri: item["payment_method.logo"],
                            }}
                            style={styles.paymentSBImage}
                            resizeMode="contain"
                            alt={item["payment_method.payment_method"]}
                          />
                          <Text
                            style={[
                              styles.paymentSBTitle,
                              { color: isShow === index ? "#0068EF" : "#000" },
                            ]}
                          >
                            {item["payment_method.payment_method"]}
                          </Text>
                          {chargeData?.service_type !== "inclusive" && (
                            <Text
                              style={{
                                fontSize: 11,
                                textAlign: "center",
                                paddingHorizontal: 2,
                                color: isShow === index ? "#0068EF" : "#AAAAAA",
                              }}
                            >
                              {`Starts @${
                                Number(
                                  item?.charge_object?.charges_obj
                                    ?.transaction_per || 0
                                ) +
                                Number(
                                  item?.charge_object?.charges_obj
                                    ?.currency_conversion_percentage || 0
                                ) +
                                Number(
                                  item?.charge_object?.charges_obj
                                    ?.international_charge_percentage || 0
                                )
                              }% fee`}{" "}
                              {item?.charge_object?.charges_obj
                                ?.fixed_fee_amount &&
                                `+ ${currency_symbol[paymentData?.currency]}${
                                  item?.charge_object?.charges_obj
                                    ?.fixed_fee_amount || ""
                                }`}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </Card>
                    </Animated.View>
                  );
                })}
              </ScrollView>
              {hideArrow !== "bottom" && (
                <>
                  <LinearGradient
                    colors={[
                      "rgba(0,0,0,0.09)",
                      "rgba(0,0,0,0.07)",
                      "rgba(0,0,0,0.05)",
                      "rgba(0,0,0,0.03)",
                      "rgba(0,0,0,0.01)",
                    ]}
                    style={{
                      position: "absolute",
                      right: 10,
                      height: "100%",
                      width: 10,
                      zIndex: 4,
                    }}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 0 }}
                  />
                  <MaterialIcons
                    name="keyboard-arrow-right"
                    style={{
                      position: "absolute",
                      right: 6,
                      top: "40%",
                      height: "100%",
                      // width: 10,
                      zIndex: 4,
                    }}
                    size={20}
                  />
                </>
              )}
            </>
          )
        ) : (
          <View
            style={{
              height: "100%",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>No Data</Text>
          </View>
        )}
      </View>

      {contentLoade ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size={"large"} animating color={"#0068EF"} />
        </View>
      ) : isArray(paymentType) &&
        !isEmpty(paymentType) &&
        !isEmpty(isShow?.toString()) &&
        paymentMethod[isShow]["payment_method.payment_method"] !==
          "Net Banking" &&
        paymentMethod[isShow]["payment_method.payment_method"] !== "Wallet" &&
        paymentMethod[isShow]["payment_method.payment_method"] !== "ACH" ? (
        // tabSwitch
        <TabSwitch
          {...props}
          onLongPress={(data) => {
            setLongPressData(data);
            // bottomSheetRef.current?.present();
            bottomSheetRef.current?.open();
          }}
          tabs={paymentType}
          activeTab={tabSelected}
          chargeData={chargeData}
          subTabSize={
            deviceWidth *
            (chargeData?.service_type !== "inclusive" ? 0.35 : 0.3)
          }
          onTabChange={(currentTab) => {
            setTabSelected(currentTab);
            customCardRef?.current?.resetData();
          }}
        />
      ) : isEmpty(showCustom) &&
        !isEmpty(isShow.toString()) &&
        paymentMethod[isShow]["payment_method.payment_method"] !== "ACH" ? (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={{
            flex: 1,
          }}
        >
          {(paymentMethod[isShow]["payment_method.payment_method"] ===
            "Net Banking" ||
            paymentMethod[isShow]["payment_method.payment_method"] ===
              "Wallet") && (
            <Text
              style={{
                marginHorizontal: 10,
                paddingVertical: 15,
                color: BaseColors.textColor,
                fontWeight: "600",
                fontSize: 16,
              }}
            >
              {paymentMethod[isShow]["payment_method.payment_method"] ===
              "Net Banking"
                ? "All Banks"
                : "Wallets"}
            </Text>
          )}

          <View
            style={{
              flexGrow: 1,
              paddingBottom: 30,
            }}
          >
            <FlatList
              showsVerticalScrollIndicator={false}
              data={paymentType}
              renderItem={({ item, index }) => {
                return (
                  <Animated.View entering={FadeInDown} exiting={FadeOutUp}>
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginVertical: 7,
                        paddingHorizontal: 10,
                      }}
                      onPress={() => {
                        setTabSelected(item);
                      }}
                    >
                      <View
                        style={{
                          borderWidth: 1,
                          borderColor: BaseColors.black20,
                          height: 30,
                          width: 40,
                          borderRadius: 5,
                          overflow: "hidden",
                        }}
                      >
                        <Image
                          source={{
                            uri: item["payment_sub_method.logo"],
                          }}
                          resizeMode="contain"
                          style={{
                            height: 30,
                            width: 40,
                          }}
                        />
                      </View>

                      <Text
                        style={{
                          flex: 1,
                          marginHorizontal: 10,
                          color: BaseColors.textColor,
                          fontWeight: "600",
                        }}
                        numberOfLines={2}
                      >
                        {item["payment_sub_method.type"]}
                      </Text>

                      <MaterialIcons
                        name="chevron-right"
                        size={20}
                        color={BaseColors.black20}
                      />
                    </TouchableOpacity>
                  </Animated.View>
                );
              }}
            />
          </View>
        </Animated.View>
      ) : null}

      {!isEmpty(isShow.toString()) &&
      paymentMethod[isShow]["payment_method.payment_method"] !==
        "Net Banking" &&
      paymentMethod[isShow]["payment_method.payment_method"] !== "Wallet" &&
      paymentMethod[isShow]["payment_method.payment_method"] !== "ACH" ? (
        <ScrollView>
          <View
            style={{
              flex: 1,
              marginTop: 10,
              paddingHorizontal: showCustom === "custom" ? 10 : 0,
            }}
          >
            {subLoader ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                }}
              >
                <ActivityIndicator size={"large"} animating color={"#0068EF"} />
              </View>
            ) : showCustom === "custom" ? (
              <CustomCard
                {...props}
                ref={customCardRef}
                cardBrandSelect={cardBrandSelect}
                paymentData={paymentData}
                onPaymentDone={onPaymentDone}
                setPaySuccess={setPaySuccess}
                liveUrl={liveUrl}
                chargeData={chargeData}
              />
            ) : showCustom === "url" ? (
              <View
                style={{
                  flex: 1,
                  width: "100%",
                }}
              >
                <WebView
                  ref={webviewRef}
                  source={{
                    uri: url ? url : "",
                  }}
                  setSupportMultipleWindows={false}
                  style={[
                    {
                      height: deviceHeight,
                      width: deviceWidth,
                    },
                    webViewStyles,
                  ]}
                  javaScriptEnabled
                  injectedJavaScript={`(function() {
window.ReactNativeWebView.postMessage(JSON.stringify('${injectedMessage}'));
})();`}
                  injectedJavaScriptForMainFrameOnly
                  originWhitelist={["*"]}
                  startInLoadingState
                  scrollEnabled
                  bounces={false}
                  onMessage={(event) => {
                    if (!isNull(event?.nativeEvent)) {
                      const data = JSON.parse(event?.nativeEvent?.data);
                      !isEmpty(data) && data === "close" && onPaymentDone();
                    }
                  }}
                  scalesPageToFit={false}
                  onNavigationStateChange={(navState) => {
                    if (navState?.url === "about:blank") {
                      return false;
                    } else {
                      const temp1 = navState?.url.split("/");
                      if (_.isArray(temp1)) {
                        const orderID = temp1[temp1?.length - 1]
                          ? temp1[temp1?.length - 1]
                          : "";
                        if (
                          temp1[temp1?.length - 2] == "success" ||
                          temp1[temp1?.length - 2] == "fail"
                        ) {
                          onPaymentDone();
                        }
                      }
                    }
                  }}
                />
              </View>
            ) : null}
          </View>
        </ScrollView>
      ) : (
        !contentLoade &&
        !isEmpty(isShow.toString()) &&
        paymentMethod[isShow]["payment_method.payment_method"] === "ACH" && (
          <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <ScrollView
              style={{ padding: 10 }}
              showsVerticalScrollIndicator={false}
            >
              <DForm
                {...props}
                PayObj={paymentMethod[isShow]}
                paymentData={paymentData}
                liveUrl={liveUrl}
                setURL={setURL}
                setShowCustom={setShowCustom}
                onPaymentDone={onPaymentDone}
                setPaySuccess={setPaySuccess}
                chargeData={chargeData}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        )
      )}

      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: BaseColors.greyTxt,
            marginRight: 4,
          }}
        >
          Powerd by
        </Text>

        <Image
          resizeMode="contain"
          alt="Aauti"
          source={require("../Images/aautiPA.png")}
          style={{
            width: 60,
            height: 60,
          }}
        />
      </View>
      <RBSheet
        ref={bottomSheetRef}
        closeOnDragDown={true}
        closeOnPressMask={false}
        height={deviceHeight * 0.65}
        openDuration={250}
        customStyles={{
          wrapper: {
            backgroundColor: "transparent",
          },
          draggableIcon: {
            backgroundColor: "#A4A4A4",
          },
          container: {
            backgroundColor: "#E7EFFB",
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
          },
        }}
      >
        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,
            marginBottom: 20,
          }}
        >
          <FlatList
            data={longPressData}
            showsVerticalScrollIndicator={false}
            keyExtractor={(i) => i.id}
            renderItem={({ item, index }) => {
              const displayName = item?.gateway_name?.replaceAll("_", " ");
              return (
                index === 0 && (
                  <Animated.View entering={FadeInDown} exiting={FadeOutUp}>
                    <TouchableOpacity
                      activeOpacity={1}
                      style={{
                        marginVertical: 8,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Image
                          source={{
                            uri:
                              item?.gateway_name === "stripe"
                                ? "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png"
                                : item?.gateway_name === "authorize_net"
                                ? "https://upload.wikimedia.org/wikipedia/commons/1/16/Authorize.net_logo.png"
                                : item?.gateway_name === "braintree"
                                ? "https://www.appvizer.com/media/application/439/cover/987/cover-braintree"
                                : item?.gateway_name === "paypal"
                                ? "https://pngimg.com/uploads/paypal/paypal_PNG22.png"
                                : item?.gateway_name === "razorpay"
                                ? "https://assets.stickpng.com/images/62cc1dab150d5de9a3dad5fb.png"
                                : "https://pngimg.com/uploads/paypal/paypal_PNG22.png",
                          }}
                          resizeMode="contain"
                          style={{
                            height: 30,
                            width: 40,
                          }}
                        />

                        <Text
                          style={{
                            marginHorizontal: 6,
                            fontSize: 16,
                            color: "#000",
                            fontWeight: "bold",
                            textTransform: "capitalize",
                          }}
                          numberOfLines={2}
                        >
                          {displayName}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 10,
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          style={{
                            marginHorizontal: 6,
                            fontSize: 14,
                            color: "#000",
                          }}
                          numberOfLines={2}
                        >
                          Amount:
                        </Text>
                        <Text
                          style={{
                            marginHorizontal: 6,
                            fontSize: 14,
                            color: "#000",
                            fontWeight: "bold",
                          }}
                          numberOfLines={2}
                        >
                          {currency_symbol[paymentData?.currency]}
                          {paymentData?.amount}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 10,
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          style={{
                            marginHorizontal: 6,
                            fontSize: 14,
                            color: "#000",
                          }}
                          numberOfLines={2}
                        >
                          Transaction percentage:
                        </Text>
                        <Text
                          style={{
                            marginHorizontal: 6,
                            fontSize: 14,
                            color: "#000",
                            fontWeight: "bold",
                          }}
                          numberOfLines={2}
                        >
                          {item?.transaction_per || "0"}%
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 10,
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          style={{
                            marginHorizontal: 6,
                            fontSize: 14,
                            color: "#000",
                          }}
                          numberOfLines={2}
                        >
                          Transaction Amount:
                        </Text>
                        <Text
                          style={{
                            marginHorizontal: 6,
                            fontSize: 14,
                            color: "#000",
                            fontWeight: "bold",
                          }}
                          numberOfLines={2}
                        >
                          {currency_symbol[paymentData?.currency]}
                          {item?.transaction_amount || "0"}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 10,
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          style={{
                            marginHorizontal: 6,
                            fontSize: 14,
                            color: "#000",
                          }}
                          numberOfLines={2}
                        >
                          Fixed fee:
                        </Text>
                        <Text
                          style={{
                            marginHorizontal: 6,
                            fontSize: 14,
                            color: "#000",
                            fontWeight: "bold",
                          }}
                          numberOfLines={2}
                        >
                          {currency_symbol[paymentData?.currency]}
                          {item?.fixed_fee_amount || "0"}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 10,
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          style={{
                            marginHorizontal: 6,
                            fontSize: 14,
                            color: "#000",
                          }}
                          numberOfLines={2}
                        >
                          International Transaction percentage:
                        </Text>
                        <Text
                          style={{
                            marginHorizontal: 6,
                            fontSize: 14,
                            color: "#000",
                            fontWeight: "bold",
                          }}
                          numberOfLines={2}
                        >
                          {item?.international_charge_percentage || "0"}%
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 10,
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          style={{
                            marginHorizontal: 6,
                            fontSize: 14,
                            color: "#000",
                          }}
                          numberOfLines={2}
                        >
                          International Transaction amount:
                        </Text>
                        <Text
                          style={{
                            marginHorizontal: 6,
                            fontSize: 14,
                            color: "#000",
                            fontWeight: "bold",
                          }}
                          numberOfLines={2}
                        >
                          {currency_symbol[paymentData?.currency]}
                          {item?.international_charge_amount || "0"}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 10,
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          style={{
                            marginHorizontal: 6,
                            fontSize: 14,
                            color: "#000",
                          }}
                          numberOfLines={2}
                        >
                          Tax percentage:
                        </Text>
                        <Text
                          style={{
                            marginHorizontal: 6,
                            fontSize: 14,
                            color: "#000",
                            fontWeight: "bold",
                          }}
                          numberOfLines={2}
                        >
                          {item?.tax_percentage_per || "0"}%
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 10,
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          style={{
                            marginHorizontal: 6,
                            fontSize: 14,
                            color: "#000",
                          }}
                          numberOfLines={2}
                        >
                          Tax amount:
                        </Text>
                        <Text
                          style={{
                            marginHorizontal: 6,
                            fontSize: 14,
                            color: "#000",
                            fontWeight: "bold",
                          }}
                          numberOfLines={2}
                        >
                          {currency_symbol[paymentData?.currency]}
                          {item?.tax_percentage_amount || "0"}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 10,
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          style={{
                            marginHorizontal: 6,
                            fontSize: 14,
                            color: "#0068EF",
                          }}
                          numberOfLines={2}
                        >
                          Final amount:
                        </Text>
                        <Text
                          style={{
                            marginHorizontal: 6,
                            fontSize: 14,
                            color: "#0068EF",
                            fontWeight: "bold",
                          }}
                          numberOfLines={2}
                        >
                          {currency_symbol[paymentData?.currency]}
                          {item?.final_amount}
                        </Text>
                      </View>
                      {/* {index !== longPressData.length - 1 && (
                        <Text
                          ellipsizeMode="clip"
                          numberOfLines={1}
                          style={{marginTop: 10, color: '#AAAAAA'}}>
                          - - - - - - - - - - - - - - - - - - - - - - - - - - -
                          - - - - - - - - - - - - - - - - - - - - - - - - - - -
                          - - - - - - - - - - - - - - - - - - - - - - - - - - -
                          - - - - - - - - - - - - - - - - - - - - - - - - - - -
                          - - - - - - - - - - - - - - - - - - - -
                        </Text>
                      )} */}
                    </TouchableOpacity>
                  </Animated.View>
                )
              );
            }}
          />
        </View>
      </RBSheet>
    </View>
  );
}
