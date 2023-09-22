import { Dimensions, Platform, StyleSheet } from "react-native";

const IOS = Platform.OS === "ios";
const deviceHeight = Dimensions.get("screen").height;

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#0000",
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
    flexDirection: "row",
    height: 70,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: "hidden",
    paddingHorizontal: 20,
  },
  centerTitle: {
    flex: 1,
    justifyContent: "center",
  },
  centerTitleText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  moneyText: {
    fontSize: 18,
    marginTop: 4,
  },
  actionBtn: {
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    backgroundColor: "#0068EF",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
    height: 40,
    width: "100%",
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
