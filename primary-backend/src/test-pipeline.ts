async function testPipeline() {
  console.log("=== Automate End-to-End Pipeline Verification ===");
  console.log("1. Creating test user account...");
  const email = `testuser_${Date.now()}@example.com`;
  const password = "password123";

  const signupRes = await fetch("http://localhost:3000/api/v1/user/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: email,
      password,
      name: "AI Digest Subscriber"
    })
  });
  const signupData = await signupRes.json();

  console.log("2. Logging in...");
  const signinRes = await fetch("http://localhost:3000/api/v1/user/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: email,
      password
    })
  });
  const signinData = await signinRes.json();
  const token = signinData.token;
  console.log("-> Authenticated successfully!");

  console.log("3. Creating Zap: Google Calendar -> AI Agent -> Send Email...");
  const zapRes = await fetch("http://localhost:3000/api/v1/zap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({
      availableTriggerId: "google-calendar",
      triggerMetadata: {
        eventTitle: "Weekly AI Digest",
        recurrenceDay: "Sunday"
      },
      actions: [
        {
          availableActionId: "ai-agent",
          actionMetadata: {
            topic: "trending artificial intelligence breakthroughs and model releases in the past week"
          }
        },
        {
          availableActionId: "email",
          actionMetadata: {
            to: "subscriber@example.com",
            subject: "Weekly AI News Digest — {event.summary}",
            body: "Hello Subscriber,\n\nHere is your weekly AI news intelligence digest:\n\n{ai_summary}\n\nAutomated via Automate workflow."
          }
        }
      ]
    })
  });
  const zapData = await zapRes.json();
  const zapId = zapData.zapId;
  console.log(`-> Automation created! Zap ID: ${zapId}`);

  console.log(`4. Triggering Zap via POST /api/v1/zap/${zapId}/trigger ...`);
  const triggerRes = await fetch(`http://localhost:3000/api/v1/zap/${zapId}/trigger`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({})
  });
  const triggerData = await triggerRes.json();

  console.log(`-> Trigger successfully queued! ZapRun ID: ${triggerData.zapRunId}`);
  console.log("=== Pipeline Dispatched! ===");
}

testPipeline().catch(console.error);
