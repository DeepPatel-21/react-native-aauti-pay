import RadioButton from "../RadioButton";
import _, { isEmpty, isArray } from "lodash";
import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";

export default function SubList(props) {
  const { buttonTextStyle, buttonContainerStyle, subscriptionData } = props;

  const styles = StyleSheet.create({
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
  });

  const [BtnLoader, setBtnLoader] = useState(false);

  return (
    <View>
      <View
        style={{
          borderBottomWidth: 1,
          padding: 20,
          position: "relative",
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{
            position: "absolute",
            top: 18,
            left: 18,
            zIndex: 1,
          }}
          onPress={() => {
            // setViewState('cardDetail');
          }}
        >
          <AntDesign name={"arrowleft"} size={26} color={"#000"} />
        </TouchableOpacity>
        <Text
          style={{
            textAlign: "center",
            fontSize: 20,
          }}
        >
          Subscription Plan
        </Text>
      </View>
      <View
        style={{
          padding: 20,
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {!isEmpty(subscriptionData?.data) && isArray(subscriptionData?.data) ? (
          subscriptionData?.data.map((item, index) => {
            return (
              <TouchableOpacity
                style={{
                  display: "flex",
                  width: "100%",
                  flexDirection: "row",
                  borderWidth: 1,
                  borderRadius: 4,
                  marginTop: 10,
                  padding: 10,
                }}
                onPress={() => {
                  //   setSelectedPlan(item);
                }}
              >
                <RadioButton
                  selected={item?.plan_id === selectPlan?.plan_id}
                  SelectedRadioColor={SelectedRadioColor}
                />
                <View>
                  <Text>{item?.name}</Text>
                  <Text style={{ marginTop: 4 }}>
                    {item?.price} {item?.currency} - {item?.period}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={{ height: 200, justifyContent: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>NO DATA</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={() => {
            if (isEmpty(selectPlan)) {
              Alert.alert("Error", "Please Select Subscribe plan first.");
            } else {
              //   setWebViewState({
              //     ...webViewState,
              //     modalBool: true,
              //     urlLink: `${liveUrl}subscription/${subscriptionData?.code}/${selectPlan?.plan_id}`,
              //   });
              //   setViewState('url');
            }
          }}
          style={[
            styles.buttonContainer,
            buttonContainerStyle,
            { width: "100%", marginTop: 30 },
          ]}
        >
          {BtnLoader ? (
            <ActivityIndicator
              size={"small"}
              animating
              color={loaderColor ? loaderColor : "white"}
            />
          ) : (
            <Text style={[styles.buttonTextContainer, buttonTextStyle]}>
              Subscribe
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
