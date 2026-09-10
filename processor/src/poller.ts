import { PrismaClient } from "@prisma/client";

export async function pollGoogleCalendarTriggers(client: PrismaClient) {
  try {

    const calendarZaps = await client.zap.findMany({
      where: {
        trigger: {
          triggerId: "google-calendar"
        }
      },
      include: {
        trigger: true,
        user: true,
        zapRuns: {
          take: 1,
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (calendarZaps.length === 0) {
      return;
    }

    const now = new Date();
    const dayOfWeek = now.getDay();
    const isSunday = dayOfWeek === 0;

    for (const zap of calendarZaps) {
      const metadata = (zap.trigger?.metadata || {}) as Record<string, any>;
      const eventTitle = metadata.eventTitle || "Weekly AI Digest";
      const recurrenceDay = metadata.recurrenceDay || "Sunday";
      const targetDayNumber = recurrenceDay.toLowerCase() === "sunday" ? 0 : 0;

      const isTargetDay = dayOfWeek === targetDayNumber;

      const lastRun = zap.zapRuns[0];
      if (lastRun) {
        const lastRunDate = new Date(lastRun.createdAt);
        const isSameDay =
          lastRunDate.getFullYear() === now.getFullYear() &&
          lastRunDate.getMonth() === now.getMonth() &&
          lastRunDate.getDate() === now.getDate();

        if (isSameDay) {

          continue;
        }
      }

      const accessToken = metadata.accessToken || process.env.GOOGLE_CALENDAR_ACCESS_TOKEN;
      const calendarId = encodeURIComponent(metadata.calendarId || "primary");

      let eventDetected = false;
      let matchedEvent = {
        summary: eventTitle,
        start: now.toISOString(),
        description: `Automated ${recurrenceDay} trigger for ${eventTitle}`
      };

      if (accessToken) {
        try {
          const windowStart = new Date(now.getTime() - 15 * 60 * 1000).toISOString();
          const windowEnd = new Date(now.getTime() + 15 * 60 * 1000).toISOString();
          const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?singleEvents=true&timeMin=${windowStart}&timeMax=${windowEnd}&q=${encodeURIComponent(
            eventTitle
          )}`;

          const res = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });

          if (res.ok) {
            const data = await res.json();
            const items = data.items || [];
            if (items.length > 0) {
              eventDetected = true;
              matchedEvent = {
                summary: items[0].summary || eventTitle,
                start: items[0].start?.dateTime || items[0].start?.date || now.toISOString(),
                description: items[0].description || ""
              };
            }
          }
        } catch (err) {
          console.error(`[Poller] Error polling Google Calendar API for Zap ${zap.id}:`, err);
        }
      } else {

        if (isTargetDay) {
          eventDetected = true;
          console.log(`[Poller] (Simulation) Target recurrence day (${recurrenceDay}) matched for Zap ${zap.id}`);
        }
      }

      if (eventDetected) {
        console.log(`[Poller] Firing trigger for Zap ${zap.id} (${eventTitle})...`);

        await client.$transaction(async (tx) => {
          const zapRun = await tx.zapRun.create({
            data: {
              zapId: zap.id,
              metadata: {
                source: "google-calendar",
                event: matchedEvent,
                triggerTime: now.toISOString(),
                recipientEmail: metadata.recipientEmail || zap.user.email
              }
            }
          });

          await tx.zapRunOutbox.create({
            data: {
              zapRunId: zapRun.id
            }
          });

          console.log(`[Poller] Successfully queued ZapRun ${zapRun.id} for Zap ${zap.id}`);
        });
      }
    }
  } catch (error) {
    console.error("[Poller] Error in Google Calendar poller loop:", error);
  }
}
