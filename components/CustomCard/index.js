/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import { isArray, isEmpty, isUndefined } from "lodash";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import creditCardType from "card-validator";
import { TextInputMask } from "react-native-masked-text";
import { BaseColors } from "../theme";
import CryptoJS from "react-native-crypto-js";
import { getApiDataProgressPayment } from "../APIHelper";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import Icon from "react-native-vector-icons/Octicons";
import { TextInput } from "react-native-paper";
import { currency_symbol } from "../staticData";
import Cbutton from "../CButton";
import InAppBrowser from "react-native-inappbrowser-reborn";

function CustomCard(props, ref) {
  const {
    cardBrandSelect,
    paymentData,
    onPaymentDone,
    setPaySuccess,
    liveUrl,
    themeColor,
    chargeData,
  } = props;

  let bytes = CryptoJS.AES.decrypt(
    cardBrandSelect?.extra_data,
    "470cb677d807b1e0017c50b"
  );
  let originalText = JSON?.parse(bytes.toString(CryptoJS.enc.Utf8));

  const styles = StyleSheet.create({
    root: { flex: 1, justifyContent: "center", alignItems: "center" },
    buttonContainer: {
      backgroundColor: "#0068EF",
      justifyContent: "center",
      alignItems: "center",
      padding: 5,
      height: 40,
      width: Dimensions.get("screen").width / 2.5,
      borderRadius: 3,
    },
    buttonTextContainer: {
      textAlign: "center",
      color: "white",
      fontSize: 20,
      fontWeight: "bold",
    },
    input: {
      fontSize: 18,
      backgroundColor: themeColor,
      color: BaseColors.textColor,
    },
  });
  const Ref = useRef(null);

  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expDate, setExpDate] = useState("");
  const [enteredCard, setEnteredCard] = useState("");
  const [cardType, setCardType] = useState("visa-or-mastercard");
  const [BtnLoader, setBtnLoader] = useState(false);

  const [isShowBreackdown, setIsShowBreackdown] = useState(false);

  const [cardList, setCardList] = useState([]);
  const [cusMainID, setCusID] = useState("");
  const [listLoader, setListLoader] = useState("");
  const [mainLoader, setMainLoader] = useState(false);

  const [cardErr, setCardErr] = useState({
    card: false,
    cvv: false,
    expire: false,
  });

  const amountToAdd = Number(
    ((chargeData?.service_charge * paymentData?.amount) / 100)?.toFixed(2)
  );
  const paymentGatwayFee = (
    cardBrandSelect?.charge_object?.charges_obj?.final_amount -
    (paymentData?.amount + amountToAdd)
  )?.toFixed(2);

  const finalAmount =
    chargeData?.service_type === "inclusive"
      ? paymentData?.amount
      : cardBrandSelect?.charge_object?.charges_obj?.final_amount;

  useEffect(() => {
    getCardList();
  }, [cardBrandSelect]);

  useEffect(() => {
    handleCvvChange(cvv);
  }, [cardNumber]);

  useImperativeHandle(ref, () => ({
    resetData: () => {
      resetData();
    },
  }));

  function resetData() {
    setCardNumber("");
    setEnteredCard("");
    setCvv("");
    setExpDate("");
    setCardType("visa-or-mastercard");
    setCardErr({
      card: false,
      cvv: false,
      expire: false,
    });
    setBtnLoader(false);
  }

  const isDisable =
    isEmpty(cardNumber) ||
    isEmpty(cvv) ||
    isEmpty(expDate) ||
    cardErr?.card ||
    cardErr?.cvv ||
    cardErr?.expire ||
    !isEmpty(enteredCard);

  //BtoA encryption
  const btoa = (input) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    let str = input;
    let output = "";

    for (
      let block = 0, charCode, i = 0, map = chars;
      str.charAt(i | 0) || ((map = "="), i % 1);
      output += map.charAt(63 & (block >> (8 - (i % 1) * 8)))
    ) {
      charCode = str.charCodeAt((i += 3 / 4));

      if (charCode > 0xff) {
        throw new Error(
          "'btoa' failed: The string to be encoded contains characters outside of the Latin1 range."
        );
      }

      block = (block << 8) | charCode;
    }

    return output;
  };

  //card detail handle functions
  const handleCardNumberChange = async (formatted) => {
    setEnteredCard("");
    const cardType1 = creditCardType.number(formatted);
    const bin = formatted?.replaceAll(" ", ""); // Example: Mastercard BIN

    const isErr =
      !isEmpty(formatted) && !isEmpty(cardType1) && !cardType1?.isValid;
    setCardErr({
      ...cardErr,
      card: isErr,
    });

    !isEmpty(cardType1?.card) && cardType1?.card?.type === "american-express"
      ? setCardType("amex")
      : cardType1?.card?.type === "diners-club"
      ? setCardType("diners")
      : setCardType("visa-or-mastercard");

    setCardNumber(formatted);

    if (!isEmpty(cardType1) && cardType1?.isValid) {
      if (
        cardBrandSelect["payment_sub_method.type"]?.toLowerCase() !==
        cardType1?.card?.niceType?.toLowerCase()
      ) {
        setEnteredCard(cardType1?.card?.niceType);
      } else {
        // const response = await axios.get(`https://lookup.binlist.net/${bin}`);
        // if (response) {
        //   if (response?.data) {
        //     response?.data?.type !== 'credit' &&
        //       paymentMethod[isShow]['payment_method.payment_method'] ===
        //         'Credit card' &&
        //       setEnteredCard('Credit');
        //     response?.data?.type !== 'debit' &&
        //       paymentMethod[isShow]['payment_method.payment_method'] ===
        //         'Debit Card' &&
        //       setEnteredCard('Debit');
        //   }
        // }
      }
    }
  };

  const handleCardExpChange = (formatted) => {
    const cardType1 = creditCardType.expirationDate(formatted);
    setCardErr({
      ...cardErr,
      expire: !cardType1?.isValid && !isEmpty(formatted),
    });
    setExpDate(formatted);
  };

  const handleCvvChange = (formatted) => {
    const cvvLength = cardType === "amex" ? 4 : 3;
    const isErr = !isEmpty(formatted) && formatted?.length !== cvvLength;
    setCardErr({
      ...cardErr,
      cvv: isErr,
    });
    setCvv(formatted);
  };

  //stripe payment functions
  const createTokenStripe = async (cusID) => {
    setBtnLoader(true);
    setPaySuccess("loading");
    const stripeSecretKey = originalText?.private_key;
    const cardType1 = creditCardType.expirationDate(expDate);

    const cardData = {
      "card[number]": cardNumber.replaceAll(" ", ""),
      "card[exp_month]": cardType1?.month,
      "card[exp_year]": cardType1?.year,
      "card[cvc]": cvv,
    };
    fetch("https://api.stripe.com/v1/tokens", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${stripeSecretKey}:`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(cardData).toString(),
    })
      .then((response) => {
        if (!response.ok) {
          setPaySuccess("fail");
          setTimeout(() => {
            setPaySuccess(false);
          }, 5000);
          throw new Error("Failed to create Stripe token");
        }
        return response.json();
      })
      .then((data) => {
        SaveOrder(data?.id, "stripe", "", 1);
      })
      .catch((error) => {
        console.error("Error creating token:", error);
        setBtnLoader(false);
        setPaySuccess("fail");
        setTimeout(() => {
          setPaySuccess(false);
        }, 5000);
      });
  };

  async function SaveOrder(token, type, cusID, isNew) {
    setPaySuccess("loading");
    try {
      const data = {
        name: paymentData?.name,
        amount: paymentData?.amount + amountToAdd,
        final_amount: cardBrandSelect?.charge_object?.charges_obj?.final_amount,
        app_token: paymentData?.app_token,
        country_id: cardBrandSelect?.country_id,
        currency: paymentData?.currency,
        mode: paymentData?.mode,
        payment_method_id: cardBrandSelect?.payment_method_id,
        payment_sub_method_id: cardBrandSelect?.payment_sub_method_id,
        transaction_code: paymentData?.transaction_code,
        gateway_code: cardBrandSelect?.charge_object?.gateway_code,
        gateway_id: cardBrandSelect?.gateway_id,
        service_type: chargeData?.service_type,
        email: paymentData?.email,
        base_amount: paymentData?.amount,
        charge_id: cardBrandSelect?.charge_object?.charges_obj?.id,
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
        }, 5000);
      } else {
        paymentApi(token, type, cusID, isNew, response?.code);
      }
    } catch (error) {
      console.log("error:", error);
    }
  }

  async function paymentApi(token, type, cusID, isNew, code) {
    let final_data = {
      amount: {
        amount: paymentData?.amount,
        final_amount: cardBrandSelect?.charge_object?.charges_obj?.final_amount,
      },
      token,
    };

    if (type === "braintree" || type === "adyen" || type === "authorize") {
      final_data.customer_id = cusID;
    }

    // Encrypt
    let ciphertext = CryptoJS.AES.encrypt(
      JSON.stringify(final_data),
      "470cb677d807b1e0017c50b"
    ).toString();

    const Ddata = {
      data: ciphertext,
      order_code: code,
      is_new: isNew,
    };

    try {
      const response = await getApiDataProgressPayment(
        `${liveUrl}custom-checkout`,
        "POST",
        JSON.stringify(Ddata),
        chargeData?.auth_token
      );

      if (isUndefined(response) || response?.status === false) {
        setPaySuccess("fail", response?.message?.toString());
        setTimeout(() => {
          setPaySuccess(false);
        }, 5000);
      } else if (response?.status === "processing") {
        const interval = setInterval(() => {
          checkPaymentProgress(code);
        }, 2000);
        Ref.current = interval;
      } else {
        if (!isEmpty(response?.data?.url)) {
          const result = await InAppBrowser.open(response?.data?.url, {
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
          });
          if (result?.type === "cancel") {
            setPaySuccess("fail");
            setTimeout(() => {
              setPaySuccess(false);
            }, 5000);
          }
        } else {
          setPaySuccess("success");
          onPaymentDone();
        }
      }
      setBtnLoader(false);
      setListLoader("");
    } catch (error) {
      console.log("📌 ⏩ file: index.js:227 ⏩ paymentApi ⏩ error:", error);
      setListLoader("");
      setBtnLoader(false);
    }
  }

  async function checkPaymentProgress(code) {
    fetch(`${liveUrl}pay-response/${code}/${paymentData?.transaction_code}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${chargeData?.auth_token}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        if (response?.data?.status == "success") {
          setPaySuccess("success");
          onPaymentDone();
          clearInterval(Ref.current);
        } else if (response?.data?.status == "failed") {
          setPaySuccess("fail", response?.data?.fail_reason?.toString());
          setTimeout(() => {
            setPaySuccess(false);
          }, 5000);
          clearInterval(Ref.current);
        }
        // Handle the response data here
      })
      .catch((error) => {
        // Handle any errors here
      });
  }

  //Braintree payment functions
  const createCusIdBraintree = async () => {
    setBtnLoader(true);
    setPaySuccess("loading");

    const clientId = originalText?.public_key;
    const clientSecret = originalText?.private_key;

    const credentials = `${clientId}:${clientSecret}`;

    const apiUrl = `https://api.sandbox.braintreegateway.com/merchants/${
      JSON.parse(originalText)?.gateway_merchantId
    }/customers`;
    const encodedApiKey = btoa(credentials);
    const headers = {
      Authorization: `Basic ${encodedApiKey}`,
      "Content-Type": "application/json",
      "X-ApiVersion": 6,
      Accept: "application/xml",
      "User-Agent": "Braintree Node 3.16.0",
      "Accept-Encoding": "gzip",
    };
    const body = JSON.stringify({
      customer: {
        firstName: paymentData?.name,
        lastName: paymentData?.name,
        company: "Braintree",
        email: paymentData?.email,
        phone: "312.555.1234",
      },
    });

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body,
      });

      if (response.ok) {
        const data = await response.text();
        const tokenMatch = data.match(/<id>(.*?)<\/id>/);

        if (tokenMatch && tokenMatch[1]) {
          const tokenValue = tokenMatch[1];
          createTokenbraintree(
            tokenValue,
            JSON.parse(originalText)?.gateway_merchantId,
            headers
          );
        } else {
          console.log("Token not found in the XML.");
          setPaySuccess("fail");
          setTimeout(() => {
            setPaySuccess(false);
          }, 5000);
        }
      } else {
        console.error(response);
        setPaySuccess("fail");
        setTimeout(() => {
          setPaySuccess(false);
        }, 5000);
        setBtnLoader(false);
      }
    } catch (error) {
      if (error.response) {
        console.log("Error:", error.response.data);
      } else {
        console.log("Error:", error.message);
      }
      setBtnLoader(false);
    }
  };

  const createTokenbraintree = async (cusID, merID, headers) => {
    const apiUrl = `https://api.sandbox.braintreegateway.com/merchants/${merID}/payment_methods`;

    const cardType1 = creditCardType.expirationDate(expDate);
    // get current year's first 2 digits
    const currentYear = new Date().getFullYear();
    const firstTwoDigits = currentYear.toString().slice(0, 2);
    const body = JSON.stringify({
      creditCard: {
        customerID: cusID,
        number: cardNumber.replaceAll(" ", ""),
        expirationDate: `${cardType1?.month}/${firstTwoDigits}${cardType1?.year}`,
        cvv: cvv,
      },
    });

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body,
      });

      const data = await response.text();
      if (response.ok) {
        const tokenMatch = data.match(/<token>(.*?)<\/token>/);

        if (tokenMatch && tokenMatch[1]) {
          const tokenValue = tokenMatch[1];
          SaveOrder(tokenValue, "braintree", cusID, 1);
        } else {
          setPaySuccess("fail");
          setTimeout(() => {
            setPaySuccess(false);
          }, 5000);
          setBtnLoader(false);
        }
      } else {
        const message = data.match(/<message>(.*?)<\/message>/);
        setPaySuccess("fail", message && message[1]);
        setTimeout(() => {
          setPaySuccess(false);
        }, 5000);
        setBtnLoader(false);
      }
    } catch (error) {
      if (error.response) {
        console.log("Error:", error.response.data);
      } else {
        console.log("Error:", error.message);
      }
      setBtnLoader(false);
    }
  };

  //Razorpay
  const createTokenrazorPay = async () => {
    const clientId = "rzp_test_hn5CVra37uXzHz";
    const clientSecret = "YjDqi43mLWtG7eRyGFvvP5VP";
    const credentials = `${clientId}:${clientSecret}`;

    const apiUrl = "https://api.razorpay.com/v1/tokens";
    const encodedApiKey = btoa(credentials);
    const headers = {
      Authorization: `Basic ${encodedApiKey}`,
      "Content-Type": "application/json",
    };
    const body = JSON.stringify({
      method: "card",
      card: {
        number: "4111111111111111",
        cvv: "123",
        expiry_month: "12",
        expiry_year: "30",
        name: "Gaurav Kumar",
      },
    });

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body,
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data?.id);
      } else {
        console.error(response);
      }
    } catch (error) {
      console.log("Error:", error.response.data);
    }
  };

  //Paypal
  const makePaymentPaypal = async () => {
    setPaySuccess("loading");

    const cardType1 = creditCardType.expirationDate(expDate);
    // get current year's first 2 digits
    const currentYear = new Date().getFullYear();
    const firstTwoDigits = currentYear.toString().slice(0, 2);
    try {
      const clientId = originalText?.public_key;
      const clientSecret = originalText?.private_key;
      const payment_source = {
        payment_source: {
          card: {
            number: cardNumber.replaceAll(" ", ""),
            expiry: `${firstTwoDigits}${cardType1?.year}-${cardType1?.month}`,
            cvv: cvv,
            name: paymentData?.name,
            verification_method: "SCA_ALWAYS",
            experience_context: {
              brand_name: "Aautipay",
              locale: "en-US",
              return_url: `${liveUrl}redirect-3ds?val=success&type=paypal`,
              cancel_url: `${liveUrl}redirect-3ds?val=fail&type=paypal`,
            },
          },
        },
      };
      const credentials = `${clientId}:${clientSecret}`;
      const credentialsBase64 = btoa(credentials);

      const response = await axios.post(
        "https://api.sandbox.paypal.com/v1/oauth2/token",
        "grant_type=client_credentials",
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${credentialsBase64}`,
          },
        }
      );
      const { access_token } = response.data;

      const cardTokenResponse = await axios.post(
        "https://api-m.sandbox.paypal.com/v3/vault/setup-tokens",
        payment_source,
        {
          headers: {
            "Content-Type": "application/json",
            "PayPal-Request-Id": generateRandomString(),
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      if (
        cardTokenResponse?.status === 200 ||
        cardTokenResponse?.status === 201
      ) {
        const getUrlObj =
          isArray(cardTokenResponse?.data?.links) &&
          cardTokenResponse?.data?.links?.find((v) => v?.rel === "approve");

        const result = await InAppBrowser.openAuth(getUrlObj?.href, "", {
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
        });

        if (result?.type === "cancel") {
          setPaySuccess("fail");
          setTimeout(() => {
            setPaySuccess(false);
          }, 5000);
        } else if (result?.type === "success") {
          if (result?.url?.includes("success")) {
            SaveOrder(cardTokenResponse?.data?.id, "paypal", "", 1);
          } else {
            setPaySuccess("fail");
            setTimeout(() => {
              setPaySuccess(false);
            }, 5000);
          }
        }
      } else {
        setPaySuccess("fail");
        setTimeout(() => {
          setPaySuccess(false);
        }, 5000);
      }
    } catch (error) {
      setPaySuccess("fail");
      setTimeout(() => {
        setPaySuccess(false);
      }, 5000);
      console.log("Error:", error.response.data);
    }
  };

  //Adyen integration
  async function SaveOrderAdyen() {
    setBtnLoader(true);
    setPaySuccess("loading");

    try {
      const data = {
        app_token: paymentData?.app_token,
        mode: paymentData?.mode,
        payment_method_id: cardBrandSelect?.payment_method_id,
        gateway_code: cardBrandSelect?.charge_object?.gateway_code,
        email: paymentData?.email,
        payment_sub_method_id: cardBrandSelect?.payment_sub_method_id,
      };

      const response = await getApiDataProgressPayment(
        `${liveUrl}fetch-user-payment-tokens`,
        "POST",
        JSON.stringify(data),
        chargeData?.auth_token
      );
      if (response?.status == false) {
        Alert.alert(
          "Error",
          response?.message || "Please try again. Something got wrong."
        );
        setBtnLoader(false);
        setPaySuccess("fail");
        setTimeout(() => {
          setPaySuccess(false);
        }, 5000);
      } else {
        createTokenAdyen(response);
      }
    } catch (error) {
      console.log("error:", error);
      setBtnLoader(false);
    }
  }

  const createTokenAdyen = async (resData) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "X-API-Key",
      "AQErhmfxK4PGaR1Fw0m/n3Q5qf3Vb5lCAoVTT2BUqmAZb0xtS+fZCSp5LByo8RDBXVsNvuR83LVYjEgiTGAH-hHkppXVNIpKISBipTv5+LSDZi86CBhBVb+pnqfZ5okU=-eF*@2Sd=v?9,y}FG"
    );
    const cardType1 = creditCardType.expirationDate(expDate);

    // get current year's first 2 digits
    const currentYear = new Date().getFullYear();
    const firstTwoDigits = currentYear.toString().slice(0, 2);

    var raw = JSON.stringify({
      amount: {
        currency: paymentData?.currency,
        value: 0, //For Authorize part
      },
      reference: `${paymentData?.transaction_code}`,
      paymentMethod: {
        type: "scheme",
        encryptedCardNumber: `test_${cardNumber.replaceAll(" ", "")}`,
        encryptedExpiryMonth: `test_${cardType1?.month}`,
        encryptedExpiryYear: `test_${firstTwoDigits}${cardType1?.year}`,
        encryptedSecurityCode: `test_${cvv}`,
        holderName: paymentData?.name,
      },
      shopperReference: resData?.customer_id,
      shopperInteraction: "Ecommerce",
      recurringProcessingModel: "CardOnFile",
      storePaymentMethod: true,
      returnUrl:
        "http://192.168.0.123:7071/api/pay-status/success/61F48DC26216D63E1A73EF8ED7A42943B594F6D2F89A6FE697",
      merchantAccount: "GroovywebECOM",
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    fetch("https://checkout-test.adyen.com/v70/payments", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (result?.resultCode === "Authorised") {
          SaveOrder(result?.pspReference, "adyen", resData?.customer_id, 1);
        } else {
          setPaySuccess("fail");
          setTimeout(() => {
            setPaySuccess(false);
          }, 5000);
          setBtnLoader(false);
        }
      })
      .catch((error) => {
        setPaySuccess("fail");
        setTimeout(() => {
          setPaySuccess(false);
        }, 5000);
        setBtnLoader(false);
      });
  };

  async function PaycallBack(code) {
    try {
      const response = await getApiDataProgressPayment(
        `${liveUrl}pay-callback/${code}`,
        "POST",
        {},
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
        }, 5000);
        setBtnLoader(false);
      } else {
        setPaySuccess("success");
        onPaymentDone();
      }
    } catch (error) {
      setPaySuccess("fail");
      setTimeout(() => {
        setPaySuccess(false);
      }, 5000);
      setBtnLoader(false);
      console.log("error:", error);
    }
  }

  //get card list
  async function getCardList() {
    setMainLoader(true);
    try {
      const data = {
        app_token: paymentData?.app_token,
        gateway_code: cardBrandSelect?.charge_object?.gateway_code,
        email: paymentData?.email,
        mode: paymentData?.mode,
        payment_method_id: cardBrandSelect?.charge_object?.payment_method_id,
        payment_sub_method_id: cardBrandSelect?.payment_sub_method_id,
      };

      const response = await getApiDataProgressPayment(
        `${liveUrl}fetch-user-payment-tokens`,
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
        const arr = response?.data.filter(
          (v) =>
            v?.cardType?.toLowerCase() ==
            cardBrandSelect["payment_sub_method.type"]?.toLowerCase()
        );
        setCusID(response?.customer_id);
        setCardList(arr);
      }
      setMainLoader(false);
    } catch (error) {
      setMainLoader(false);
      console.log("error:", error);
    }
  }

  function generateRandomString() {
    const characters =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let randomString = "";

    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }

    return randomString;
  }

  // authorize.net token
  async function getAuthorizeTrasId() {
    setBtnLoader(true);
    setPaySuccess("loading");

    const API_LOGIN_ID = originalText?.public_key;
    const TRANSACTION_KEY = originalText?.private_key;
    const cardType1 = creditCardType.expirationDate(expDate);

    // Set the API endpoint URL
    // const API_URL = 'https://api.authorize.net/xml/v1/request.api';
    const API_URL = "https://apitest.authorize.net/xml/v1/request.api";

    // get current year's first 2 digits
    const currentYear = new Date().getFullYear();
    const firstTwoDigits = currentYear.toString().slice(0, 2);

    const requestData = `
    <?xml version="1.0" encoding="UTF-8"?>
    <createCustomerProfileRequest xmlns="AnetApi/xml/v1/schema/AnetApiSchema.xsd"> 
    <merchantAuthentication>
    <name>${API_LOGIN_ID}</name>
    <transactionKey>${TRANSACTION_KEY}</transactionKey>
    </merchantAuthentication>
    <profile>
      <merchantCustomerId>${generateRandomString()}</merchantCustomerId>
      <description>Profile description here</description>
      <email>${paymentData?.email}</email>
      <paymentProfiles>
        <customerType>individual</customerType>
        <payment>
          <creditCard>
            <cardNumber>${cardNumber?.replaceAll(" ", "")}</cardNumber>
            <expirationDate>${firstTwoDigits}${cardType1.year}-${
      cardType1.month
    }</expirationDate>
          </creditCard>
          </payment>
      </paymentProfiles>
    </profile>
	<validationMode>testMode</validationMode>
  </createCustomerProfileRequest>
    `;

    try {
      const response = await axios.post(API_URL, requestData, {
        headers: {
          "Content-Type": "text/xml",
        },
      });
      // Handle the response here

      const data = response.data;
      const tokenMatch = data.match(/<resultCode>(.*?)<\/resultCode>/);
      if (tokenMatch[1] === "Ok") {
        const customerProfileID = data.match(
          /<customerProfileId>(.*?)<\/customerProfileId>/
        );
        createCustomerPayId(customerProfileID[1]);
      } else {
        Alert.alert("Error", "Please try again after some time.");
        setBtnLoader(false);
      }
    } catch (error) {
      // Handle errors here
      setBtnLoader(false);
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
    }
  }

  async function createCustomerPayId(customerID) {
    const API_LOGIN_ID = originalText?.public_key;
    const TRANSACTION_KEY = originalText?.private_key;
    const cardType1 = creditCardType.expirationDate(expDate);

    // Set the API endpoint URL
    // const API_URL = 'https://api.authorize.net/xml/v1/request.api';
    const API_URL = "https://apitest.authorize.net/xml/v1/request.api";

    // get current year's first 2 digits
    const currentYear = new Date().getFullYear();
    const firstTwoDigits = currentYear.toString().slice(0, 2);

    const requestData = `
    <?xml version="1.0" encoding="UTF-8"?>
    <createCustomerPaymentProfileRequest xmlns="AnetApi/xml/v1/schema/AnetApiSchema.xsd">
    <merchantAuthentication>
    <name>${API_LOGIN_ID}</name>
    <transactionKey>${TRANSACTION_KEY}</transactionKey>
    </merchantAuthentication>
    <customerProfileId>${customerID}</customerProfileId>
    <paymentProfile>
      <billTo>
        <firstName>test</firstName>
        <lastName>scenario</lastName>
        <company></company>
        <address>123 Main St.</address>
        <city>Bellevue</city>
        <state>WA</state>
        <zip>98004</zip>
        <country>USA</country>
        <phoneNumber>000-000-0000</phoneNumber>
        <faxNumber></faxNumber>
      </billTo>
      <payment>
        <creditCard>
        <cardNumber>${cardNumber?.replaceAll(" ", "")}</cardNumber>
        <expirationDate>${firstTwoDigits}${cardType1.year}-${
      cardType1.month
    }</expirationDate>
        </creditCard>
      </payment>
      <defaultPaymentProfile>false</defaultPaymentProfile>
    </paymentProfile>
  </createCustomerPaymentProfileRequest>
    `;

    try {
      const response = await axios.post(API_URL, requestData, {
        headers: {
          "Content-Type": "text/xml",
        },
      });
      // Handle the response here

      const data = response.data;
      const tokenMatch = data.match(/<resultCode>(.*?)<\/resultCode>/);
      if (tokenMatch[1] === "Ok") {
        const customerProfileID = data.match(
          /<customerPaymentProfileId>(.*?)<\/customerPaymentProfileId>/
        );
        SaveOrder(customerProfileID[1], "authorize", customerID, 1);
      } else {
        Alert.alert("Error", "Please try again after some time.");
        setBtnLoader(false);
      }
    } catch (error) {
      // Handle errors here
      setBtnLoader(false);
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
    }
  }

  //wePay tokenization
  async function getWePayToken() {
    // setBtnLoader(true);
    const cardType1 = creditCardType.expirationDate(expDate);

    // get current year's first 2 digits
    const currentYear = new Date().getFullYear();
    const firstTwoDigits = currentYear.toString().slice(0, 2);

    var apiUrl = "https://stage.wepayapi.com/v2/credit_card/create";

    var requestData = {
      client_id: 851951, // Replace with your client ID
      user_name: paymentData?.name,
      email: paymentData?.email,
      cc_number: cardNumber?.replaceAll(" ", "") || "4242424242424242",
      cvv: cvv || "123",
      expiration_month: cardType1.month || 12,
      expiration_year: cardType1.year || 2024,
      address: { country: "US" },
    };

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer stage_MTk5MDFfOGU1OWU5YTMtYjg2Mi00N2YwLTg3MGMtYjBhYWRkZjVkYTQ5", // Replace with your WePay access token
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => {
        response.json();
      })
      .then((data) => {
        if (data.error) {
          console.log(data);
          // Handle error response here
        } else {
          // Call your own app's API to save the token inside the data;
          // Show a success page
          console.log("Payment token:", data.id);
        }
      })
      .catch((error) => console.error("Error:", error));
  }

  return mainLoader ? (
    <View
      style={{
        height: 200,
        justifyContent: "center",
      }}
    >
      <ActivityIndicator size={"large"} animating color={"#0068EF"} />
    </View>
  ) : (
    <View>
      {isArray(cardList) && !isEmpty(cardList) && (
        <Text style={{ fontSize: 16, marginBottom: 10, color: "#000" }}>
          Saved card details
        </Text>
      )}
      {isArray(cardList) &&
        !isEmpty(cardList) &&
        cardList?.map((item, index) => {
          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              style={{
                borderWidth: 1,
                borderColor: "#9D9D9D",
                borderRadius: 6,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingLeft: 6,
                marginBottom: 10,
              }}
              onPress={() => {
                Alert.alert(
                  "",
                  `Are you sure you want to make payment with this card?`,
                  [
                    {
                      text: "Cancel",
                      onPress: () => console.log("Cancel Pressed"),
                      style: "cancel",
                    },
                    {
                      text: "OK",
                      onPress: () => {
                        if (
                          cardBrandSelect?.charge_object?.charges_obj
                            ?.gateway_name === "adyen" ||
                          cardBrandSelect?.charge_object?.charges_obj
                            ?.gateway_name === "authorize_net"
                        ) {
                          SaveOrder(item?.token, "adyen", cusMainID, 0);
                        } else {
                          SaveOrder(item?.token, "", "", 0);
                        }
                        setListLoader(index);
                        setPaySuccess("loading");
                      },
                    },
                  ]
                );
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
                    uri: cardBrandSelect["payment_sub_method.logo"],
                  }}
                  style={{
                    width: 50,
                    height: 50,
                    marginRight: 10,
                  }}
                  resizeMode="contain"
                  alt={item["payment_method.payment_method"]}
                />
                <Text style={{ fontSize: 16, color: "#000" }}>
                  XXXX XXXX XXXX{" "}
                  {item?.last4.length > 4 ? item?.last4.slice(-4) : item?.last4}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 16, color: "#000" }}>
                  {currency_symbol[paymentData?.currency]}
                  {finalAmount}
                </Text>

                {listLoader === index ? (
                  <ActivityIndicator
                    style={{ marginRight: 4 }}
                    size={"small"}
                    animating
                    color={"#0068EF"}
                  />
                ) : (
                  <MaterialIcons
                    name="arrow-right"
                    size={36}
                    color={"#0068EF"}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      <View
        style={{
          width: "100%",
        }}
      >
        <View
          style={{
            width: "100%",
            marginVertical: 8,
          }}
        >
          <Text style={{ fontSize: 16, color: "#000" }}>
            Enter card details
          </Text>
        </View>
        <View
          style={{
            width: "100%",
          }}
        >
          <TextInput
            mode="outlined"
            label={"Card number"}
            value={cardNumber}
            render={(props1) => (
              <TextInputMask
                {...props1}
                type={"credit-card"}
                options={{
                  obfuscated: false,
                  issuer: cardType,
                }}
                onChangeText={handleCardNumberChange}
              />
            )}
            outlineStyle={{ borderRadius: 6, borderWidth: 1 }}
            placeholderTextColor={"#9D9D9D"}
            style={styles.input}
            activeOutlineColor="#0068EF"
            outlineColor="#9D9D9D"
            error={cardErr?.card || !isEmpty(enteredCard)}
            placeholder="Card Number"
            theme={{ colors: { error: "red" } }}
            contentStyle={{ paddingBottom: 4 }}
            keyboardType="numeric"
          />
          {enteredCard && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <Text
                style={{
                  color: "red",
                }}
              >
                {`You have entered ${enteredCard} card, Please enter valid card.`}
                {/* <TouchableOpacity activeOpacity={0.7} onPress={() => {}}>
                  <Text
                    style={{
                      textDecorationLine: 'underline',
                      color: '#0068EF',
                      // marginTop: -4,
                    }}>
                    click here
                  </Text>
                </TouchableOpacity>
                <Text
                  style={{
                    color: 'red',
                  }}>{` to make payment by ${enteredCard} card`}</Text> */}
              </Text>
            </View>
          )}
          <View
            style={{
              flexDirection: "row",
              marginTop: 6,
              justifyContent: "space-between",
            }}
          >
            <TextInput
              mode="outlined"
              label={"Expire date"}
              value={expDate}
              render={(props1) => (
                <TextInputMask
                  {...props1}
                  type={"datetime"}
                  options={{
                    format: "MM/YY",
                  }}
                  onChangeText={handleCardExpChange}
                />
              )}
              outlineStyle={{ borderRadius: 6, borderWidth: 1 }}
              placeholder="MM/YY"
              keyboardType="numeric"
              placeholderTextColor={"#9D9D9D"}
              activeOutlineColor="#0068EF"
              outlineColor="#9D9D9D"
              theme={{ colors: { error: "red" } }}
              error={cardErr?.expire}
              style={[
                styles.input,
                {
                  width: "48%",
                },
              ]}
            />
            <TextInput
              mode="outlined"
              label={"CVV"}
              value={cvv}
              onChangeText={handleCvvChange}
              error={cardErr?.cvv}
              style={[
                styles.input,
                {
                  width: "48%",
                },
              ]}
              outlineStyle={{ borderRadius: 6, borderWidth: 1 }}
              activeOutlineColor="#0068EF"
              outlineColor="#9D9D9D"
              placeholder={"CVV"}
              placeholderTextColor={"#9D9D9D"}
              keyboardType="numeric"
              theme={{ colors: { error: "red" } }}
              maxLength={cardType === "amex" ? 4 : 3}
            />
          </View>
        </View>

        <Text style={{ color: "#9D9D9D", marginTop: 10, fontSize: 14 }}>
          <Icon name="shield-check" size={14} color={"#9D9D9D"} /> We are not
          storing any card details, So your data will be secure end to end.
        </Text>
        {chargeData?.service_type !== "inclusive" && (
          <View
            style={{
              marginTop: 10,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              Pricing Breakdown
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsShowBreackdown(!isShowBreackdown)}
            >
              <MaterialIcons
                name={!isShowBreackdown ? "arrow-drop-down" : "arrow-drop-up"}
                size={40}
                color={"#0068EF"}
                style={{ marginEnd: -10 }}
              />
            </TouchableOpacity>
          </View>
        )}
        {isShowBreackdown && chargeData?.service_type !== "inclusive" && (
          <>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: "#000",
                }}
                numberOfLines={2}
              >
                Amount:
              </Text>
              <Text
                style={{
                  fontSize: 16,
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
                justifyContent: "space-between",
                marginTop: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: "#000",
                }}
                numberOfLines={2}
              >
                Platform Fee:
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: "#000",
                  fontWeight: "bold",
                }}
                numberOfLines={2}
              >
                {currency_symbol[paymentData?.currency]}
                {amountToAdd}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: "#000",
                }}
                numberOfLines={2}
              >
                Payment Gateway Fee:
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: "#000",
                  fontWeight: "bold",
                }}
                numberOfLines={2}
              >
                {currency_symbol[paymentData?.currency]}
                {paymentGatwayFee}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: "#0068EF",
                }}
                numberOfLines={2}
              >
                Final Amount:
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: "#0068EF",
                  fontWeight: "bold",
                }}
                numberOfLines={2}
              >
                {currency_symbol[paymentData?.currency]}
                {finalAmount}
              </Text>
            </View>
          </>
        )}
        <View style={{ marginTop: 20 }}>
          <Cbutton
            {...props}
            loader={BtnLoader}
            disabled={isDisable || BtnLoader}
            buttonTitle={`Pay - ${
              currency_symbol[paymentData?.currency]
            }${finalAmount}`}
            onButtonClick={() => {
              Alert.alert(
                "",
                `Are you sure you want to make payment with this card?`,
                [
                  {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel",
                  },
                  {
                    text: "OK",
                    onPress: () => {
                      if (!isDisable && !BtnLoader) {
                        if (
                          cardBrandSelect?.charge_object?.charges_obj
                            ?.gateway_name === "stripe"
                        ) {
                          createTokenStripe();
                        } else if (
                          cardBrandSelect?.charge_object?.charges_obj
                            ?.gateway_name === "adyen"
                        ) {
                          SaveOrderAdyen();
                        } else if (
                          cardBrandSelect?.charge_object?.charges_obj
                            ?.gateway_name === "braintree"
                        ) {
                          createCusIdBraintree();
                        } else if (
                          cardBrandSelect?.charge_object?.charges_obj
                            ?.gateway_name === "authorize_net"
                        ) {
                          getAuthorizeTrasId();
                        } else if (
                          cardBrandSelect?.charge_object?.charges_obj
                            ?.gateway_name === "paypal"
                        ) {
                          makePaymentPaypal();
                        }
                      }
                    },
                  },
                ]
              );
            }}
          />
        </View>
      </View>
    </View>
  );
}

export default forwardRef(CustomCard);
