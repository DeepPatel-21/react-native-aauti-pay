import React from 'react';
import {Text, View, TouchableOpacity, ActivityIndicator} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';

export default function Cbutton(props) {
  const {
    loader,
    onButtonClick,
    isGradientButton,
    startPosition,
    endPosition,
    linearColorsName,
    buttonTitle,
    disabled,
    loaderColor,
    mainButtonContainerStyle,
    buttonTextStyle,
  } = props;

  return !loader ? (
    <TouchableOpacity
      onPress={() => {
        onButtonClick();
      }}
      activeOpacity={0.7}
      disabled={disabled}
      style={[
        styles.buttonContainer,
        mainButtonContainerStyle,
        {opacity: disabled ? 0.7 : 1},
      ]}>
      {isGradientButton ? (
        <LinearGradient
          start={startPosition}
          end={endPosition}
          colors={linearColorsName}
          style={[styles.buttonContainer, mainButtonContainerStyle]}>
          <Text style={[styles.buttonTextContainer, buttonTextStyle]}>
            {buttonTitle}
          </Text>
        </LinearGradient>
      ) : (
        <Text style={[styles.buttonTextContainer, buttonTextStyle]}>
          {buttonTitle}
        </Text>
      )}
    </TouchableOpacity>
  ) : (
    <View style={[styles.buttonContainer, mainButtonContainerStyle]}>
      <ActivityIndicator
        size={'small'}
        animating
        color={loaderColor ? loaderColor : 'white'}
      />
    </View>
  );
}
