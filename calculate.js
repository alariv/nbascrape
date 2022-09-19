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
      parseFloat(
        (
          ((parseFloat(bookieOdds.under) - 1) *
            (parseFloat(totalUnderP) / 100) -
            (1 - parseFloat(totalUnderP) / 100)) /
          (parseFloat(bookieOdds.under) - 1)
        ).toString()
      ) * 10
    ).toFixed(4),
    unitSizeOver: parseFloat(
      parseFloat(
        (
          ((parseFloat(bookieOdds.over) - 1) * (parseFloat(totalOverP) / 100) -
            (1 - parseFloat(totalOverP) / 100)) /
          (parseFloat(bookieOdds.over) - 1)
        ).toString()
      ) * 10
    ).toFixed(4),
  };
  console.log("calculateUnitSize response", JSON.stringify(response));

  return response;
}
