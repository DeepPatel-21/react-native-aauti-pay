import { Platform, StyleSheet } from "react-native";

const IOS = Platform.OS === "ios";
const tabWidth = 40;
export const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "center",
    position: "relative",
    borderColor: "#00000020",
    paddingBottom: 6,
  },
  slider: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    color: "#0068EF",
    alignItems: "center",
    height: 68,
  },
  tab: {
    width: tabWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 12,
    textAlign: "center",
  },
  container: {
    marginTop: 10,
  },
  shadow: {
    width: 10, // Adjust as needed
    backgroundColor: "rgba(0, 0, 0, 0.2)", // Shadow color
    shadowColor: "#000",
    shadowOffset: { width: 10, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  scrollView: {
    flex: 1,
    zIndex: 1, // Ensure the ScrollView is on top of the shadows
    // Other styles for the ScrollView
  },
});
