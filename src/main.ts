import { isSafeToUnpackElectronOnRemoteBuildServer } from 'app-builder-lib/out/platformPackager';
import * as http from 'http'
import crypto from 'crypto'

enum rt {
    Connect,
    Update,
    Send,
    Shutdown,
    Unknown
}

interface user {
    name: string,
    token: string
}

interface request {
    type: rt,
    args: string[]
}

let tokens: string[] = [];
let users: user[] = []

function requestTypeC(i: string) {
    switch (i) {
        case 'connect': 
            return rt.Connect;
        case 'update':
            return rt.Update;
        case 'send':
            return rt.Send;
        case 'shutdown':
            return rt.Shutdown
        default:
            return rt.Unknown;
    }
}

function no_undefined<T>(i: T | undefined): T {
    return i == undefined
        ? <T>{}
        : i
}

function connect(username: string) {
    while (true) {
        let candidate = crypto.randomBytes(8).toString('hex');
        if (!tokens.includes(candidate)) {
            tokens.push(candidate);
            users.push({
                name: username,
                token: candidate
            })
            return candidate;
        }
    }
}

function main(argv: string[]) {
    let server = http.createServer((req, res) => {
        let message: request = {
            type: requestTypeC(no_undefined<string>(req.url?.split(':')[0].replace('/', ''))),
            args: no_undefined<string[]>(req.url?.split(':').slice(1))
        }
        console.log(message)

        switch (message.type) {
            case rt.Connect: {
                console.log(`connecting ${message.args[0]}`)
                res.writeHead(200)
                res.write(connect(message.args[0]))
                res.end()
            }
        }
    })

    server.listen(1000, () => {
        console.log('running @ port 1000')
    })
    return 0;
}

main(process.argv.slice(2))