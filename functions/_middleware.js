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
  
  // Calculate countdown to Windows 10 End of Life (October 14, 2025)
  const now = new Date();
  const eolDate = new Date('2025-10-14T23:59:59Z');
  const difference = eolDate - now;
  
  // Format the countdown
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
  
  // Format current date for meta tags
  const formattedDate = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
  
  // Prepare SEO and social media tags
  const pageTitle = `Windows 10 End of Life Countdown: ${countdownText}`;
  const pageDescription = `Windows 10 reaches end of life in ${countdownText} (as of ${formattedDate})`;
  
  // Modify HTML content
  let modifiedHtml = originalHtml;
  
  // Replace title
  modifiedHtml = modifiedHtml.replace(/<title>.*?<\/title>/i, `<title>${pageTitle}</title>`);
  
  // Add meta tags before closing head tag
  modifiedHtml = modifiedHtml.replace('</head>', `
    <!-- SEO and social media meta tags -->
    <meta name="description" content="${pageDescription}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${pageTitle}" />
    <meta name="twitter:description" content="${pageDescription}" />
    <meta property="og:title" content="${pageTitle}" />
    <meta property="og:description" content="${pageDescription}" />
    <meta property="og:type" content="website" />
    </head>`);
  
  // Replace the loading message or existing countdown with the server-calculated one
  modifiedHtml = modifiedHtml.replace(
    /<div class="countdown" id="countdown">.*?<\/div>/i,
    `<div class="countdown" id="countdown">${countdownText}</div>`
  );
  
  // Optionally remove the client-side countdown JavaScript since it's no longer needed
  // But keep this commented out if you want to maintain client-side updating
  /*
  modifiedHtml = modifiedHtml.replace(
    /<script>[\s\S]*?<\/script>/i,
    ''
  );
  */
  
  // Instead, replace the complex time server script with a simpler one that just updates the seconds
  modifiedHtml = modifiedHtml.replace(
    /<script>[\s\S]*?<\/script>/i,
    `<script>
      // Simple countdown that updates based on the server's initial value
      // This avoids time server calls but keeps the countdown updating
      
      const countdownEl = document.getElementById('countdown');
      const serverCountdownText = "${countdownText}";
      let serverDays = ${Math.floor(difference / (1000 * 60 * 60 * 24))};
      let serverHours = ${Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))};
      let serverMinutes = ${Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))};
      let serverSeconds = ${Math.floor((difference % (1000 * 60)) / 1000)};
      
      // Start with server value
      countdownEl.innerText = serverCountdownText;
      
      // Update the countdown every second
      setInterval(() => {
        // Decrement the seconds
        serverSeconds--;
        
        // Handle time unit rollovers
        if (serverSeconds < 0) {
          serverSeconds = 59;
          serverMinutes--;
          
          if (serverMinutes < 0) {
            serverMinutes = 59;
            serverHours--;
            
            if (serverHours < 0) {
              serverHours = 23;
              serverDays--;
              
              if (serverDays < 0) {
                // End of life reached
                countdownEl.innerText = "Windows 10 has reached end of life!";
                return;
              }
            }
          }
        }
        
        // Update the display
        countdownEl.innerText = \`\${serverDays} days, \${serverHours} hours, \${serverMinutes} minutes, \${serverSeconds} seconds\`;
      }, 1000);
    </script>`
  );
  
  // Return the modified HTML with the same status and headers
  return new Response(modifiedHtml, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}
