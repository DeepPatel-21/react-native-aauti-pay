/* eslint-disable react-native/no-inline-styles */
import {isEmpty, isArray} from 'lodash';
import React from 'react';
import {Text, View, TouchableOpacity, Modal} from 'react-native';
import styles from './style';
import {currency_symbol} from '../staticData';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Cbutton from '../CButton';

export default function ConfirmationModal(props) {
  const {
    chargeData,
    noCharge,
    title = '',
    handleCancel = () => {},
    handleConfirm = () => {},
    showConfirmation = false,
    paymentGatwayFee,
    paymentData,
    finalAmount,
    changeBtnText,
  } = props;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showConfirmation}
      onRequestClose={handleCancel}>
      <View style={styles.confirmationModalCenteredView}>
        <View style={[styles.confirmationModalView]}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}>
            <Text style={[styles.confirmationModalTitleText]}>{title}</Text>
            {changeBtnText && (
              <TouchableOpacity activeOpacity={0.7} onPress={handleCancel}>
                <AntDesign
                  name="closecircle"
                  style={{
                    fontSize: 24,
                    color: 'red',
                  }}
                />
              </TouchableOpacity>
            )}
          </View>
          {changeBtnText && !noCharge && (
            <>
              <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                Pricing Breakdown :-
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 6,
                }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: '#000',
                  }}
                  numberOfLines={2}>
                  Amount:
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: '#000',
                    fontWeight: 'bold',
                  }}
                  numberOfLines={2}>
                  {currency_symbol[paymentData?.currency]}
                  {chargeData?.withoutChargeAmount?.toFixed(2)}
                </Text>
              </View>

              {isArray(chargeData?.mainChargeData) &&
                !isEmpty(chargeData?.mainChargeData) &&
                chargeData?.mainChargeData?.map((item, index) => {
                  const amountToAdd = (item?.value * paymentData?.amount) / 100;
                  return (
                    <View
                      key={index}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 4,
                      }}>
                      <Text
                        style={{
                          fontSize: 16,
                          color: '#000',
                        }}
                        numberOfLines={2}>
                        {item?.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          color: '#000',
                          fontWeight: 'bold',
                        }}
                        numberOfLines={2}>
                        {currency_symbol[paymentData?.currency]}
                        {item?.slug === 'payment_gateway_fee'
                          ? paymentGatwayFee
                          : amountToAdd?.toFixed(2)}
                      </Text>
                    </View>
                  );
                })}

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 4,
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: '#0068EF',
                  }}
                  numberOfLines={2}>
                  Final Amount:
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: '#0068EF',
                    fontWeight: 'bold',
                  }}
                  numberOfLines={2}>
                  {currency_symbol[paymentData?.currency]}
                  {Number(finalAmount)?.toFixed(2)}
                </Text>
              </View>
            </>
          )}
          <View style={styles.modalButtons}>
            <View style={{width: changeBtnText ? '100%' : '49%'}}>
              <Cbutton
                {...props}
                buttonTitle={
                  changeBtnText
                    ? `${changeBtnText} ${
                        currency_symbol[paymentData?.currency]
                      }${Number(finalAmount)?.toFixed(2)}`
                    : 'Yes'
                }
                onButtonClick={handleConfirm}
              />
            </View>
            {!changeBtnText && (
              <View style={{width: '49%'}}>
                <Cbutton
                  {...props}
                  buttonTitle={'No'}
                  onButtonClick={handleCancel}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
