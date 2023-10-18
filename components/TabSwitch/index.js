/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Animated,
  TouchableOpacity,
  Text,
  View,
  Dimensions,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import { styles } from "./styles";
import LinearGradient from "react-native-linear-gradient";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { currency_symbol } from "../staticData";

/**
 * Component for TabSwitch
 * @function TabSwitch
 */

const BaseSetting = {
  nWidth: Dimensions.get("window").width,
  nHeight: Dimensions.get("window").height,
};

export default function TabSwitch(props) {
  const {
    tabSize,
    subTabSize,
    tabs,
    onTabChange,
    activeTab,
    onLongPress,
    isRTL = false,
    themeColor,
    chargeData,
    noCharge,
  } = props;

  const activeTabIndex = props.tabs.findIndex(
    (tab) => tab.id === props.activeTab.id
  );

  const IOS = Platform.OS === "ios";
  const [translateValue] = useState(
    new Animated.Value((isRTL ? -1 : 1) * (1 + activeTabIndex * tabSize + 20))
  );

  const [hideArrow, setHideArrow] = useState("top");

  const [isScrollable, setIsScrollable] = useState(false);
  // console.log('isScrollable======>', isScrollable);
  const scrollViewHeightRef = useRef(null);

  const setspring = (index) => {
    Animated.spring(translateValue, {
      toValue: (isRTL ? -1 : 1) * (1 + index * subTabSize),
      velocity: 10,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    setspring(activeTabIndex);
  }, [activeTab]);

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

  const handleContentSizeChange = (contentWidth, contentHeight) => {
    if (
      scrollViewHeightRef.current &&
      contentHeight > scrollViewHeightRef.current
    ) {
      setIsScrollable(true);
    } else {
      setIsScrollable(false);
    }
  };

  const handleLayout = (event) => {
    scrollViewHeightRef.current = event.nativeEvent.layout.height;
  };

  return (
    <View style={styles.container}>
      {/* // <View style={styles.shadow} /> */}
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
        // onContentSizeChange={handleContentSizeChange}
        // onLayout={handleLayout}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        horizontal
        // bounces={false}
        showsHorizontalScrollIndicator={false}
        style={[
          styles.wrapper,
          {
            width: tabSize,
            backgroundColor: themeColor,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.slider,
            {
              transform: [
                {
                  translateX: translateValue,
                },
              ],
              backgroundColor: themeColor,
              width: subTabSize,
              height:
                chargeData?.isPaymentGateWay && !noCharge ? 68 : IOS ? 48 : 44,
              borderBottomWidth: 2,
              borderBottomColor: "#0068EF",
            },
          ]}
        >
          <AntDesign
            name="caretdown"
            color={"#0068EF"}
            style={{
              position: "absolute",
              bottom: -8,
              zIndex: 1,
              fontSize: 10,
            }}
          />
        </Animated.View>
        {tabs.map((obj, index) => (
          <TouchableOpacity
            key={`${index + 1}`}
            activeOpacity={0.8}
            onPress={() => {
              onTabChange(obj);
            }}
            onLongPress={() => {
              onLongPress(obj?.charge_object?.charges_obj);
            }}
            style={{
              ...styles.tab,
              width: subTabSize,
              paddingBottom: 2,
            }}
          >
            <Image
              source={{ uri: obj["payment_sub_method.logo"] }}
              style={{
                width: 60,
                height: 40,
                marginBottom: 6,
              }}
              resizeMode="center"
              alt={obj["payment_sub_method.type"]}
            />
            {chargeData?.isPaymentGateWay && !noCharge && (
              <Text
                style={[
                  styles.tabText,
                  {
                    fontWeight: "bold",
                    color: "#000",
                    marginBottom: 10,
                  },
                ]}
              >
                {`${
                  Number(
                    obj?.charge_object?.charges_obj?.transaction_per || 0
                  ) +
                  Number(
                    obj?.charge_object?.charges_obj
                      ?.currency_conversion_percentage || 0
                  ) +
                  Number(
                    obj?.charge_object?.charges_obj
                      ?.international_charge_percentage || 0
                  )
                }% fee`}{" "}
                {obj?.charge_object?.charges_obj?.fixed_fee_amount &&
                  `+ ${
                    currency_symbol[
                      obj?.charge_object?.charges_obj?.fixed_fee_currency
                    ]
                  }${obj?.charge_object?.charges_obj?.fixed_fee_amount || ""}`}
              </Text>
            )}
          </TouchableOpacity>
        ))}
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
      {/* // <View style={styles.shadow} /> */}
    </View>
  );
}

TabSwitch.propTypes = {
  tabs: PropTypes.array,
  onTabChange: PropTypes.func,
  tabSize: PropTypes.number,
  subTabSize: PropTypes.number,
  activeTab: PropTypes.object,
  insideTab: PropTypes.bool,
};

TabSwitch.defaultProps = {
  tabs: [
    { id: "1", name: "tab 1" },
    { id: "2", name: "tab 2" },
  ],
  onTabChange: () => {},
  tabSize: BaseSetting.nWidth - 20,
  subTabSize: BaseSetting.nWidth * 0.35,
  activeTab: {},
  insideTab: false,
};
