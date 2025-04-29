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
  
  // Get current server timestamp
  const serverTime = Date.now();
  
  // Calculate countdown for metadata using the corrected timestamp
  const targetDate = 1760511599999; // October 14, 2025, 23:59:59.999 UTC (last millisecond of the day)
  const difference = targetDate - serverTime;
  
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
  
  // Create metadata for embeds
  const pageDescription = `Windows 10 support ends on October 14, 2025. Time remaining: ${countdownText}`;
  
  // Inject the server timestamp into the HTML
  let modifiedHtml = originalHtml.replace(
    'SERVER_TIMESTAMP_PLACEHOLDER',
    serverTime.toString()
  );
  
  // Update the targetDate in the JavaScript to use the correct timestamp
  modifiedHtml = modifiedHtml.replace(
    /const targetDate = \d+;/,
    `const targetDate = 1760511599999; // October 14, 2025, 23:59:59.999 UTC`
  );
  
  // Keep the original title
  // Add meta tags for embeds with dynamically updated countdown
  modifiedHtml = modifiedHtml.replace(
    '</head>',
    `  <!-- Meta tags for social media embeds -->
    <meta name="description" content="${pageDescription}" />
    <meta property="og:title" content="RIP Windows 10 | Countdown to Windows 10's End of Life" />
    <meta property="og:description" content="${pageDescription}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="RIP Windows 10 | Countdown to Windows 10's End of Life" />
    <meta name="twitter:description" content="${pageDescription}" />
</head>`
  );
  
  // Return the modified HTML
  return new Response(modifiedHtml, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}
