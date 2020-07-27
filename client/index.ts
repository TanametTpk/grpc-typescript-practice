import grpc, { ServiceError, ClientWritableStream, ClientReadableStream } from 'grpc';
import services from '../protos/build/songs_grpc_pb';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import { Song, Comment } from '../protos/build/songs_pb';
import inquirer from 'inquirer';

let client = new services.SongsClient(`localhost:8080`, grpc.credentials.createInsecure());

const addSongs = () => {
    const stream: ClientWritableStream<Song> = client.addSongs((error: ServiceError | null, response: Empty) => {

        console.log("error", error);
        console.log("add complete")
    
    })
    
    let s1 = new Song()
    let s2 = new Song()
    
    s1.setId(2)
    s2.setId(3)
    
    s1.setTitle("two")
    s2.setTitle("three")
    s1.setArtist("test1")
    s2.setArtist("test2")
    let songs: Song[] = [s1, s2]
    
    for (let i = 0; i < songs.length; i++){
        stream.write(songs[i])
    }
    
    stream.end()
}

const getSong = () => {

    client.getSong(new Empty(), (err: ServiceError | null, song: Song): void => {

        console.log(song)

    })

}

const getChat = () => {

    const song = new Song()
    song.setId(1);

    const stream: ClientReadableStream<Comment> = client.getChat(song)

    stream.on("data", (comment: Comment) => {
        console.log("comment stream from server", comment);
    })

    stream.on('end', () => {
        console.log("end comment stream");
    })

    stream.on('error', (err: Error) => {
        console.log("error", err);
    })

}

const liveChat = async() => {

    const stream = client.liveChat();

    stream.on("data", (comment: Comment) => {
        console.log("got data from live chat", comment);
    })
    stream.on("end", () => console.log("live end"))
    stream.on("error", () => console.log("live error"))

    while (true) {
        const answer = await inquirer.prompt([
            {
                name: 'message',
                message: 'Type message:',
            },
        ]);

        if (answer.message === "exit") {
            stream.end();
            break;
        };

        const comment: Comment = new Comment();
        comment.setUsername("tester2");
        comment.setBody(answer.message);
        comment.setSongId(1);
        stream.write(comment);
    }

}

liveChat()