import {$s} from '@/app'

export function tag_updated(path_update) {
    $s.tags.updated = path_update
    setTimeout(() => {
        $s.tags.updated = null
    }, 1500)
}
