import {Dimensions, StyleSheet} from 'react-native';

const pColor = '#0068EF';
const sColor = '#9D9D9D';
const deviceHeight = Dimensions.get('screen').height;
const deviceWidth = Dimensions.get('screen').width;

export default StyleSheet.create({
  Main: {
    width: '100%',
  },
  DropDown: {
    minHeight: 54,
    maxHeight: deviceHeight * 0.15,
    width: '100%',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 5,
    paddingRight: 15,
    borderRadius: 6,
    // backgroundColor: BaseColors.re,
    overflow: 'hidden',
    borderColor: sColor,
  },
  DropArea: {
    backgroundColor: 'white',
    minHeight: deviceHeight * 0.07,
    maxHeight: deviceHeight / 2,
    width: '100%',
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: sColor,
    overflow: 'hidden',
  },
  searchBox: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    color: pColor,
    borderWidth: 1,
    paddingVertical: 10,
    borderColor: sColor,
  },
  ItemView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  selectedItem: {
    // backgroundColor: pColor,
  },
  ChipContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  IconContainer: {
    alignSelf: 'center',
    // marginLeft: 5,
    // marginTop: 10,
  },
  ItemText: {
    color: 'black',
    fontSize: 16,
  },
  selectedText: {
    color: 'black',
    fontWeight: '600',
  },
  labelCon: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  labelTxt: {
    fontSize: 14,
    color: 'black',
    textTransform: 'capitalize',
    marginRight: 5,
  },
  astrick: {
    color: 'red',
    position: 'absolute',
    top: -3,
    right: 0,
  },
  errBox: {
    padding: 5,
  },
  errText: {
    color: 'red',
    fontSize: 11,
  },
  placeholder: {
    color: sColor,
    textTransform: 'capitalize',
    marginLeft: 10,
    fontSize: 18,
  },
});
