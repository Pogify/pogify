import axios from "axios";
import promiseRetry from "promise-retry";

type SessionClaimSolution = {
  sessionId: string;
  issued: number;
  checksum: string;
  solution: string;
  hash: string;
};

type SessionClaim = {
  expiresIn: number;
  refreshToken: string;
  session: string;
  token: string;
};

const answerChallenge = (answer: SessionClaimSolution): Promise<SessionClaim> =>
  promiseRetry(
    async () => (await axios.post("https://api.pogify.net/v2/session/claim", answer)).data
  );

type SessionClaimChallenge = {
  checksum: string;
  difficulty: number;
  issued: number;
  sessionId: string;
};

const fetchChallenge = (): Promise<SessionClaimChallenge> =>
  promiseRetry<SessionClaimChallenge>(
    async () => (await axios.get("https://api.pogify.net/v2/session/issue")).data
  );

export const newSession = async (): Promise<SessionClaim> => {
  const challenge = await fetchChallenge();

  const solution = await findSolution(challenge);

  return answerChallenge(solution);
};

const findSolution = async ({
  sessionId,
  issued,
  difficulty,
  checksum,
}: SessionClaimChallenge): Promise<SessionClaimSolution> => {
  const nonce = `${sessionId}.${issued}`;

  let solution = Math.floor(Math.random() * 10000000);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const hash = await sha256(solution + nonce);
    const hashInBinary = hex2bin(hash);

    if (hashInBinary.startsWith("0".repeat(difficulty))) {
      return {
        checksum,
        hash,
        issued,
        sessionId,
        solution: String(solution),
      };
    }
    solution += 1;
  }
};

async function sha256(message: string) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);

  // hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string
  return hashArray.map((b) => `00${b.toString(16)}`.slice(-2)).join("");
}

function hex2bin(hex: string): string {
  const splitHexString = hex.match(/.{1,2}/g);

  if (splitHexString === null) {
    throw new Error("not a valid hex string");
  }

  return splitHexString
    .map((hexChar) => parseInt(hexChar, 16).toString(2).padStart(8, "0"))
    .join("");
}

type UpdateResponse = {
  session: string;
  publishedMessages: string;
  storedMessages: string;
  subscribers: string;
};

export const postUpdate = async (token: string, update: unknown): Promise<UpdateResponse> => {
  const res = (
    await axios.post("https://api.pogify.net/v2/session/update", update, {
      headers: {
        "X-SESSION-TOKEN": token,
      },
    })
  ).data;

  return {
    publishedMessages: res.published_messages,
    subscribers: res.subscribers,
    session: res.channel,
    storedMessages: res.stored_messages,
  };
};

export const refreshSessionAccessToken = (
  sessionToken: string,
  refreshToken: string
): Promise<SessionClaim> =>
  promiseRetry<SessionClaim>(
    async () =>
      (
        await axios.post("https://api.pogify.net/v2/session/refresh", null, {
          params: {
            sessionToken,
            refreshToken,
          },
        })
      ).data
  );
