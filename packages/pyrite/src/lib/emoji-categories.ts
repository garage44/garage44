// Emoji categorization utility - categorizes emojis like Slack

export type EmojiCategory = 
    | 'smileys'
    | 'people'
    | 'animals'
    | 'food'
    | 'travel'
    | 'activities'
    | 'objects'
    | 'symbols'
    | 'flags'

export interface EmojiCategoryInfo {
    id: EmojiCategory
    name: string
    icon: string
}

export const emojiCategories: EmojiCategoryInfo[] = [
    {id: 'smileys', name: 'Smileys & People', icon: '😀'},
    {id: 'people', name: 'People & Body', icon: '👋'},
    {id: 'animals', name: 'Animals & Nature', icon: '🐶'},
    {id: 'food', name: 'Food & Drink', icon: '🍔'},
    {id: 'travel', name: 'Travel & Places', icon: '🚗'},
    {id: 'activities', name: 'Activities', icon: '⚽'},
    {id: 'objects', name: 'Objects', icon: '💡'},
    {id: 'symbols', name: 'Symbols', icon: '❤️'},
    {id: 'flags', name: 'Flags', icon: '🏳️'},
]

/**
 * Categorizes an emoji based on its Unicode code point
 * Uses Unicode emoji standard ranges for accurate categorization
 */
export function categorizeEmoji(emoji: string): EmojiCategory {
    // Handle multi-character emojis (sequences)
    const firstChar = emoji[0]
    const codePoint = firstChar.codePointAt(0) ?? 0

    // Flags (Regional Indicator Symbols) - flags are sequences starting with regional indicators
    // Check if first character is a regional indicator (0x1F1E6-0x1F1FF)
    if (codePoint >= 0x1F1E6 && codePoint <= 0x1F1FF) {
        return 'flags'
    }
    // Also check for flag emoji sequences (two regional indicators)
    if (emoji.length >= 2) {
        const secondCodePoint = emoji[1]?.codePointAt(0) ?? 0
        if (secondCodePoint >= 0x1F1E6 && secondCodePoint <= 0x1F1FF) {
            return 'flags'
        }
    }

    // Smileys & Emotion (0x1F600-0x1F64F) - facial expressions
    if (codePoint >= 0x1F600 && codePoint <= 0x1F64F) {
        return 'smileys'
    }

    // People & Body - gestures and body parts
    // Hand gestures (0x1F44B-0x1F450, 0x1F590-0x1F595, 0x1F64C-0x1F64F, 0x1F91A-0x1F93A)
    if (codePoint >= 0x1F44B && codePoint <= 0x1F450) {
        return 'people'
    }
    if (codePoint >= 0x1F590 && codePoint <= 0x1F595) {
        return 'people'
    }
    if (codePoint >= 0x1F91A && codePoint <= 0x1F93A) {
        return 'people'
    }
    // Body parts and people (0x1F440-0x1F44A, 0x1F4AA, 0x1F9B0-0x1F9B9, 0x1F9D0-0x1F9FF)
    if (codePoint >= 0x1F440 && codePoint <= 0x1F44A) {
        return 'people'
    }
    if (codePoint === 0x1F4AA) {
        return 'people'
    }
    if (codePoint >= 0x1F9B0 && codePoint <= 0x1F9B9) {
        return 'people'
    }
    if (codePoint >= 0x1F9D0 && codePoint <= 0x1F9FF) {
        // Some are people, some are objects - check more specifically
        if (codePoint >= 0x1F9D0 && codePoint <= 0x1F9DF) {
            return 'people'
        }
    }

    // Animals & Nature
    // Animals (0x1F400-0x1F43F)
    if (codePoint >= 0x1F400 && codePoint <= 0x1F43F) {
        return 'animals'
    }
    // Nature/plants (0x1F330-0x1F33F, 0x1F490-0x1F4AB)
    if (codePoint >= 0x1F330 && codePoint <= 0x1F33F) {
        return 'animals'
    }
    if (codePoint >= 0x1F490 && codePoint <= 0x1F4AB) {
        return 'animals'
    }

    // Food & Drink (0x1F32D-0x1F37F, 0x1F950-0x1F96F)
    if (codePoint >= 0x1F32D && codePoint <= 0x1F37F) {
        return 'food'
    }
    if (codePoint >= 0x1F950 && codePoint <= 0x1F96F) {
        return 'food'
    }

    // Travel & Places
    // Transport (0x1F680-0x1F6FF)
    if (codePoint >= 0x1F680 && codePoint <= 0x1F6FF) {
        return 'travel'
    }
    // Places (0x1F3D5-0x1F3F0, 0x1F3F4, 0x1F3F5, 0x1F3F7-0x1F3FA)
    if (codePoint >= 0x1F3D5 && codePoint <= 0x1F3F0) {
        return 'travel'
    }
    if (codePoint === 0x1F3F4 || codePoint === 0x1F3F5) {
        return 'travel'
    }
    if (codePoint >= 0x1F3F7 && codePoint <= 0x1F3FA) {
        return 'travel'
    }

    // Activities (sports, games, arts)
    // Sports (0x26BD-0x26BE, 0x1F3C0-0x1F3CF, 0x1F3D0-0x1F3D4, 0x1F94A-0x1F94F)
    if (codePoint >= 0x26BD && codePoint <= 0x26BE) {
        return 'activities'
    }
    if (codePoint >= 0x1F3C0 && codePoint <= 0x1F3CF) {
        return 'activities'
    }
    if (codePoint >= 0x1F3D0 && codePoint <= 0x1F3D4) {
        return 'activities'
    }
    if (codePoint >= 0x1F94A && codePoint <= 0x1F94F) {
        return 'activities'
    }
    // Arts & crafts (0x1F3A0-0x1F3C3)
    if (codePoint >= 0x1F3A0 && codePoint <= 0x1F3C3) {
        return 'activities'
    }
    // Musical instruments (0x1F3B5-0x1F3B6, 0x1F3BA)
    if (codePoint >= 0x1F3B5 && codePoint <= 0x1F3B6 || codePoint === 0x1F3BA) {
        return 'activities'
    }

    // Objects
    // Office objects (0x1F4A0-0x1F4A9, 0x1F4B0-0x1F4FF)
    if (codePoint >= 0x1F4A0 && codePoint <= 0x1F4A9) {
        return 'objects'
    }
    if (codePoint >= 0x1F4B0 && codePoint <= 0x1F4FF) {
        return 'objects'
    }
    // Other objects (0x1F380-0x1F38F, 0x1F390-0x1F3A9, 0x1F3B0-0x1F3B4, 0x1F3B7-0x1F3B9, 0x1F3BB-0x1F3C3, 0x1F52B-0x1F52F)
    if (codePoint >= 0x1F380 && codePoint <= 0x1F38F) {
        return 'objects'
    }
    if (codePoint >= 0x1F390 && codePoint <= 0x1F3A9) {
        return 'objects'
    }
    if (codePoint >= 0x1F3B0 && codePoint <= 0x1F3B4) {
        return 'objects'
    }
    if (codePoint >= 0x1F3B7 && codePoint <= 0x1F3B9) {
        return 'objects'
    }
    if (codePoint >= 0x1F3BB && codePoint <= 0x1F3C3) {
        return 'objects'
    }
    if (codePoint >= 0x1F52B && codePoint <= 0x1F52F) {
        return 'objects'
    }
    // Extended objects (0x1F9E0-0x1F9EF, 0x1F9F0-0x1F9FF)
    if (codePoint >= 0x1F9E0 && codePoint <= 0x1F9FF) {
        return 'objects'
    }

    // Symbols
    // Hearts and symbols (0x1F300-0x1F32C, 0x1F380-0x1F3FF partially, 0x1F4AB-0x1F4FF partially)
    if (codePoint >= 0x1F300 && codePoint <= 0x1F32C) {
        return 'symbols'
    }
    // Hearts (0x2764, 0x1F496-0x1F49F, 0x1F5A4, 0x1F9E1)
    if (codePoint === 0x2764) {
        return 'symbols'
    }
    if (codePoint >= 0x1F496 && codePoint <= 0x1F49F) {
        return 'symbols'
    }
    if (codePoint === 0x1F5A4 || codePoint === 0x1F9E1) {
        return 'symbols'
    }
    // Other symbols (0x1F4AB-0x1F4AF, 0x1F500-0x1F5FF)
    if (codePoint >= 0x1F4AB && codePoint <= 0x1F4AF) {
        return 'symbols'
    }
    if (codePoint >= 0x1F500 && codePoint <= 0x1F5FF) {
        return 'symbols'
    }
    // Extended symbols (0x1F900-0x1F90F)
    if (codePoint >= 0x1F900 && codePoint <= 0x1F90F) {
        return 'symbols'
    }

    // Default to symbols for unrecognized
    return 'symbols'
}

/**
 * Groups emojis by category
 */
export function groupEmojisByCategory(emojis: string[]): Record<EmojiCategory, string[]> {
    const grouped: Record<EmojiCategory, string[]> = {
        smileys: [],
        people: [],
        animals: [],
        food: [],
        travel: [],
        activities: [],
        objects: [],
        symbols: [],
        flags: [],
    }

    for (const emoji of emojis) {
        const category = categorizeEmoji(emoji)
        grouped[category].push(emoji)
    }

    return grouped
}
