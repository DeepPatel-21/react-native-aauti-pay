/* eslint-disable react-native/no-inline-styles */
import { View, Text, Image, ActivityIndicator } from "react-native";
import React from "react";
import { BaseColors } from "../theme";

const PaySuccess = ({ responseType, message }) => {
  const isLoading = responseType === "loading";
  const payFail = responseType === "fail";
  const paySuccessFull = responseType === "success";
  const isWait = responseType === "wait";
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
                : isWait
                ? require("../Images/wait.png")
                : require("../Images/fail.png")
            }
            style={{
              width: isWait ? 140 : 100,
              height: isWait ? 140 : 100,
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
            : isWait
            ? ""
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
          source={{
            uri: "https://groovyspace.fra1.digitaloceanspaces.com/aauti/1699612506-image_2023_11_10T10_33_17_245Z.png",
          }}
          style={{
            width: 180,
            height: 60,
          }}
        />
      </View>
    </>
  );
};

export default PaySuccess;
