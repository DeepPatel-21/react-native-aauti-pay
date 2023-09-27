/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { BaseColors } from "../theme";
import { cloneDeep, isArray, isEmpty, isObject, isUndefined } from "lodash";
import CryptoJS from "react-native-crypto-js";
import { getApiDataProgressPayment } from "../APIHelper";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Icon from "react-native-vector-icons/Octicons";
import axios from "axios";
import { currency_symbol } from "../staticData";
import { HelperText, TextInput } from "react-native-paper";
import DropSelect from "../DropSelect";
import Cbutton from "../CButton";

const DForm = (props) => {
  const {
    PayObj,
    paymentData,
    liveUrl,
    onPaymentDone,
    setPaySuccess,
    themeColor,
    isChargeIncluded,
  } = props;
  const [paymentObj, setPaymentObj] = useState({});
  const [btnLoader, setBtnLoader] = useState(false);
  const [isFocused, setIsFocused] = useState("");
  const [cardList, setCardList] = useState([]);
  const [cusMainID, setCusID] = useState("");
  const [listLoader, setListLoader] = useState("");
  const [mainLoader, setMainLoader] = useState(false);

  useEffect(() => {
    getCardList();
    setPaymentObj(cloneDeep(PayObj?.ach_fields));
  }, []);

  const styles = StyleSheet.create({
    root: { flex: 1, justifyContent: "center", alignItems: "center" },
    buttonContainer: {
      backgroundColor: "#0068EF",
      justifyContent: "center",
      alignItems: "center",
      padding: 5,
      margin: 5,
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
    },
  });

  const myInput = (obj, key) => {
    return (
      <TextInput
        mode="outlined"
        label={
          isFocused === obj?.title || !isEmpty(obj?.answer)
            ? `Enter ${obj?.title}`
            : ""
        }
        underlineColor="red"
        value={obj?.answer}
        onChangeText={(val) => {
          changeValObj(val, key);
        }}
        outlineStyle={{
          borderRadius: 6,
          borderWidth: 1,
        }}
        placeholderTextColor={"#9D9D9D"}
        style={styles.input}
        onFocus={() => setIsFocused(obj?.title)}
        onBlur={() => setIsFocused("")}
        activeOutlineColor="#0068EF"
        maxLength={obj?.length}
        outlineColor="#9D9D9D"
        error={obj?.error}
        placeholder={`Enter ${obj?.title}`}
        keyboardType={obj?.type === "number" ? "numeric" : "default"}
        theme={{ colors: { error: "red" } }}
        contentStyle={{ paddingBottom: 4 }}
      />
    );
  };

  const myDrop = (obj, key) => {
    const newV = obj?.value?.split(",")?.map((it) => {
      return { name: it.trim() };
    });
    return (
      <View style={{ marginTop: 8 }}>
        <DropSelect
          placeholder={`Select ${obj?.title}`}
          itemArray={newV}
          value={obj?.answer && [{ name: obj?.answer }]}
          onSelect={(val) => {
            changeValObj(val[0]?.name, key);
          }}
          ErrState={obj?.error}
          dropdownStyle={{ borderColor: obj?.error ? "red" : "#9D9D9D" }}
        />
      </View>
    );
  };

  const changeValObj = (val, key) => {
    const dummy_obj = { ...paymentObj };
    dummy_obj[key].answer = val;
    dummy_obj[key].error = false;

    setPaymentObj(dummy_obj);
  };

  const Validation = () => {
    let valid = true;
    const dummy_obj = { ...paymentObj };

    Object.keys(dummy_obj).map((key) => {
      const item = dummy_obj[key];
      if (!item?.answer || isEmpty(item?.answer)) {
        valid = false;
        dummy_obj[key].error = true;
        dummy_obj[key].errmsg = `Please enter ${item?.title}`;
      } else if (
        item?.answer.length !== item?.length &&
        (key === "account_number" || key === "routing_number")
      ) {
        valid = false;
        dummy_obj[key].error = true;
        dummy_obj[key].errmsg = `Please enter valid ${item?.title}`;
      }
    });

    setPaymentObj(dummy_obj);
    if (valid) {
      Alert.alert("", `Are you sure you want to make payment with this bank?`, [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            if (PayObj?.charge_object?.charges_obj?.gateway_name === "stripe") {
              createTokenStripe();
            } else if (
              PayObj?.charge_object?.charges_obj?.gateway_name ===
              "authorize_net"
            ) {
              !isEmpty(cusMainID)
                ? createTokenAuthorize(cusMainID)
                : getAuthorizeTrasId();
            } else {
              createTokenAdyen();
            }
          },
        },
      ]);
    }
  };

  async function SaveOrder(bankData, isNew, cusID) {
    setPaySuccess("loading");
    try {
      const data = {
        name: paymentData?.name,
        amount: paymentData?.amount,
        final_amount: isChargeIncluded
          ? PayObj?.charge_object?.charges_obj?.final_amount
          : paymentData?.amount,
        app_token: paymentData?.app_token,
        country_id: PayObj?.country_id,
        currency: paymentData?.currency,
        mode: paymentData?.mode,
        payment_method_id: PayObj?.payment_method_id,
        payment_sub_method_id: PayObj?.payment_sub_method_id,
        transaction_code: paymentData?.transaction_code,
        gateway_code: PayObj?.charge_object?.gateway_code,
        gateway_id: PayObj?.gateway_id,
        email: paymentData?.email,
      };
      const response = await getApiDataProgressPayment(
        `${liveUrl}save-order`,
        "POST",
        JSON.stringify(data)
      );
      if (response?.status == false) {
        Alert.alert(
          "Error",
          response?.message || "Please try again. Something got wrong."
        );
      } else {
        paymentApi(bankData, isNew, cusID, response?.code);
      }
    } catch (error) {
      console.log("error:", error);
    }
  }

  async function paymentApi(bankData, isNew, cusID, code) {
    const isType = PayObj?.charge_object?.charges_obj?.gateway_name;
    let final_data = {
      amount: {
        amount: paymentData?.amount,
        final_amount: isChargeIncluded
          ? PayObj?.charge_object?.charges_obj?.final_amount
          : paymentData?.amount,
      },
    };
    if (isType === "adyen" || isType === "authorize_net") {
      final_data.token = bankData;
      final_data.customer_id = !isEmpty(cusID) ? cusID : cusMainID;
    } else {
      final_data.bank = {
        bank_id: isNew === 0 ? bankData : bankData?.bank_account?.id,
      };
      if (isNew === 1) {
        final_data.bank.token = bankData?.id;
      }
    }

    // Encrypt
    let ciphertext = CryptoJS.AES.encrypt(
      JSON.stringify(final_data),
      "470cb677d807b1e0017c50b"
    ).toString();

    const Ddata = {
      data: ciphertext || "",
      order_code: code,
      is_new: isNew,
    };

    try {
      const response = await getApiDataProgressPayment(
        `${liveUrl}custom-checkout`,
        "POST",
        JSON.stringify(Ddata)
      );
      if (isUndefined(response) || response?.status === false) {
        setPaySuccess("fail", response?.message);
        setTimeout(() => {
          setPaySuccess(false);
        }, 2000);
      } else {
        setPaySuccess("success");
        onPaymentDone();
      }
      setBtnLoader(false);
    } catch (error) {
      console.log("📌 ⏩ file: index.js:123 ⏩ paymentApi ⏩ error:", error);
      setBtnLoader(false);
    }
  }

  //stripe token
  const createTokenStripe = async () => {
    setPaySuccess("loading");
    setBtnLoader(true);
    const stripeSecretKey =
      "sk_test_51Lp74WLvsFbqn13Lg5HIXlLhey0yNEaDiJOHzBxjRweXf4DAiE6VSriOhEi71XB2WODBO0E19ZQbRsCoYMlgoGMY00kZzA0HJ6";

    const apiUrl = "https://api.stripe.com/v1/tokens";

    const body = new URLSearchParams({
      "bank_account[country]": paymentData?.country_code,
      "bank_account[currency]": paymentData?.currency,
      "bank_account[account_holder_name]":
        paymentObj?.account_holder_name?.answer,
      "bank_account[account_holder_type]":
        paymentObj?.account_holder_type?.answer,
      "bank_account[routing_number]": paymentObj?.routing_number?.answer,
      "bank_account[account_number]": paymentObj?.account_number?.answer,
    });

    const headers = new Headers({
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    });

    fetch(apiUrl, {
      method: "POST",
      headers: headers,
      body: body.toString(),
    })
      .then((response) => response.json())
      .then((data) => {
        SaveOrder(data, 1);
      })
      .catch((error) => {
        setBtnLoader(false);
        console.error("Error:", error);
      });
  };

  //adyen token
  const createTokenAdyen = async () => {
    setPaySuccess("loading");
    setBtnLoader(true);
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "X-API-Key",
      "AQErhmfxK4PGaR1Fw0m/n3Q5qf3Vb5lCAoVTT2BUqmAZb0xtS+fZCSp5LByo8RDBXVsNvuR83LVYjEgiTGAH-hHkppXVNIpKISBipTv5+LSDZi86CBhBVb+pnqfZ5okU=-eF*@2Sd=v?9,y}FG"
    );

    var raw = JSON.stringify({
      amount: {
        currency: paymentData?.currency,
        value: 0, //For Authorize part
      },
      reference: `${paymentData?.transaction_code}`,
      paymentMethod: {
        type: "ach",
        bankAccountNumber: paymentObj?.account_number?.answer,
        bankLocationId: paymentObj?.routing_number?.answer,
        ownerName: paymentObj?.account_holder_name?.answer,
      },
      shopperReference: cusMainID,
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
          SaveOrder(result?.pspReference, 1);
        } else {
          setPaySuccess("fail");
          setTimeout(() => {
            setPaySuccess(false);
          }, 3000);
          setBtnLoader(false);
        }
      })
      .catch((error) => {
        setPaySuccess("fail");
        setTimeout(() => {
          setPaySuccess(false);
        }, 3000);
        setBtnLoader(false);
      });
  };

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

  //authorize token
  async function getAuthorizeTrasId() {
    setPaySuccess("loading");
    setBtnLoader(true);
    const API_LOGIN_ID = "6S8Pk6gQ4f";
    const TRANSACTION_KEY = "4T9w3kx723gSVUF7";

    // Set the API endpoint URL
    // const API_URL = 'https://api.authorize.net/xml/v1/request.api';
    const API_URL = "https://apitest.authorize.net/xml/v1/request.api";

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
          <bankAccount>
            <accountType>${paymentObj?.account_holder_type?.answer?.toLowerCase()}</accountType>
            <routingNumber>${paymentObj?.routing_number?.answer}</routingNumber>
            <accountNumber>${paymentObj?.account_number?.answer}</accountNumber>
            <nameOnAccount>${
              paymentObj?.account_holder_name?.answer
            }</nameOnAccount>
          </bankAccount>
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
        createTokenAuthorize(customerProfileID[1]);
      } else {
        Alert.alert("Error", "Please try again after some time.");
        setPaySuccess("fail");
        setTimeout(() => {
          setPaySuccess(false);
        }, 2000);
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

  async function createTokenAuthorize(cusID) {
    setPaySuccess("loading");
    setBtnLoader(true);
    const API_LOGIN_ID = "6S8Pk6gQ4f";
    const TRANSACTION_KEY = "4T9w3kx723gSVUF7";

    // Set the API endpoint URL
    // const API_URL = 'https://api.authorize.net/xml/v1/request.api';
    const API_URL = "https://apitest.authorize.net/xml/v1/request.api";

    const requestData = `
    <?xml version="1.0" encoding="UTF-8"?>
<createCustomerPaymentProfileRequest xmlns="AnetApi/xml/v1/schema/AnetApiSchema.xsd">
  <merchantAuthentication>
  <name>${API_LOGIN_ID}</name>
  <transactionKey>${TRANSACTION_KEY}</transactionKey>
  </merchantAuthentication>
  <customerProfileId>${cusID}</customerProfileId>
  <paymentProfile>
    <payment>
      <bankAccount>
        <accountType>${paymentObj?.account_holder_type?.answer?.toLowerCase()}</accountType>
        <routingNumber>${paymentObj?.routing_number?.answer}</routingNumber>
        <accountNumber>${paymentObj?.account_number?.answer}</accountNumber>
        <nameOnAccount>${
          paymentObj?.account_holder_name?.answer
        }</nameOnAccount>
      </bankAccount>
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
      const customerProfileID = data.match(
        /<customerPaymentProfileId>(.*?)<\/customerPaymentProfileId>/
      );
      SaveOrder(customerProfileID[1], 1, cusID);
    } catch (error) {
      // Handle errors here
      setPaySuccess("fail");
      setTimeout(() => {
        setPaySuccess(false);
      }, 2000);
      setBtnLoader(false);
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
    }
  }

  //get card list
  async function getCardList() {
    setMainLoader(true);
    try {
      const data = {
        app_token: paymentData?.app_token,
        gateway_code: PayObj?.charge_object?.gateway_code,
        email: paymentData?.email,
        mode: paymentData?.mode,
        payment_method_id: PayObj?.charge_object?.payment_method_id,
      };

      const response = await getApiDataProgressPayment(
        `${liveUrl}fetch-user-payment-tokens`,
        "POST",
        JSON.stringify(data)
      );
      if (response?.status == false) {
        Alert.alert(
          "Error",
          response?.message || "Please try again. Something got wrong."
        );
      } else {
        setCardList(response?.data);
        setCusID(response?.customer_id);
      }
      setMainLoader(false);
    } catch (error) {
      setMainLoader(false);
      console.log("error:", error);
    }
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
    <>
      {isArray(cardList) && !isEmpty(cardList) && (
        <Text style={{ fontSize: 16, marginBottom: 10, color: "#000" }}>
          Saved bank details
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
                paddingVertical: 8,
                // marginBottom: 10,
              }}
              onPress={() => {
                Alert.alert(
                  "",
                  `Are you sure you want to make payment with this bank?`,
                  [
                    {
                      text: "Cancel",
                      onPress: () => console.log("Cancel Pressed"),
                      style: "cancel",
                    },
                    {
                      text: "OK",
                      onPress: () => {
                        SaveOrder(item?.token, 0);
                        setPaySuccess("loading");
                        setListLoader(index);
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
                <MaterialCommunityIcons
                  name="bank"
                  size={30}
                  color={BaseColors.black70}
                />
                <Text style={{ fontSize: 16, marginLeft: 10, color: "#000" }}>
                  XXXX XXXX XXXX{" "}
                  {item?.last4.length > 4 ? item?.last4.slice(-4) : item?.last4}
                </Text>
              </View>

              {listLoader === index ? (
                <ActivityIndicator
                  style={{ marginRight: 4 }}
                  size={"small"}
                  animating
                  color={"#0068EF"}
                />
              ) : (
                <MaterialIcons name="arrow-right" size={36} color={"#0068EF"} />
              )}
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
            marginTop: 10,
          }}
        >
          <Text style={{ fontSize: 16, color: "#000" }}>
            Enter bank details
          </Text>
        </View>
        {isObject(paymentObj) &&
          !isEmpty(paymentObj) &&
          Object.keys(paymentObj)?.map((key, index) => {
            const item = paymentObj[key];
            return (
              <View style={{ marginTop: 4 }} key={key}>
                {item?.type === "dropdown"
                  ? myDrop(item, key)
                  : myInput(item, key)}
                {item?.error && (
                  <HelperText
                    type="error"
                    padding="none"
                    theme={{ colors: { error: "red" } }}
                  >
                    {item?.errmsg}
                  </HelperText>
                )}
              </View>
            );
          })}

        <Text style={{ color: "#9D9D9D", marginTop: 10, fontSize: 18 }}>
          <Icon name="shield-check" size={20} color={"#9D9D9D"} /> We are not
          storing any bank details, So your data will be secure end to end.
        </Text>
        <View style={{ marginTop: 20 }}>
          <Cbutton
            {...props}
            loader={btnLoader}
            disabled={btnLoader}
            buttonTitle={`Pay - ${currency_symbol[paymentData?.currency]}${
              isChargeIncluded
                ? PayObj?.charge_object?.charges_obj?.final_amount
                : paymentData?.amount
            }`}
            onButtonClick={() => Validation()}
          />
        </View>
      </View>
    </>
  );
};

export default DForm;
