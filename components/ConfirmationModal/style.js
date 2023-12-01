import {BaseColors} from '../theme';

const {StyleSheet} = require('react-native');

const styles = StyleSheet.create({
  confirmationModalCenteredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BaseColors.black50,
  },
  confirmationModalView: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    width: '90%',
    position: 'relative',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
  },
  confirmationModalTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    width: '90%',
  },
  confirmationModalText: {
    color: BaseColors.textColor,
    marginBottom: 20,
  },
  confirmmodaltitleText: {
    marginBottom: 10,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 30,
    color: BaseColors.black,
  },
  confirmmodalText: {
    color: BaseColors.textColor,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    // backgroundColor: 'pink',
  },
  confirmButton: {
    backgroundColor: BaseColors.primary,
  },
  cancelButton: {
    backgroundColor: BaseColors.secondary,
  },
  buttonText: {
    color: BaseColors.white,
    fontWeight: 'bold',
  },
});

export default styles;
