import * as fs from "node:fs";
import { JSONRPCClient } from "json-rpc-2.0";

async function run() {
  /*  const config = readConfigFile('config.json');
    if (!config) {
        console.error('Error reading config file');
        return;
    }

    console.log(config);*/

    const url = 'http://192.168.5.180:8181/remote/json-rpc';

    // Create JSON RPC Client
    // @ts-ignore
    const client = new JSONRPCClient((jsonRPCRequest) =>
        fetch(url, {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(jsonRPCRequest),
            // @ts-ignore
        }).then((response) => {
            if (response.status === 200) {
                // Use client.receive when you received a JSON-RPC response.
                return response
                    .json()
                    .then((jsonRPCResponse) => client.receive(jsonRPCResponse));
            } else if (jsonRPCRequest.id !== undefined) {
                return Promise.reject(new Error(response.statusText));
            }
        })
    );

    const data = [];

    // Work down from 440
    for (let i = 440; i >= 0; i--) {
        const subData = [];

        for (let j = 0; j < 16; j++) {
            console.log(JSON.stringify(await client.request("PmaxService/getEepromItem", [i, j, 256])));
        }
    }

    client
        .request("PmaxService/getEepromItem", [440, 1, 256])
        // @ts-ignore
        .then((result) => console.log(result));


}

// Config
interface Config {
    visonic: {
        url: string;
    };
}

const readConfigFile = (filePath: string): Config | null => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data) as Config;
    } catch (err) {
        console.error('Error reading config file:', err);
        return null;
    }
}

run();
