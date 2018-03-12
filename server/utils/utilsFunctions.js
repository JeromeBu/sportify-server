const randomFromTable = array => array[Math.floor(Math.random() * array.length)]

function randomDate(start, end, startHour, endHour) {
  const date = new Date(+start + Math.random() * (end - start))
  if (startHour && endHour) {
    const hour = (startHour + Math.random() * (endHour - startHour)) | 0
    date.setHours(hour)
  }
  return date
}

function roundMinutes(date) {
  date.setHours(date.getHours() + Math.round(date.getMinutes() / 60))
  date.setMinutes(0)
  return date
}

module.exports = { randomFromTable, randomDate, roundMinutes }
