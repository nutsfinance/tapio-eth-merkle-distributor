import { S3, PutObjectCommand, HeadObjectCommand } from "@aws-sdk//client-s3";
import { SNS } from "@aws-sdk/client-sns";
import fetch from "axios";
import * as dotenv from "dotenv";
import * as fs from 'fs';

dotenv.config();

const s3 = new S3({ region: "us-west-1" });
const Bucket = "reward-data";

const sns = new SNS({ region: "us-west-1" });

export const fileExists = async (file: string) => {
    if (process.env.DEV) {
        try {
            fs.accessSync(__dirname + `/../data/${file}`);
            return true;
          } catch (error) {
            return false;
          }
    } else {
        const command = new HeadObjectCommand({
            Bucket,
            Key: file
        });
        try {
            await s3.send(command);
            return true;
        } catch (error) {
            return false;
        }
    }
}

export const createFile = async (file: string, content: string) => {
    console.log(`Creating file: ${file}`);

    if (process.env.DEV) {
        let fd = await fs.promises.open(__dirname + `/../data/${file}`, "w");
        await fs.promises.writeFile(fd, content);
        await fd.close();
    } else {
        const params = {
            Bucket,
            Key: file,
            Body: content
        };

        await s3.send(new PutObjectCommand(params));
    }
}

export const getFile = async (file: string) => {
    console.log(`Reading file: ${file}`);

    if (process.env.DEV) {
        let content = await fs.promises.readFile(__dirname + `/../data/${file}`, 'utf-8');
        if (file.endsWith(".json")) {
            return JSON.parse(content);
        } else {
            return content;
        }
    } else {
        // It's easier to file from static site directly
        const response = await fetch(`http://reward-data.s3-website-us-west-1.amazonaws.com/${file}`);
        if (response.status != 200) return "";

        return response.data;
    }
}

export const publishMessage = async (content: string) => {
    if (process.env.DEV) {
        console.log(`publishMessage: ${content}`);
    } else {
        await sns.publish({
            Message: content,
            TopicArn: "arn:aws:sns:us-west-1:343749756837:reward-pipeline"
        });
    }
}

/**
 * Localized versioon of the file handlers. 
 */

// export const fileExists = async (file: string) => {
//     const filePath = __dirname + '/../data/' + file;
//     return fs.existsSync(filePath);
// }

// export const createFile = async (file: string, content: string) => {
//     const filePath = __dirname + '/../data/' + file;
//     fs.writeFileSync(filePath, content);
// }

// export const getFile = async (file: string) => {
//     const filePath = __dirname + '/../data/' + file;
//     return fs.readFileSync(filePath).toString();
// }
