const { StyleSheet, Dimensions, Platform } = require("react-native");

const IOS = Platform.OS === "ios";
const deviceHeight = Dimensions.get("screen").height;
const deviceWidth = Dimensions.get("screen").width;

const styles = StyleSheet.create({
  paymentBoxWrapper: {
    // flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "flex-start",
    justifyContent: "flex-start",
    paddingHorizontal: 10,
  },
  paymentSectionTitle: {
    paddingVertical: 10,
  },
  typeText: {
    fontSize: 18,
    color: "#1D1D1D",
    opacity: 0.5,
    marginLeft: 20,
    fontWeight: "bold",
    marginTop: 10,
  },

  modalWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#0000",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.17,
    shadowRadius: 3.05,
    elevation: 4,
  },
  modalHeader: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#E7EFFB",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.17,
    shadowRadius: 3.05,
    elevation: 4,
  },
  paymentBox: {
    borderWidth: 1,
    width: deviceWidth / 2 - 30,
    height: deviceWidth / 2.3 - 30,
    margin: 10,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  paymentSmallBox: {
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#fff",
    minHeight: deviceHeight * 0.14,
    maxHeight: deviceHeight * 0.13,
    marginRight: 0,
  },
  boxImageWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  paymentMethodText: {
    fontSize: 18,
    color: "#000",
    fontWeight: "bold",
    textAlign: "center",
  },
  startAtText: {
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
    paddingHorizontal: 2,
    color: "#0068EF",
  },
  paymentSBImage: {
    width: "auto",
    maxWidth: 100,
    height: 40,
    alignSelf: "stretch",
  },
  paymentSBTitle: {
    paddingTop: 4,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default styles;
