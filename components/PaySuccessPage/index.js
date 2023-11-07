/* eslint-disable react-native/no-inline-styles */
import { View, Text, Image, ActivityIndicator } from "react-native";
import React from "react";
import { BaseColors } from "../theme";

const PaySuccess = ({ responseType, message }) => {
  const isLoading = responseType === "loading";
  const payFail = responseType === "fail";
  const paySuccessFull = responseType === "success";
  return (
    <>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color={"#0068EF"} />
        ) : (
          <Image
            resizeMode="contain"
            alt="Aauti"
            source={
              paySuccessFull
                ? require("../Images/success.png")
                : require("../Images/fail.png")
            }
            style={{
              width: 100,
              height: 100,
            }}
          />
        )}
        <Text
          style={{
            fontSize: 22,
            color: "#000",
            fontWeight: "700",
            marginTop: 20,
            textAlign: "center",
          }}
        >
          {isLoading
            ? "Processing Payment"
            : paySuccessFull
            ? "Payment Successfull!"
            : "Payment Failed!"}
        </Text>
        <Text
          style={{
            color: BaseColors.lighGreytTxt,
            width: 320,
            fontWeight: "500",
            marginTop: 4,
            textAlign: "center",
            fontSize: 18,
          }}
        >
          {isLoading
            ? "Please wait, This process might take some time. Please do not hit back button or close app."
            : paySuccessFull
            ? "Your payment has been successful!"
            : message || "Any amount deducted will be refunded within 7 days"}
        </Text>
      </View>

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
          Powered by
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
    </>
  );
};

export default PaySuccess;
