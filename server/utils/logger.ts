import pino from 'pino';
import {
  CloudWatchLogsClient,
  CreateLogGroupCommand,
  CreateLogStreamCommand,
  PutLogEventsCommand,
} from '@aws-sdk/client-cloudwatch-logs';

const LOG_GROUP = '/kra/web';
// One stream per cold-start — warm invocations reuse it, no sequence token needed (deprecated since 2023)
const STREAM_NAME = `vercel-${process.env.VERCEL_DEPLOYMENT_ID ?? 'local'}-${Date.now()}`;

let cwClient: CloudWatchLogsClient | null = null;
let initialized = false;

function getClient(): CloudWatchLogsClient {
  if (!cwClient) {
    cwClient = new CloudWatchLogsClient({
      region: 'eu-west-1',
      credentials: {
        accessKeyId: process.env.NUXT_AWS_CW_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.NUXT_AWS_CW_SECRET_ACCESS_KEY ?? '',
      },
    })
  }
  return cwClient
}

async function ensureStream(): Promise<void> {
  if (initialized) return;
  try {
    await getClient().send(new CreateLogGroupCommand({ logGroupName: LOG_GROUP }));
  } catch (e: unknown) {
    if ((e as { name?: string }).name !== 'ResourceAlreadyExistsException') return;
  }
  try {
    await getClient().send(new CreateLogStreamCommand({ logGroupName: LOG_GROUP, logStreamName: STREAM_NAME }));
  } catch {
    // stream already exists on warm restart — fine
  }
  initialized = true;
}

async function sendToCloudWatch(msg: string): Promise<void> {
  try {
    await ensureStream();
    await getClient().send(new PutLogEventsCommand({
      logGroupName: LOG_GROUP,
      logStreamName: STREAM_NAME,
      logEvents: [{ message: msg, timestamp: Date.now() }],
    }));
  } catch {
    // CloudWatch failure must never break the request
  }
}

const isProduction = process.env.NODE_ENV === 'production';

const destination = isProduction
  ? { write: (msg: string) => { void sendToCloudWatch(msg); } }
  : process.stdout;

export const logger = pino({ level: 'error' }, destination);
