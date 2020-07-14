/**
 * Format a timestamp (in milliseconds) into a pretty string with just the time.
 *
 * @param {int} msTimestamp 
 * @param {string} timezone 
 * @returns {string} Time formatted into a string like '10:19 AM'.
 */
export function timestampToTimeFormatted(msTimestamp, timezone = 'America/New_York') {
  const date = new Date(msTimestamp);
  const formatOptions = { 
    hour: 'numeric', 
    minute: '2-digit', 
    timeZone: timezone
  };
  const formatted = date.toLocaleTimeString('en-US', formatOptions);
  return formatted;
}

/**
 * Format a timestamp (in milliseconds) into a pretty string with just the date.
 *
 * @param {int} msTimestamp 
 * @param {string} timezone 
 * @returns {string} Time formatted into a string like 'Monday, January 19, 1970'.
 */
export function timestampToDateFormatted(msTimestamp, timezone='America/New_York') {
  const date = new Date(msTimestamp);
  const formatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',  
    timeZone: timezone
  };
  const formatted = date.toLocaleDateString('en-US', formatOptions);
  return formatted;
}

/** 
 * Format a timestamp (in milliseconds) into a pretty string.
 * 
 * @param {int} msTimestamp 
 * @param {string} timezone 
 * @returns {string} Time formatted into a string like 
 * "Monday, January 19, 1970, 02:48 AM"
 */
export function timestampToFormatted(msTimestamp, timezone = "America/New_York") {
  let date = new Date(msTimestamp);
  let formatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',  
    hour: 'numeric', 
    minute: '2-digit', 
    timeZone: timezone
  };
  let formatted = date.toLocaleString('en-US', formatOptions);
  return formatted;
}