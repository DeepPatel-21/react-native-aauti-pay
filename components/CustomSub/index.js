import RadioButton from '../RadioButton';
import _, {isEmpty} from 'lodash';
import React, {useState} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';

export default function CustomSub(props) {
  const {buttonTextStyle, buttonContainerStyle, subscriptionData} = props;

  const styles = StyleSheet.create({
    buttonContainer: {
      backgroundColor: '#0068EF',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 5,
      margin: 5,
      height: 40,
      width: Dimensions.get('screen').width / 2.5,
      borderRadius: 3,
    },
    buttonTextContainer: {
      textAlign: 'center',
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
    },
  });

  const [BtnLoader, setBtnLoader] = useState(false);

  async function getCustomURL() {
    setBtnLoader(true);

    const Ddata = {...paymentData, card: periodSelect};
    try {
      const response = await getApiDataProgressPayment(
        `${liveUrl}custom-subscription-order`,
        'POST',
        JSON.stringify(Ddata),
      );
      if (response?.status == false) {
        Alert.alert(
          'Error',
          response?.message || 'Please try again. Something got wrong.',
        );
      } else {
        // setWebViewState({
        //   ...webViewState,
        //   modalBool: true,
        //   urlLink: `${liveUrl}custom-subscription/${response?.data?.code}/${response?.data?.plan_code}`,
        // });
        // setViewState('url');
      }
      setBtnLoader(false);
    } catch (error) {
      setBtnLoader(false);
      console.log('error:', error);
    }
  }

  return (
    <View>
      <View
        style={{
          borderBottomWidth: 1,
          padding: 20,
          position: 'relative',
        }}>
        <Text
          style={{
            textAlign: 'center',
            fontSize: 20,
          }}>
          Custom Plan
        </Text>
      </View>
      <View
        style={{
          padding: 20,
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text
          style={{
            fontSize: 20,
          }}>{`Amount :- ${paymentData?.amount}`}</Text>
        <TouchableOpacity
          onPress={() => {
            if (isEmpty(periodSelect)) {
              Alert.alert('Error', 'Please Select Period for plan first.');
            } else {
              // getCustomURL();
            }
          }}
          style={[
            styles.buttonContainer,
            buttonContainerStyle,
            {width: '100%', marginTop: 30},
          ]}>
          {BtnLoader ? (
            <ActivityIndicator
              size={'small'}
              animating
              color={loaderColor ? loaderColor : 'white'}
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
