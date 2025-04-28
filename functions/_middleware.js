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
  
  // The target date in UTC (October 14, 2025 at 07:00:00 UTC)
  const targetDate = new Date('2025-10-14T07:00:00.000Z').getTime();
  
  // Current server time in UTC
  const serverTime = Date.now();
  
  // Calculate the time difference
  const difference = targetDate - serverTime;
  
  // Format the countdown for initial display
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
  
  // Prepare meta tags
  const pageTitle = `Windows 10 End of Life Countdown`;
  const pageDescription = `Windows 10 reaches end of life on October 14, 2025`;
  
  // Modify HTML content
  let modifiedHtml = originalHtml;
  
  // Replace title
  modifiedHtml = modifiedHtml.replace(/<title>.*?<\/title>/i, `<title>${pageTitle}</title>`);
  
  // Add meta tags before closing head tag
  modifiedHtml = modifiedHtml.replace('</head>', `
    <!-- SEO meta tags with accurate date information -->
    <meta name="description" content="${pageDescription}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${pageTitle}" />
    <meta name="twitter:description" content="${pageDescription}" />
    <meta property="og:title" content="${pageTitle}" />
    <meta property="og:description" content="${pageDescription}" />
    <meta property="og:type" content="website" />
    </head>`);
  
  // Set the initial countdown value with server-rendered time
  modifiedHtml = modifiedHtml.replace(
    /<div class="countdown" id="countdown">.*?<\/div>/i,
    `<div class="countdown" id="countdown">${countdownText}</div>`
  );
  
  // Inject a server timestamp into the page that the client JavaScript can use
  // This helps ensure time sync without modifying the original script logic
  modifiedHtml = modifiedHtml.replace(
    '// You can also use the Unix timestamp: 1760425200000',
    `// You can also use the Unix timestamp: 1760425200000
    // Server time injected by middleware
    const serverRenderedTime = ${serverTime}; // UTC timestamp from server at page render time`
  );
  
  // Modify the syncTime function to use the server-provided time as a fallback
  modifiedHtml = modifiedHtml.replace(
    '// If both servers fail, retry after 12 seconds',
    `// Use server-rendered time as a fallback if both time servers fail
      if (!primarySuccess && !backupSuccess) {
        console.log('Using server-rendered time as fallback');
        // Use the time that was injected by the server when the page was rendered
        // Calculate offset between current local time and server-rendered time
        const localTime = Date.now();
        const serverTimeAtRender = serverRenderedTime;
        const timeSinceRender = localTime - performance.timing.navigationStart;
        const estimatedCurrentServerTime = serverTimeAtRender + timeSinceRender;
        serverTimeOffset = estimatedCurrentServerTime - localTime;
        
        console.log('Time synchronized with server-rendered time. Offset:', serverTimeOffset, 'ms');
        clearTimeout(connectingMessageTimeout);
        updateCountdown();
        startCountdown();
        return true;
      }
      
      // If all fallbacks fail, retry after 12 seconds`
  );
  
  // Return the modified HTML with the same status and headers
  return new Response(modifiedHtml, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}
