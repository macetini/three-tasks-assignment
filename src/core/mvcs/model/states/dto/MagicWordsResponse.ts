// src/core/mvcs/model/states/dto/MagicWordsResponse.ts

/**
 * Representing the raw Data Transfer Object from the API.
 */
export interface MagicWordsResponse {
    dialogue: { name: string; text: string }[];
    emojies: { name: string; url: string }[];
    avatars: { name: string; url: string; position: 'left' | 'right' }[];
}