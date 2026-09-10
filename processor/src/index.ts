import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";
import { pollGoogleCalendarTriggers } from "./poller";

dotenv.config();

const TOPIC_NAME = process.env.KAFKA_TOPIC || "zap-events";
const BROKERS = (process.env.KAFKA_BROKERS || "localhost:9092").split(",");

const client = new PrismaClient();

const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: BROKERS,
  retry: {
    initialRetryTime: 300,
    retries: 10
  }
});

async function main() {
  console.log(`[Processor] Starting Outbox Processor & Calendar Poller... Brokers: ${BROKERS}, Topic: ${TOPIC_NAME}`);
  
  const producer = kafka.producer();
  let connected = false;

  while (!connected) {
    try {
      await producer.connect();
      connected = true;
      console.log("[Processor] Connected to Kafka Producer successfully!");
    } catch (err) {
      console.log("[Processor] Waiting for Kafka to become available... Retrying in 3 seconds.");
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  let pollCounter = 0;

  while (true) {
    try {

      pollCounter++;
      if (pollCounter >= 15) {
        pollCounter = 0;
        await pollGoogleCalendarTriggers(client);
      }

      const pendingRows = await client.zapRunOutbox.findMany({
        where: {},
        take: 10
      });

      if (pendingRows.length > 0) {
        console.log(`[Processor] Found ${pendingRows.length} pending outbox event(s)`);

        await producer.send({
          topic: TOPIC_NAME,
          messages: pendingRows.map((r) => ({
            key: r.zapRunId,
            value: JSON.stringify({
              zapRunId: r.zapRunId,
              stage: 0
            })
          }))
        });

        console.log(`[Processor] Dispatched ${pendingRows.length} message(s) to Kafka topic '${TOPIC_NAME}'`);

        await client.zapRunOutbox.deleteMany({
          where: {
            id: {
              in: pendingRows.map((x) => x.id)
            }
          }
        });

        console.log(`[Processor] Removed ${pendingRows.length} processed outbox records from DB`);
      }
    } catch (error) {
      console.error("[Processor] Error in processing loop:", error);
    }

    await new Promise((r) => setTimeout(r, 2000));
  }
}

main().catch((err) => {
  console.error("[Processor] Fatal error:", err);
  process.exit(1);
});
