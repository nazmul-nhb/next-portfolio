import { isArrayOfType, isNonEmptyString, isString, isValidArray } from 'nhb-toolbox';
import { ENV } from '@/configs/env';

type Message = {
    to: string;
    message: string;
};

type BulkSmsResponse = {
    response_code: number;
    success_message: string;
    error_message: string;
};

type SmsBody = {
    api_key: string;
    senderid: string;
    number?: string;
    message?: string;
    messages?: Message[];
};

/**
 * * Send multiple SMS to different numbers
 * @param messages - Array of messages
 */
export async function sendSMS(messages: Message[]): Promise<void>;

/**
 * * Send same SMS to multiple numbers
 * @param to - Array of numbers
 * @param message - Message to send
 */
export async function sendSMS(to: string[], message: string): Promise<void>;

/**
 * * Send single SMS to a number
 * @param to - Number to send SMS to
 * @param message - Message to send
 */
export async function sendSMS(to: string, message: string): Promise<void>;

export async function sendSMS(toOrMessages: string | string[] | Message[], msg?: string) {
    const { bulkSmsApiKey, bulkSmsSenderId } = ENV.sms;

    try {
        if (!bulkSmsApiKey || !bulkSmsSenderId) {
            throw new Error('SMS configuration is missing! Check .env file!');
        }

        let smsApi = 'https://bulksmsbd.net/api';

        const smsBody = {
            api_key: bulkSmsApiKey,
            senderid: bulkSmsSenderId,
        } as SmsBody;

        if (isValidArray(toOrMessages)) {
            if (isArrayOfType(toOrMessages, isString)) {
                smsApi = `${smsApi}/smsapimany`;
                smsBody.number = toOrMessages.join(',');
                smsBody.message = String(msg);
            } else {
                smsApi = `${smsApi}/smsapi`;
                smsBody.messages = toOrMessages;
            }
        } else if (isNonEmptyString(msg)) {
            smsApi = `${smsApi}/smsapi`;
            smsBody.number = toOrMessages;
            smsBody.message = msg;
        }

        const res = await fetch(smsApi, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(smsBody),
        });

        const data: BulkSmsResponse = await res.json();

        if (!data.success_message) {
            throw new Error(data.error_message);
        }
    } catch (error) {
        console.error('Failed to send SMS: ', error);
    }
}
