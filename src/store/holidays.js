const HOLIDAYS_FULL = [
  // Format M/DD/YYYY
  '2019-11-28T00:00:00', // Thanksgiving Day
  '2019-12-25T00:00:00', // Christmas Day

  '2020-01-01T00:00:00', // New Year’s Day
  '2020-01-20T00:00:00', // Martin Luther King, Jr. Day
  '2020-02-17T00:00:00', // Washington’s Birthday
  '2020-04-10T00:00:00', // Good Friday
  '2020-05-25T00:00:00', // Memorial Day
  '2020-07-03T00:00:00', // Independence Day
  '2020-09-07T00:00:00', // Labor Day
  '2020-11-26T00:00:00', // Thanksgiving Day
  '2020-12-25T00:00:00', // Christmas Day

  '2021-01-01T00:00:00', // New Year’s Day
  '2021-01-18T00:00:00', // Martin Luther King, Jr. Day
  '2021-02-15T00:00:00', // Washington’s Birthday
  '2021-04-02T00:00:00', // Good Friday
  '2021-05-31T00:00:00', // Memorial Day
  '2021-07-05T00:00:00', // Independence Day
  '2021-09-06T00:00:00', // Labor Day
  '2021-11-25T00:00:00', // Thanksgiving Day
  '2021-12-25T00:00:00', // Christmas Day

  '2022-01-01T00:00:00', // New Year’s Day
  '2022-01-17T00:00:00', // Martin Luther King, Jr. Day
  '2022-02-21T00:00:00', // Washington’s Birthday
  '2022-04-15T00:00:00', // Good Friday
  '2022-05-30T00:00:00', // Memorial Day
  '2022-07-04T00:00:00', // Independence Day
  '2022-09-05T00:00:00', // Labor Day
  '2022-11-24T00:00:00', // Thanksgiving Day
  '2022-12-25T00:00:00', // Christmas Day

  '2023-01-02T00:00:00', // New Year’s Day
  '2023-01-16T00:00:00', // Martin Luther King, Jr. Day
  '2023-02-20T00:00:00', // Washington’s Birthday
  '2023-04-07T00:00:00', // Good Friday
  '2023-05-29T00:00:00', // Memorial Day
  '2023-07-04T00:00:00', // Independence Day
  '023-09-04T00:00:00', // Labor Day
  '2023-11-23T00:00:00', // Thanksgiving Day
  '2023-11-25T00:00:00', // Christmas Day
];

const HOLIDAYS_PARTIAL = [
  // Market opens at 9:30
  // Early Close 13:00
  '2019-11-29T00:00:00', // The Day Following Thanksgiving
  '2019-11-24T00:00:00', // Christmas Eve

  '2020-11-27T00:00:00', // The Day Following Thanksgiving
  '2020-12-24T00:00:00', // Christmas Eve

  '2021-11-26T00:00:00', // The Day Following Thanksgiving

  '2022-11-25T00:00:00', // The Day Following Thanksgiving

  '2023-07-03T00:00:00', //Day before Independence Day
  '2023-11-24T00:00:00', // The Day Following Thanksgiving
];

export default {
  HOLIDAYS_FULL,
  HOLIDAYS_PARTIAL,
}
