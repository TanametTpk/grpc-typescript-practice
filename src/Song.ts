import { ISongsServer, SongsService } from '../protos/build/songs_grpc_pb'
import { Song, Comment } from '../protos/build/songs_pb';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import { ServerUnaryCall, sendUnaryData, ServerReadableStream, ServerWritableStream, ServerDuplexStream } from 'grpc';

type ListenerFn = (c: Comment) => void;

const listeners: ListenerFn[] = [];

export function registerListener(fn: ListenerFn): void {
    listeners.push(fn);
}

export function addComment(comment: Comment): void {
    listeners.map(listener => listener(comment));
}

export default class SongsServer implements ISongsServer{
    
    getSong(call: ServerUnaryCall<Empty>, callback: sendUnaryData<Song>): void{
        console.log(`${new Date().toISOString()}    getSong`);

        let song: Song = new Song()
        song.setId(1)
        song.setTitle("hello world")
        song.setArtist("me")

        callback(null, song);
    }

    addSongs(call: ServerReadableStream<Song>, callback: sendUnaryData<Empty>): void {
        console.log(`${new Date().toISOString()}    addSongs`);

        call.on('data', (song: Song) => {
            console.log("add songs (as stream) to db", song);
        });

        call.on('end', () => callback(null, new Empty()));
    }

    async getChat(call: ServerWritableStream<Song>): Promise<void> {
        console.log(`${new Date().toISOString()}    getChat`);

        const song = call.request as Song;
        const comment1 = new Comment();
        const comment2 = new Comment();
        comment1.setSongId(song.getId());
        comment2.setSongId(song.getId());

        comment1.setUsername("user1");
        comment2.setUsername("user2");

        comment1.setBody("wow that's nice");
        comment2.setBody("that epic");

        for (const comment of [comment1, comment2]) {
            call.write(comment);
        }

        call.end();
    }

    liveChat(call: ServerDuplexStream<Comment, Comment>): void {
        console.log(`${new Date().toISOString()}    liveChat`);

        registerListener(comment => call.write(comment));
        call.on('data', (comment: Comment) => {
            addComment(comment);
        });

        call.on('end', () => call.end());
    }
    
}