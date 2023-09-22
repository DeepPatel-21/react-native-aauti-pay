/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from "react";
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
  } = props;

  const activeTabIndex = props.tabs.findIndex(
    (tab) => tab.id === props.activeTab.id
  );
  const IOS = Platform.OS === "ios";

  const [translateValue] = useState(
    new Animated.Value((isRTL ? -1 : 1) * (1 + activeTabIndex * tabSize + 20))
  );

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

  const renderTabData = () => {
    return (
      <View style={styles.container}>
        {/* // <View style={styles.shadow} /> */}
        {/* <LinearGradient
          colors={[
            'rgba(0,0,0,0.09)',
            'rgba(0,0,0,0.07)',
            'rgba(0,0,0,0.05)',
            'rgba(0,0,0,0.03)',
            'rgba(0,0,0,0.01)',
          ]}
          style={{
            position: 'absolute',
            left: 10,
            height: '100%',
            width: 10,
            zIndex: 1,
          }}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        /> */}
        <ScrollView
          horizontal
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
                borderBottomWidth: 2,
                borderBottomColor: "#0068EF",
              },
            ]}
          >
            <AntDesign
              name="caretdown"
              color={"#0068EF"}
              style={{ position: "absolute", bottom: -8 }}
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
                onLongPress(obj?.charge_object?.longpress_data);
                // console.log('hiii');
              }}
              style={{
                ...styles.tab,
                width: subTabSize,
              }}
            >
              <Image
                source={{ uri: obj["payment_sub_method.logo"] }}
                style={{
                  width: 40,
                  height: 40,
                }}
                resizeMode="contain"
                alt={obj["payment_sub_method.type"]}
              />
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
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* <LinearGradient
          colors={[
            'rgba(0,0,0,0.09)',
            'rgba(0,0,0,0.07)',
            'rgba(0,0,0,0.05)',
            'rgba(0,0,0,0.03)',
            'rgba(0,0,0,0.01)',
          ]}
          style={{
            position: 'absolute',
            right: 10,
            height: '100%',
            width: 10,
            zIndex: 4,
          }}
          start={{x: 1, y: 0}}
          end={{x: 0, y: 0}}
        /> */}
        {/* // <View style={styles.shadow} /> */}
      </View>
    );
  };

  return renderTabData();
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
