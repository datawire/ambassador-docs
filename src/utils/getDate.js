const month = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function (date) {
  const [yyyy, mm, dd] = date.split('-');
  if (yyyy && mm && dd) {
    return `${month[Number(mm - 1)]} ${dd}, ${yyyy}`;
  } else {
    return ''
  }
}
