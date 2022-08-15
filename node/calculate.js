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
    unitSizeUnder:
      ((parseInt(bookieOdds.under) - 1) * (parseInt(totalUnderP) / 100) -
        (1 - parseInt(totalUnderP) / 100) / (parseInt(bookieOdds.under) - 1)) /
      10,
    unitSizeOver:
      ((parseInt(bookieOdds.over) - 1) * (parseInt(totalOverP) / 100) -
        (1 - parseInt(totalOverP) / 100) / (parseInt(bookieOdds.over) - 1)) /
      10

    //totalOverP on vaja toggleda kas over või under järgi. Ilmselt lisalipuksest vaja UIst
    //unit size: (((C27-1)*D27) - (1 - D27)) /( C27 -1
  };
}
