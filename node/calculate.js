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

  return {
    unitSize:
      ((bookieOdds - 1) * totalOverP - (1 - totalOverP)) / (bookieOdds - 1)
  };
}
