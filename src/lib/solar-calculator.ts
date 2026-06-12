export interface SolarTimes {
  sunrise: string
  sunset: string
  goldenHourMorning: string
  goldenHourEvening: string
}

/**
 * Calculates high-precision Sunrise, Sunset, and photography Golden Hours
 * based on geographical coordinates and calendar date.
 * Optimized for local time in Vietnam (UTC+7).
 */
export function calculateSolarTimes(
  latitude: number,
  longitude: number,
  date: Date = new Date()
): SolarTimes {
  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()

  // Calculate day of the year (N)
  const now = new Date(year, month, day)
  const start = new Date(year, 0, 0)
  const diff = now.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  const dayOfYear = Math.floor(diff / oneDay)

  // Convert latitude to radians
  const latRad = (latitude * Math.PI) / 180

  // 1. Solar Declination (in radians)
  // Declination = 23.45 * sin(360/365 * (284 + N))
  const decRad = 23.45 * (Math.PI / 180) * Math.sin(2 * Math.PI * (284 + dayOfYear) / 365)

  // 2. Hour Angle (omega) at Sunrise/Sunset
  // Standard sun altitude for sunrise/sunset is -0.83 degrees
  const sunAltRad = (-0.83 * Math.PI) / 180

  // cos(omega) = (sin(-0.83) - sin(lat)*sin(dec)) / (cos(lat)*cos(dec))
  const cosOmega = (Math.sin(sunAltRad) - Math.sin(latRad) * Math.sin(decRad)) / (Math.cos(latRad) * Math.cos(decRad))

  let sunriseHour = 6.0 // Default fallbacks
  let sunsetHour = 18.0

  if (cosOmega <= 1 && cosOmega >= -1) {
    const omega = Math.acos(cosOmega)
    const omegaDeg = (omega * 180) / Math.PI
    const hourAngle = omegaDeg / 15.0 // Convert to decimal hours

    // 3. Local Standard Time Meridian for Vietnam (UTC+7) is 105 degrees East
    const standardMeridian = 105.0

    // 4. Equation of Time (EoT) approximation in hours
    const b = (360 / 365) * (dayOfYear - 81) * Math.PI / 180
    const eot = (9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b)) / 60.0

    // 5. Calculate Solar Noon
    const solarNoon = 12.0 - (longitude - standardMeridian) / 15.0 - eot

    // 6. Calculate Sunrise/Sunset in Local Time (UTC+7)
    sunriseHour = solarNoon - hourAngle
    sunsetHour = solarNoon + hourAngle
  }

  // Format decimal hours to HH:MM format
  const formatTime = (decimalHours: number): string => {
    let hours = Math.floor(decimalHours)
    let minutes = Math.round((decimalHours - hours) * 60)
    if (minutes === 60) {
      hours += 1
      minutes = 0
    }
    hours = (hours + 24) % 24
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
  }

  const sunrise = formatTime(sunriseHour)
  const sunset = formatTime(sunsetHour)

  // Golden hours are typically 1 hour after sunrise, and 1 hour before sunset
  const goldenHourMorning = `${formatTime(sunriseHour)} - ${formatTime(sunriseHour + 1.0)}`
  const goldenHourEvening = `${formatTime(sunsetHour - 1.0)} - ${formatTime(sunsetHour)}`

  return {
    sunrise,
    sunset,
    goldenHourMorning,
    goldenHourEvening,
  }
}
