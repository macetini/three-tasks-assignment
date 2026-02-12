// src/core/mvcs/model/states/dto/MagicWordsResponse.ts

/**
 * Data Transfer Object (DTO) representing the raw API response for the Magic Words feature.
 * * This interface acts as the strict contract for the JSON payload. 
 * It is used by the FetchMagicWordsCommand to validate and parse 
 * incoming data before converting it into domain-specific Value Objects.
 */
export interface MagicWordsResponse {
    /** * Collection of character dialogue entries.
     * Raw text may contain tokens like "{smile}" to be parsed by the RichTextParser.
     */
    dialogue: {
        name: string;
        text: string;
    }[];

    /** * Mapping of emoji identifiers to their remote asset URLs.
     * Note: Property matches raw JSON schema spelling ('emojies').
     */
    emojies: {
        name: string;
        url: string;
    }[];

    /** * Configuration for character avatars, including remote URLs 
     * and their intended screen alignment.
     */
    avatars: {
        name: string;
        url: string;
        position: 'left' | 'right';
    }[];
}