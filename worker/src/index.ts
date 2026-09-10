import dotenv from "dotenv";
import http from "http";
import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";
import { parse } from "./parser";
import { sendEmail } from "./email";
import { runAIAgentNewsSummary } from "./agent";

dotenv.config();

const PORT = process.env.PORT || 3004;
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("worker ok");
}).listen(PORT, () => {
  console.log(`[Worker] Health listener running on port ${PORT}`);
});

const TOPIC_NAME = process.env.KAFKA_TOPIC || "automate-events";
const defaultBrokers = "kafka-2af304dd-anuragsngh2615-adf3.f.aivencloud.com:25685";
const BROKERS = (process.env.KAFKA_BROKERS || defaultBrokers).split(",");

const prismaClient = new PrismaClient();

const kafkaConfig: any = {
  clientId: "execution-worker",
  brokers: BROKERS,
  retry: {
    initialRetryTime: 300,
    retries: 10
  }
};

if (process.env.KAFKA_SASL_USERNAME && process.env.KAFKA_SASL_PASSWORD) {
  kafkaConfig.ssl = { rejectUnauthorized: false };
  kafkaConfig.sasl = {
    mechanism: process.env.KAFKA_SASL_MECHANISM || "scram-sha-256",
    username: process.env.KAFKA_SASL_USERNAME,
    password: process.env.KAFKA_SASL_PASSWORD
  };
}

const kafka = new Kafka(kafkaConfig);

async function main() {
  console.log(`[Worker] Starting Execution Worker... Brokers: ${BROKERS}, Topic: ${TOPIC_NAME}`);

  const consumer = kafka.consumer({ groupId: "main-worker-group" });
  const producer = kafka.producer();

  let connected = false;
  while (!connected) {
    try {
      await consumer.connect();
      await producer.connect();
      await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });
      connected = true;
      console.log("[Worker] Connected to Kafka consumer & producer successfully!");
    } catch (err) {
      console.log("[Worker] Waiting for Kafka to become available... Retrying in 3 seconds.");
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      const rawValue = message.value?.toString();
      if (!rawValue) return;

      console.log(`[Worker] Received message on partition ${partition}, offset ${message.offset}: ${rawValue}`);

      try {
        const parsedValue = JSON.parse(rawValue);
        const zapRunId: string = parsedValue.zapRunId;
        const stage: number = parsedValue.stage ?? 0;

        const zapRunDetails = await prismaClient.zapRun.findFirst({
          where: { id: zapRunId },
          include: {
            zap: {
              include: {
                actions: {
                  include: {
                    type: true
                  },
                  orderBy: {
                    sortingOrder: "asc"
                  }
                }
              }
            }
          }
        });

        if (!zapRunDetails) {
          console.log(`[Worker] ZapRun with ID ${zapRunId} not found.`);
          return;
        }

        const actions = zapRunDetails.zap.actions;
        const currentAction = actions.find((x) => x.sortingOrder === stage);

        if (!currentAction) {
          console.log(`[Worker] No action found for stage ${stage} in ZapRun ${zapRunId}.`);
          return;
        }

        const zapRunMetadata = zapRunDetails.metadata;
        const actionMetadata = (currentAction.metadata || {}) as Record<string, any>;
        const actionType = currentAction.type.id;

        console.log(`[Worker] Executing stage ${stage}: Action '${currentAction.type.name}' (${actionType})`);

        if (actionType === "ai-agent") {
          const rawTopic = actionMetadata.topic || "trending artificial intelligence breakthroughs and model releases in the past week";
          const resolvedTopic = parse(rawTopic, zapRunMetadata);

          console.log(`[Worker] Running AI Agent Researcher for topic: "${resolvedTopic}"`);
          const summary = await runAIAgentNewsSummary(resolvedTopic);

          const updatedMetadata = {
            ...(typeof zapRunMetadata === "object" && zapRunMetadata !== null ? (zapRunMetadata as Record<string, any>) : {}),
            ai_summary: summary,
            summary: summary,
            research_topic: resolvedTopic
          };

          await prismaClient.zapRun.update({
            where: { id: zapRunId },
            data: {
              metadata: updatedMetadata
            }
          });

          Object.assign(zapRunMetadata as object, updatedMetadata);
          console.log(`[Worker] Stage ${stage} AI Agent finished. Generated ${summary.length} chars digest and updated ZapRun metadata.`);
        } else if (actionType === "email") {
          const rawTo = actionMetadata.email || actionMetadata.to || "";
          const rawBody = actionMetadata.body || "";
          const rawSubject = actionMetadata.subject || "Weekly AI News Digest";

          const to = parse(rawTo, zapRunMetadata);
          const body = parse(rawBody, zapRunMetadata);
          const subject = parse(rawSubject, zapRunMetadata);

          await sendEmail(to, body, subject);
        } else {
          console.log(`[Worker] Unhandled action type: ${actionType}`);
        }

        await new Promise((r) => setTimeout(r, 500));

        const lastStage = (actions.length || 1) - 1;
        if (stage < lastStage) {
          console.log(`[Worker] Re-queueing next stage (${stage + 1}) for ZapRun ${zapRunId}`);
          await producer.send({
            topic: TOPIC_NAME,
            messages: [
              {
                key: zapRunId,
                value: JSON.stringify({
                  zapRunId,
                  stage: stage + 1
                })
              }
            ]
          });
        } else {
          console.log(`[Worker] Workflow completely executed for ZapRun ${zapRunId} (${actions.length} action(s))`);
        }

        await consumer.commitOffsets([
          {
            topic: TOPIC_NAME,
            partition,
            offset: (parseInt(message.offset, 10) + 1).toString()
          }
        ]);
      } catch (err) {
        console.error(`[Worker] Error processing message:`, err);
      }
    }
  });
}

main().catch((err) => {
  console.error("[Worker] Fatal error:", err);
  process.exit(1);
});
