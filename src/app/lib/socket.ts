import { Socket , io} from "socket.io-client"

let socket:Socket|null=null

export const getSocket = (): Socket => {
  socket ??= io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL as string);
  return socket;
}