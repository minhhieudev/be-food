import KeywordStatistic from "../models/keyword-statistic.model.js";
import Keyword from "../models/keyword.model.js";
import CollectedKeyword from "../models/collected-keyword.model.js";
import KeywordTopic from "../models/keyword-topic.model.js";
import moment from "moment";

class KeywordStatisticService {
  // Collect data and save to DB
  async collectAndSaveData() {
    try {
      const updateData = [];
      const keywordStatistic = new KeywordStatisticService();

      // Set hour
      const yesterdayStart = moment()
        .utcOffset(420)
        .subtract(1, "day")
        .startOf("day")
        .toString();
      const yesterdayEnd = moment()
        .utcOffset(420)
        .subtract(1, "day")
        .endOf("day")
        .toString();

      // Get entity by date
      const collectedKeywords = await CollectedKeyword.find({
        date: {
          $gte: yesterdayStart,
          $lte: yesterdayEnd,
        },
      }).lean();

      // Create or update keyword-statistic
      const updateOneCollectedKeyword = async (collectedKeyword) => {
        let entityID = collectedKeyword.entity;
        let entityType = collectedKeyword.entityType;
        const dateCollected = collectedKeyword.date;
        const date = dateCollected.getDate();
        const month = dateCollected.getMonth();
        const year = dateCollected.getFullYear();
        const mediaList = {
          youtube: [],
          tiktok: [],
          dailymotion: [],
        };

        // Get name keyword or topic
        let name = entityType === "keyword" ? "keyword" : "topicName";
        let entitySnapshotPromise = Keyword.findById(entityID)
          .select(`${name}`)
          .lean();

        if (entityType === "topic") {
          entitySnapshotPromise = KeywordTopic.findById(entityID)
            .select(`${name}`)
            .lean();
        }

        let [statisticData, entitySnapshot] = await Promise.all([
          KeywordStatistic.findOne({
            entityID,
            entityType,
          }).lean(),
          entitySnapshotPromise,
        ]);

        entitySnapshot = entitySnapshot[`${name}`];

        // Filter media list by platform
        collectedKeyword.mediaList.map((media) => {
          mediaList[media.platform].push(media);
        });

        // Create platform details data
        const { volumePointTotal, newPlatformDetails } =
          await keywordStatistic.createPlatformDetailData(
            collectedKeyword,
            statisticData,
            mediaList,
            date,
            month,
            year
          );

        // create or update keyword statistic
        const updateOperation = {
          updateOne: {
            filter: { entityID, entityType },
            update: {
              entityID,
              entityType,
              entitySnapshot,
              volumePoint: volumePointTotal,
              platformDetails: newPlatformDetails,
              isEnabled: true,
            },
            upsert: true,
          },
        };
        updateData.push(updateOperation);
      };

      await Promise.all(
        collectedKeywords.map((collectedKeyword) =>
          updateOneCollectedKeyword(collectedKeyword)
        )
      );

      if (updateData.length > 0) await KeywordStatistic.bulkWrite(updateData);

      console.log("Thống kê keyword thành công, date: ", moment());
    } catch (error) {
      console.log(
        "error while keyword-tools/keywordStatistic/collectAndSaveData: ",
        error
      );
    }
  }

  async createPlatformDetailData(
    collectedKeyword,
    statisticData,
    mediaList,
    date,
    month,
    year
  ) {
    const keywordStatistic = new KeywordStatisticService();
    let volumePointTotal = 0;
    const isStartDayOfMonth =
      moment().utcOffset(420).date() === 1 ? true : false;
    const isMonday = moment().utcOffset(420).day() === 1 ? true : false;

    const calculateAndGetOnePlatform = async (interaction) => {
      const totalViews = interaction.totalViews;
      const totalLikes = interaction.totalLikes;
      const totalComments = interaction.totalComments;
      const totalVideos = interaction.totalVideos;
      let volumeLogStatistic = 0;
      const volumeLog = totalViews + totalLikes * 1.5 + totalComments * 2;
      const dailyStatisticsLog = {
        date,
        month,
        year,
        volumeLog,
        totalViews,
        totalLikes,
        totalComments,
        totalVideos,
      };

      const preStatisticPlatformData = statisticData?.platformDetails.find(
        (item) => item.platform === interaction.platform
      );

      // get media data
      const newMedias = mediaList[interaction?.platform] || [];
      const oldMedias = preStatisticPlatformData?.mediaList || [];
      const allMedias = [...newMedias, ...oldMedias];

      // Get daily, weekly, monthly data
      const oldDaily = preStatisticPlatformData?.dailyStatisticsLogs || [];
      let dailyStatisticsLogs = [...oldDaily, dailyStatisticsLog];
      let weeklyStatisticsLogs =
        preStatisticPlatformData?.weeklyStatisticsLogs || [];

      let monthlyStatisticsLogs =
        preStatisticPlatformData?.monthlyStatisticsLogs || [];

      const likeGrowthRate = {
        yesterday: 0,
        lastWeek: 0,
        lastMonth: 0,
      };

      const viewGrowthRate = {
        yesterday: 0,
        lastWeek: 0,
        lastMonth: 0,
      };

      const commentGrowthRate = {
        yesterday: 0,
        lastWeek: 0,
        lastMonth: 0,
      };

      const lastMonth = moment()
        .utcOffset(420)
        .subtract(1, "month")
        .startOf("month");

      const beforeLastMonth = moment()
        .utcOffset(420)
        .subtract(2, "months")
        .startOf("month");

      // Lấy ngày, tháng và năm của ngày hôm qua
      const dailyLength = dailyStatisticsLogs.length;
      const beforeYesterdayDate = moment().utcOffset(420).subtract(2, "days");
      const dateDBYesterday = dailyStatisticsLogs[dailyLength - 1];
      const dateDBBeforeYesterday = dailyStatisticsLogs[dailyLength - 2];
      const twoMonthAgoDays =
        lastMonth.daysInMonth() + beforeLastMonth.daysInMonth();
      const beforeLastMonthIndex =
        monthlyStatisticsLogs.length - twoMonthAgoDays;

      // Calculate lastweek, add weekly logs, update daily logs
      if (isMonday) {
        // update weekly logs
        if (dailyLength >= 7) {
          weeklyStatisticsLogs.push(
            ...dailyStatisticsLogs.slice(dailyStatisticsLogs.length > 7 ? 1 : 0)
          );
        } else weeklyStatisticsLogs = [];

        const startOfBeforeLastWeekData =
          weeklyStatisticsLogs[weeklyStatisticsLogs.length - 14];

        const isBeforeLastWeekData = this.isBeforeLastWeek(
          startOfBeforeLastWeekData
        );

        // Calculate 2 week ago
        if (isBeforeLastWeekData) {
          // Get data two Week ago
          const twoWeekAgoData = weeklyStatisticsLogs.slice(
            weeklyStatisticsLogs.length - 14
          );

          // Compare and calculate lastWeek
          const rates = await keywordStatistic.calculateRate(twoWeekAgoData, 7);
          likeGrowthRate.lastWeek = rates.likeGrowthRate;
          commentGrowthRate.lastWeek = rates.commentGrowthRate;
          viewGrowthRate.lastWeek = rates.viewGrowthRate;
          volumeLogStatistic = rates.volumeLogStatistic;
        }

        // Update daily
        dailyStatisticsLogs = [dailyStatisticsLog];
      } else {
        likeGrowthRate.lastWeek =
          preStatisticPlatformData?.likeGrowthRate?.lastWeek || 0;
        commentGrowthRate.lastWeek =
          preStatisticPlatformData?.commentGrowthRate?.lastWeek || 0;
        viewGrowthRate.lastWeek =
          preStatisticPlatformData?.viewGrowthRate?.lastWeek || 0;
      }

      // Calculate lastmonth and update weekly, add monthly
      if (isStartDayOfMonth) {
        // Update monthly statistic logs
        if (weeklyStatisticsLogs.length >= lastMonth.daysInMonth()) {
          monthlyStatisticsLogs.push(
            ...weeklyStatisticsLogs.slice(-lastMonth.daysInMonth())
          );
        }

        const isBeforeLastMonthData = this.isBeforeLastMonth(
          monthlyStatisticsLogs[beforeLastMonthIndex]
        );

        // Calculate lastmonth
        if (isBeforeLastMonthData) {
          const rates = await keywordStatistic.calculateRate(
            monthlyStatisticsLogs,
            lastMonth.daysInMonth()
          );
          likeGrowthRate.lastMonth = rates?.likeGrowthRate || 0;
          viewGrowthRate.lastMonth = rates?.viewGrowthRate || 0;
          commentGrowthRate.lastMonth = rates?.commentGrowthRate || 0;
          volumeLogStatistic = rates?.volumeLogStatistic || 0;
        }

        // Update weekly, get 7 days rencently
        if (weeklyStatisticsLogs.length >= 7) {
          weeklyStatisticsLogs = weeklyStatisticsLogs.slice(-7);
        }
      } else {
        likeGrowthRate.lastMonth =
          preStatisticPlatformData?.likeGrowthRate?.lastMonth || 0;
        commentGrowthRate.lastMonth =
          preStatisticPlatformData?.commentGrowthRate?.lastMonth || 0;
        viewGrowthRate.lastMonth =
          preStatisticPlatformData?.viewGrowthRate?.lastMonth || 0;
      }

      // Calculate 2 days ago
      if (
        dateDBBeforeYesterday?.date === beforeYesterdayDate.date() &&
        dateDBBeforeYesterday?.month === beforeYesterdayDate.month() &&
        dateDBBeforeYesterday?.year === beforeYesterdayDate.year() &&
        dailyLength >= 2
      ) {
        const twoDayAgoData = [dateDBBeforeYesterday, dateDBYesterday];
        const rates = await keywordStatistic.calculateRate(twoDayAgoData, 1);
        likeGrowthRate.yesterday = rates.likeGrowthRate;
        viewGrowthRate.yesterday = rates.viewGrowthRate;
        commentGrowthRate.yesterday = rates.commentGrowthRate;
        if (!volumeLogStatistic) volumeLogStatistic = rates.volumeLogStatistic;
      }

      volumePointTotal += volumeLogStatistic;

      const platform = {
        platform: interaction.platform,
        viewGrowthRate,
        likeGrowthRate,
        commentGrowthRate,
        volumePoint: volumeLogStatistic,
        suggestedKeywords: interaction.suggestedKeywords,
        mediaList: allMedias,
        dailyStatisticsLogs,
        weeklyStatisticsLogs,
        monthlyStatisticsLogs,
      };
      return platform;
    };

    const newPlatformDetails = await Promise.all(
      collectedKeyword.interactions.map((interaction) =>
        calculateAndGetOnePlatform(interaction)
      )
    );

    return { newPlatformDetails, volumePointTotal };
  }

  async isBeforeLastWeek(startOfBeforeLastWeekData) {
    const startOfBeforeLastWeek = moment()
      .utcOffset(420)
      .subtract(2, "week")
      .startOf("isoWeek");

    if (
      startOfBeforeLastWeek.date() === startOfBeforeLastWeekData?.date &&
      startOfBeforeLastWeek.month() === startOfBeforeLastWeekData?.month &&
      startOfBeforeLastWeek.year() === startOfBeforeLastWeekData?.year
    ) {
      return true;
    }
    return false;
  }

  async isBeforeLastMonth(startOfBeforeLastMonthData) {
    const startOfBeforeLastMonth = moment()
      .subtract(2, "month")
      .startOf("isoMonth");

    if (
      startOfBeforeLastMonth.date() === startOfBeforeLastMonthData?.date &&
      startOfBeforeLastMonth.month() === startOfBeforeLastMonthData?.month &&
      startOfBeforeLastMonth.year() === startOfBeforeLastMonthData?.year
    ) {
      return true;
    }
    return false;
  }

  async calculateRate(statisticDB, between) {
    let lastViews = 0,
      lastComments = 0,
      lastLikes = 0;
    let beforeLastViews = 0,
      beforeLastComments = 0,
      beforeLastLikes = 0;
    let lastVolumneLogTotal = 0;
    let beforeLastVolumneLogTotal = 0;
    statisticDB.reverse().map((item, index) => {
      index++;
      if (index <= between) {
        lastLikes += item.totalLikes;
        lastComments += item.totalComments;
        lastViews += item.totalViews;
        lastVolumneLogTotal += item.volumeLog;
      } else {
        beforeLastLikes += item.totalLikes;
        beforeLastViews += item.totalViews;
        beforeLastComments += item.totalComments;
        beforeLastVolumneLogTotal += item?.volumeLog;
      }
    });

    const likeGrowthRate =
      beforeLastLikes === 0
        ? 0
        : Math.round(((lastLikes - beforeLastLikes) / beforeLastLikes) * 100);

    const commentGrowthRate =
      beforeLastComments == 0
        ? 0
        : Math.round(
            ((lastComments - beforeLastComments) / beforeLastComments) * 100
          );

    const viewGrowthRate =
      beforeLastViews === 0
        ? 0
        : Math.round(((lastViews - beforeLastViews) / beforeLastViews) * 100);

    const volumeLogStatistic =
      beforeLastVolumneLogTotal === 0
        ? 0
        : Math.round(
            ((lastVolumneLogTotal - beforeLastVolumneLogTotal) /
              beforeLastVolumneLogTotal) *
              100
          );

    return {
      likeGrowthRate,
      commentGrowthRate,
      viewGrowthRate,
      volumeLogStatistic,
    };
  }

  async getAll(req, res) {
    try {
      const keywordStatistic = await KeywordStatistic.find({})
        .sort({ createdAt: -1 })
        .lean();
      res.status(200).json({ data: keywordStatistic });
    } catch (error) {
      res.status(200).json({ message: "That bai" });
    }
  }
}

export default KeywordStatisticService;
