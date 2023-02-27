import { APIGatewayProxyEvent } from "aws-lambda";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const disconnect = async (event: APIGatewayProxyEvent) => {
  const connectionId = event.requestContext.connectionId;
  await prisma.wSConnection.delete({ where: { connectionID: connectionId } });
  return { statusCode: 200, body: "Disconnected." };
};
