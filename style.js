import { Dimensions, Platform, StyleSheet } from "react-native";

const IOS = Platform.OS === "ios";
const deviceHeight = Dimensions.get("screen").height;

const styles = StyleSheet.create({
  root: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#00000020",
    height: deviceHeight * 0.8 + 45,
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
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  centerTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  centerTitleText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  moneyText: {
    fontSize: 18,
    color: "#1D1D1D",
    opacity: 0.5,
  },
  actionBtn: {
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    backgroundColor: "#0068EF",
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    margin: 5,
    height: 40,
    width: Dimensions.get("screen").width / 2.5,
    borderRadius: 3,
  },
  buttonTextContainer: {
    textAlign: "center",
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  modalCloseButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  contentDesign: {
    backgroundColor: "#FAFAFA",
    borderRadius: 6,
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: IOS ? 3 : 4,
    },
    shadowOpacity: IOS ? 0.2 : 0.3,
    shadowRadius: IOS ? 6 : 4.65,
    elevation: IOS ? 20 : 8,
  },
});

export default styles;
