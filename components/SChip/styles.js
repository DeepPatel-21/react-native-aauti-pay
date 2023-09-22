import {StyleSheet} from 'react-native';
import {BaseColors} from '../theme';

export const styles = StyleSheet.create({
  main: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  mainSquare: {
    borderRadius: 5,
  },
  mainRound: {
    borderRadius: 50,
  },
  mainPrimary: {
    backgroundColor: '#0068EF',
  },
  mainOutlind: {
    borderWidth: 1,
    borderColor: '#0068EF',
    backgroundColor: 'white',
  },

  Dtext: {
    textTransform: 'capitalize',
    color: BaseColors?.black,
  },
  PrimaryText: {
    color: 'white',
  },
  outlinedText: {
    color: '#0068EF',
  },

  cancelBtn: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: 'white',
    borderRadius: 50,
  },
});
