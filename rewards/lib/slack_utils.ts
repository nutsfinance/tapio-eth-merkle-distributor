import axios from 'axios';
import * as dotenv from "dotenv";

dotenv.config();

export const sendToSlack = async (is_success: boolean, content: string) => {
    const color = is_success ? 'good' : 'danger';
    const body = {
      attachments: [
        {
          text: content,
          color: color
        }
      ]
    };

    console.log(content)
    if (process.env.SLACK_URL) {
        axios.post(process.env.SLACK_URL as string, body);
    }
}
