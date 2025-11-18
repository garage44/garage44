import {$s} from '@/app'

interface EmojiProps {
    onselect: (e: MouseEvent, emoji: string) => void
}

export default function Emoji({onselect}: EmojiProps) {
    return (
        <div class='c-emoji'>
            {$s.chat.emoji.list.map((emoji, index) => <div
                class='emoji'
                key={index}
                onClick={(e) => onselect(e as MouseEvent, emoji)}
            >
                    {emoji}
            </div>)}
        </div>
    )
}
