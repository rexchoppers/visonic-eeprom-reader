import * as fs from "node:fs";
import { JSONRPCClient } from "json-rpc-2.0";
import { Base64 } from 'js-base64';

async function run() {
    const config = readConfigFile('config.json');
    if (!config) {
        console.error('Error reading config file');
        return;
    }

    const url = getUrl(config);
    const client = createClient(url);
    createDataDirectory();

    for (let i = config.address.start; i >= config.address.end; i--) {
        const dataString = await getDataString(client, config, i);
        writeFile(dataString, i);
    }
}

function getUrl(config: any) {
    return `http://${config.visonic.ip}:${config.visonic.port}/remote/json-rpc`;
}

function createClient(url: string) {
    // @ts-ignore
    const client = new JSONRPCClient((jsonRPCRequest) =>
        fetch(url, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
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

    return client;
}

function createDataDirectory() {
    const dataDir = './data';
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
}

async function getDataString(client: any, config: any, address: number) {
    let dataString = '';

    console.log("Address: " + address);

    // Make inital request to get the number of items
    const initialData = await client.request("PmaxService/getEepromItem", [address, 0, config.timeout.request]);
    
    // Append the first item
    dataString += initialData.items[0].item.data;

    // Loop through the rest of the items if `maxItems` is greater than 1
    if (initialData.items[0].item.maxItems <= 1) {
        return dataString;
    }

    for (let j = 1; j < initialData.items[0].item.maxItems; j++) {
        try {
            console.log("Address: " + address + " Item: " + j);
            const data = await client.request("PmaxService/getEepromItem", [address, j, config.timeout.request]);

            const rawData = data.items[0].item.data;

            dataString += '\n' + rawData;

        } catch (error) {
            continue
        }

        await sleep(config.sleep);
    }

    return dataString;
}

function writeFile(dataString: string, address: number) {
    fs.writeFileSync(`./data/${address}.txt`, dataString);
}

// Config
interface Config {
    visonic: {
        ip: string;
        port: number;
    };
    address: {
        start: number;
        end: number;
    },
    timeout: {
        request: number;
    },
    sleep: number;
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
