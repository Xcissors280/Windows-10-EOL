// File: functions/_middleware.js
export async function onRequest(context) {
  // Get the original response from the static asset
  const response = await context.next();
  
  // Only process HTML content
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }
  
  // Get the HTML content
  const originalHtml = await response.text();
  
  // Calculate the exact countdown just like the website does
  // Target date (October 14, 2025 at 07:00:00 UTC)
  const targetDate = new Date('2025-10-14T07:00:00.000Z').getTime();
  
  // Current time
  const currentTime = Date.now();
  const difference = targetDate - currentTime;

  // Generate the countdown text in the exact same format as the website
  let countdownText;
  if (difference <= 0) {
    countdownText = "Windows 10 has reached end of life!";
  } else {
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    countdownText = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
  }
  
  // Replace the loading message with the pre-calculated countdown
  let modifiedHtml = originalHtml.replace(
    /<div class="countdown" id="countdown">Loading...<\/div>/,
    `<div class="countdown" id="countdown">${countdownText}</div>`
  );
  
  // Modify the sync functions to immediately display the countdown while still fetching accurate time
  modifiedHtml = modifiedHtml.replace(
    'function showConnectingMessage() {',
    `function showConnectingMessage() {
      // Don't show "Connecting To Time Server..." since we already have a pre-calculated countdown
      // countdownEl.innerText = "Connecting To Time Server...";
    }`
  );
  
  // Return the modified HTML with the same status and headers
  return new Response(modifiedHtml, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}
