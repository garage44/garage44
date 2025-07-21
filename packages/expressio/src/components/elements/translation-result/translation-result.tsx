import {$s} from '@/app'
import {classes} from '@garage44/common/lib/utils'

export function TranslationResult({group}) {
    return (
        <div class={classes('c-translation-result', {
            collapsed: group._collapsed,
        }, {
            'tag-updated': $s.tags.updated === null,
        })}>
            <div class="wrapper">
                {$s.workspace.config.languages.target.map((language) =>
                <div class="result" key={language.id}>
                    <div class="id">{language.id}</div>
                    <div class="value">
                        {group.target[language.id] || '-'}
                    </div>
                </div>)}
            </div>
        </div>
    )
}
