import {Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {styles} from './styles';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SChip = ({
  type = 'primary',
  text = '',
  shape = 'square',
  chipStyle = {},
  TextStyle = {},
  onPress,
  onCacelPress,
  cancelBtn = false,
  leftIcon,
  rightIcon,
}) => {
  const opacity = onPress ? 0.8 : 1;
  const ShapeStyle =
    shape === 'square'
      ? styles.mainSquare
      : shape === 'round'
      ? styles.mainRound
      : null;
  let BStyle = {};
  let TStyle = {};

  switch (type) {
    case 'primary':
      BStyle = styles.mainPrimary;
      TStyle = styles.PrimaryText;
      break;
    case 'outlined':
      BStyle = styles.mainOutlind;
      TStyle = styles.outlinedText;
      break;
    case 'text':
      BStyle = {};
      TStyle = {};
      break;
    default:
      BStyle = {};
      TStyle = {};
      break;
  }

  return (
    <TouchableOpacity
      activeOpacity={opacity}
      style={[styles.main, BStyle, ShapeStyle, chipStyle]}
      onPress={() => onPress && onPress(text)}>
      {leftIcon}
      <Text style={[styles.Dtext, TStyle, TextStyle]}>{text}</Text>
      {rightIcon}
      {cancelBtn && (
        <TouchableOpacity
          onPress={() => onCacelPress && onCacelPress(text)}
          style={styles.cancelBtn}>
          <Icon name="cancel" size={12} color={'red'} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default SChip;
