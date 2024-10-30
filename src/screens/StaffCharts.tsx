import { LineChart, PieChart } from "react-native-gifted-charts";
import React, { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/core";
import { useData, useTheme, useTranslation } from "../hooks";
import { Block, Button, Image, Product, Text, Article, EventDetails } from "../components";
import { UserContext } from "../hooks/userContext";
import * as XLSX from "xlsx";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const renderDot = (color) => {
  return (
    <View
      style={{
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: color,
        marginRight: 10,
      }}
    />
  );
};

const StaffCharts = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { gradients, sizes } = useTheme();

  // Retrieve rentalId from route parameters
  const { eventId } = route.params;
  const { identity, retrieveIdentity } = useContext(UserContext);

  // Data for charts
  const [userCountThisMonth, setUserCountThisMonth] = useState<any[]>([]);
  const [userCountPerMonth, setUserCountPerMonth] = useState<any[]>([]);
  const [activityCountPerMonth, setActivityCountPerMonth] = useState<any[]>([]);
  const [averageDurationPerMonth, setAverageDurationPerMonth] = useState<any[]>([]);
  const [generatingSheet, setGeneratingSheets] = useState(false);

  // Constants
  const CARD_WIDTH = sizes.width - sizes.s;
  const hasSmallScreen = sizes.width < 414; // iPhone 11
  const SNAP_OFFSET = CARD_WIDTH - (hasSmallScreen ? 28 : 19) + sizes.s;

  /**
   * Fetches data and repopulate chart data with new data
   *
   * Stats derived:
   * - Number of clients / caregivers
   * - Activites in month
   * - Duration of activities
   * - Average attendence (hours) per month
   */
  const populateChartData = async () => {
    // userCountThisMonth Chart
    setUserCountThisMonth([
      { value: 40, name: "volunteer", color: "#A24CCC" },
      { value: 60, name: "client", color: "#EA1C93" },
    ]);

    // userCountPerMonth Chart
    const monthsArray = [
      { value: 0, label: "Jan" },
      { value: 20, label: "Feb" },
      { value: 18, label: "Mar" },
      { value: 40, label: "April" },
      { value: 36, label: "May" },
      { value: 60, label: "June" },
      { value: 54, label: "July" },
      { value: 54, label: "Aug" },
      { value: 54, label: "Sept" },
      { value: 23, label: "Oct" },
      { value: 67, label: "Nov" },
      { value: 85, label: "Dec" },
    ];
    setUserCountPerMonth([
      { value: 0, label: "Jan", dataPointText: "0" },
      { value: 20, label: "Feb" },
      { value: 18, label: "Mar" },
      { value: 40, label: "April" },
      { value: 36, label: "May" },
      { value: 60, label: "June" },
      { value: 54, label: "July" },
      { value: 54, label: "Aug" },
      { value: 54, label: "Sept" },
      { value: 23, label: "Oct" },
      { value: 67, label: "Nov" },
      { value: 85, label: "Dec", dataPointText: "85" },
    ]);

    // setActivityCountPerMonth Chart
    setActivityCountPerMonth([
      { value: 0, label: "Jan", dataPointText: "0" },
      { value: 20, label: "Feb" },
      { value: 18, label: "Mar" },
      { value: 40, label: "April" },
      { value: 36, label: "May" },
      { value: 60, label: "June" },
      { value: 54, label: "July" },
      { value: 54, label: "Aug" },
      { value: 54, label: "Sept" },
      { value: 23, label: "Oct" },
      { value: 67, label: "Nov" },
      { value: 85, label: "Dec", dataPointText: "85" },
    ]);

    // setAverageDurationPerMonth Chart
    setAverageDurationPerMonth([
      { value: 0, label: "Jan", dataPointText: "0" },
      { value: 20, label: "Feb" },
      { value: 18, label: "Mar" },
      { value: 40, label: "April" },
      { value: 36, label: "May" },
      { value: 60, label: "June" },
      { value: 54, label: "July" },
      { value: 54, label: "Aug" },
      { value: 54, label: "Sept" },
      { value: 23, label: "Oct" },
      { value: 67, label: "Nov" },
      { value: 85, label: "Dec", dataPointText: "85" },
    ]);
  };

  /**
   * Generates an Excel file from the stats and shares it.
   */
  const generateExcel = () => {
    setGeneratingSheets(true);
    let wb = XLSX.utils.book_new();

    // Extracting labels and values
    const userCountThisMonthLabels = userCountThisMonth.map((item) => item.label);
    const userCountThisMonthValues = userCountThisMonth.map((item) => item.value);

    const userCountPerMonthLabels = userCountPerMonth.map((item) => item.label);
    const userCountPerMonthValues = userCountPerMonth.map((item) => item.value);

    const activityCountPerMonthLabels = activityCountPerMonth.map((item) => item.label);
    const activityCountPerMonthValues = activityCountPerMonth.map((item) => item.value);

    const averageDurationPerMonthLabels = averageDurationPerMonth.map((item) => item.label);
    const averageDurationPerMonthValues = averageDurationPerMonth.map((item) => item.value);

    try {
      let ws = XLSX.utils.aoa_to_sheet([
        ["userCountThisMonth"],
        [...userCountThisMonthLabels],
        [...userCountThisMonthValues],

        ["userCountPerMonth"],
        [...userCountPerMonthLabels],
        [...userCountPerMonthValues],

        ["activityCountPerMonth"],
        [...activityCountPerMonthLabels],
        [...activityCountPerMonthValues],

        ["averageDurationPerMonth"],
        [...averageDurationPerMonthLabels],
        [...averageDurationPerMonthValues],
        // [5, 6, { t: 'n', v: 10, f: 'A4+B4'}]
      ]);
      XLSX.utils.book_append_sheet(wb, ws, "Results", true);

      const base64 = XLSX.write(wb, { type: "base64" });
      const filename = FileSystem.documentDirectory + "MindCompanionCharts.xlsx";
      FileSystem.writeAsStringAsync(filename, base64, {
        encoding: FileSystem.EncodingType.Base64,
      }).then(() => {
        Sharing.shareAsync(filename);
      });
    } catch (error) {
      console.error(error);
    }

    setGeneratingSheets(false);
  };

  /**
   * Helper function to render a line chart consistently
   * @param data Data to render in the line chart
   * @returns Component
   */
  const renderLineChart = (data) => {
    return (
      <LineChart
        data={data}
        // initialSpacing={0}
        // spacing={20}
        textColor1="#EA1C93"
        textShiftY={-8}
        textShiftX={-10}
        textFontSize={13}
        thickness={5}
        color="black"
        dataPointsColor={"#EA1C93"}
        // hideRules
        // hideYAxisText
        // yAxisColor="#0BA5A4"
        xAxisColor="#a80062"
        // isAnimated
        // animateOnDataChange
        // animationDuration={1000}
        // onDataChangeAnimationDuration={300}
        width={300}
        // adjustToWidth
      />
    );
  };

  useEffect(() => {
    // console.log("eventId", eventId);

    populateChartData();
  }, []);

  return (
    <Block
      scroll
      nestedScrollEnabled
      paddingVertical={sizes.padding}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: sizes.padding * 1.5 }}
      marginBottom={sizes.l}
      marginHorizontal={sizes.s}
    >
      <Block justify="center" align="center">
        <Text h5>{t("charts.staff.numberofclientsthismonth")}</Text>
        <PieChart data={userCountThisMonth} showText textColor="black" showValuesAsLabels textSize={20} isAnimated />
        {/* Legend */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 10,
          }}
        >
          <View>
            {userCountThisMonth.map((item, i) => {
              return (
                <View key={item["name"]} style={{ flexDirection: "row", alignItems: "center", width: 120 }}>
                  {renderDot(item["color"])}

                  <Text style={{ color: "white" }}>
                    {/* {item["name"]}: {item["value"]} */}
                    {item["name"]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </Block>

      <Block marginTop={sizes.md} justify="center" align="center">
        <Text h5>{t("charts.staff.numberofclientspermonth")}</Text>
        {renderLineChart(userCountPerMonth)}
      </Block>

      <Block marginTop={sizes.md} justify="center" align="center">
        <Text h5>{t("charts.staff.activitiesperMonth")}</Text>
        {renderLineChart(activityCountPerMonth)}
      </Block>

      <Block marginTop={sizes.md} center justify="center" align="center">
        <Text style={{ textAlign: "center" }} h5>
          {t("charts.staff.averagedurationpermonth")}
        </Text>
        {renderLineChart(averageDurationPerMonth)}
      </Block>

      <Block marginTop={sizes.md}>
        <Button onPress={generateExcel} gradient={gradients.primary} primary rounded disabled={generatingSheet}>
          <Text bold white>
            {generatingSheet ? t("charts.staff.generating") : t("charts.staff.generatesheets")}
          </Text>
        </Button>
      </Block>
    </Block>
  );
};

export default StaffCharts;
