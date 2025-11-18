import {$s} from '@/app'
import {emojiCategories, groupEmojisByCategory, type EmojiCategory} from '@/lib/emoji-categories'

interface EmojiProps {
    onselect: (e: MouseEvent, emoji: string) => void
}

export default function Emoji({onselect}: EmojiProps) {
    // Group emojis by category - DeepSignal will handle reactivity
    const emojiList = ($s.chat.emoji.list ?? []) as string[]
    const groupedEmojis = emojiList.length > 0 
        ? groupEmojisByCategory(emojiList)
        : {} as Record<EmojiCategory, string[]>

    // Get emojis for selected category
    const selectedCategory = $s.chat.emoji.selectedCategory ?? 'smileys'
    const categoryEmojis = groupedEmojis[selectedCategory] ?? []

    return (
        <div class="c-emoji">
            {/* Category tabs */}
            <div class="tabs">
                {emojiCategories.map((category) => {
                    const emojiCount = groupedEmojis[category.id]?.length ?? 0
                    const isActive = selectedCategory === category.id
                    
                    return (
                        <button
                            key={category.id}
                            class={`tab ${isActive ? 'active' : ''}`}
                            onClick={() => {
                                $s.chat.emoji.selectedCategory = category.id
                            }}
                            title={category.name}
                            disabled={emojiCount === 0}
                        >
                            <span class="tab-icon">{category.icon}</span>
                        </button>
                    )
                })}
            </div>

            {/* Emoji grid */}
            <div class="grid">
                {categoryEmojis.length > 0 ? (
                    categoryEmojis.map((emoji, index) => (
                        <div
                            key={index}
                            class="item"
                            onClick={(e) => onselect(e as MouseEvent, emoji)}
                        >
                            {emoji}
                        </div>
                    ))
                ) : (
                    <div class="empty">No emojis in this category</div>
                )}
            </div>
        </div>
    )
}
