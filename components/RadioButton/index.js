import React, {useState} from 'react';
import {View, TouchableOpacity, Text} from 'react-native';

export default function RadioButton(props) {
  const {
    Title,
    onPress = () => {
      null;
    },
    selected,
    SelectedRadioColor,
  } = props;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      style={{flexDirection: 'row', paddingVertical: 10}}>
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 50,
          borderWidth: 2,
          padding: 3,
          backgroundColor: '#fff',
          borderColor: selected ? SelectedRadioColor : '#484848',
        }}>
        <View
          style={{
            backgroundColor: selected ? SelectedRadioColor : '#fff',
            borderRadius: 50,
            width: '100%',
            height: '100%',
          }}
        />
      </View>
      <Text
        style={{
          color: '#585858',
          alignSelf: 'center',
          fontSize: 16,
          marginHorizontal: 10,
        }}>
        {Title}
      </Text>
    </TouchableOpacity>
  );
}
