import grpc from 'grpc';
import { ISongsServer, SongsService } from './protos/build/songs_grpc_pb';
import SongsServer from './src/Song';

const server = new grpc.Server();
server.addService<ISongsServer>(SongsService, new SongsServer());
console.log("listen on port 8080");
server.bind(`localhost:8080`, grpc.ServerCredentials.createInsecure());
server.start()
