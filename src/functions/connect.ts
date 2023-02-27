import { APIGatewayProxyEvent } from "aws-lambda";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type payload = {
  message: string;
  senderID: string;
  channelID: string;
};

export const connect = async (event: APIGatewayProxyEvent) => {
  let payload: payload;
  if (event.body) {
    payload = JSON.parse(event.body);
    const senderID = payload.senderID;
    const channelID = parseInt(payload.channelID);
    const connectionId = event.requestContext.connectionId;
    await prisma.wSConnection.create({
      data: {
        connectionID: connectionId,
        channelID: channelID,
        userId: senderID,
      },
    });
    return { statusCode: 200, body: "Connected." };
  } else {
    return { statusCode: 400, body: "Invalid request." };
  }
};
