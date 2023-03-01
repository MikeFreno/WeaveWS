import { APIGatewayProxyEvent } from "aws-lambda";
import { PrismaClient } from "@prisma/client";
import * as AWS from "aws-sdk";

const prisma = new PrismaClient();

type payloadType = {
  message: string;
  senderID: string;
  channelID: string;
  channelUpdate: boolean;
};

export default async function handler(event: APIGatewayProxyEvent) {
  let payload: payloadType;
  const connectionId = event.requestContext.connectionId;
  if (event.body) {
    payload = JSON.parse(event.body);
    const senderID = payload.senderID;
    const channelID = parseInt(payload.channelID);
    const message = payload.message;
    //channel set request
    console.log("Update Boolean: " + payload.channelUpdate);
    if (payload.channelUpdate === true) {
      console.log("This Connection: " + connectionId);
      await prisma.wSConnection.update({
        where: {
          connectionID: connectionId,
        },
        data: {
          channelID: channelID,
          userId: senderID,
        },
      });
      return { statusCode: 200, body: "Connection update." };
      // message request
    } else if (payload.channelUpdate === false) {
      const comment = await prisma.comment.create({
        data: {
          message: message,
          channelID: channelID,
          userId: senderID,
        },
      });

      const connections = await prisma.wSConnection.findMany({
        where: {
          channelID: channelID,
        },
      });
      const apigwManagementApi = new AWS.ApiGatewayManagementApi({
        apiVersion: "2018-11-29",
        endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
      });

      await Promise.all(
        connections.map(async (connection) => {
          try {
            await apigwManagementApi
              .postToConnection({
                ConnectionId: connection.connectionID,
                Data: JSON.stringify(comment),
              })
              .promise();
          } catch (e) {
            if (e.statusCode === 410) {
              // If a connection is no longer available, delete it from the database.
              await prisma.wSConnection.delete({
                where: { connectionID: connection.connectionID },
              });
            } else {
              throw e;
            }
          }
        })
      );
      return { statusCode: 200, body: "Message sent." };
    }
  } else {
    return { statusCode: 400, body: "Invalid request." };
  }
}
