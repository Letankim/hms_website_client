import * as signalR from "@microsoft/signalr";

const connection = new signalR.HubConnectionBuilder()
    .withUrl(`https://localhost:7191/callHub?userId=123`)
    .withAutomaticReconnect()
    .build();

export default connection;
