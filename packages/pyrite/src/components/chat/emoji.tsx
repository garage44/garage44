import {$s} from '@/app'

interface EmojiProps {
    onselect: (e: MouseEvent, emoji: string) => void
}

export default function Emoji({onselect}: EmojiProps) {
    return (
        <div class='c-emoji'>
            {$s.chat.emoji.list.map((emoji, index) => (
                <div
                    key={index}
                    class='emoji'
                    onClick={(e) => onselect(e as MouseEvent, emoji)}
                >
                    {emoji}
                </div>
            ))}
        </div>
    )
}
