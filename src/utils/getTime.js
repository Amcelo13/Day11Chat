export const getTime = (times) => {
  let curr = new Date();
  let hours = curr.getHours() % 12 || 12;
  let ampm = curr.getHours() >= 12 ? 'pm' : 'am';
  let minutes = curr.getMinutes();

  let timeString = hours + ":" + (minutes < 10 ? "0" : "") + minutes + " " + ampm;

  return timeString;
};
