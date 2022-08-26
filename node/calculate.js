export function calculateUnitSize(
  market,
  season,
  extraMarket,
  line,
  predMinutes,
  selectedWplayer,
  totalGames,
  totalUnder,
  totalOverP,
  totalUnderP,
  bookieOdds,
  player
) {
  // return{
  //   unitSize:
  //     ((bookieOdds - 1) * totalOverP - (1 - totalOverP)) / (bookieOdds - 1)
  // };

  const response = {
    unitSizeUnder: parseFloat(
      (
        ((parseInt(bookieOdds.under) - 1) * (parseInt(totalUnderP) / 100) -
          (1 - parseInt(totalUnderP) / 100) /
            (parseInt(bookieOdds.under) - 1)) /
        10
      ).toString()
    ).toFixed(4),
    unitSizeOver: parseFloat(
      (
        ((parseInt(bookieOdds.over) - 1) * (parseInt(totalOverP) / 100) -
          (1 - parseInt(totalOverP) / 100) / (parseInt(bookieOdds.over) - 1)) /
        10
      ).toString()
    ).toFixed(4),
  };
  console.log("calculateUnitSize response", JSON.stringify(response));

  return response;
}
