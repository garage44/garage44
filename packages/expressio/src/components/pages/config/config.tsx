import {$s, i18n} from '@/app'
import {api, notifier, store} from '@garage44/common/app'
import {$t} from '@garage44/expressio'
import {Button, FieldSelect, FieldText} from '@garage44/common/components'
import {createValidator, required} from '@garage44/common/lib/validation'
import {WorkspaceSelector} from '@/components/elements'
import {loadConfig} from '@/lib/config'
import {persistantState} from '@/lib/state'
import {useEffect} from 'preact/hooks'

export function Config() {

    const {errors, isValid, validation} = createValidator({
        language_ui: [
            $s.language_ui.$selection,
            required('UI language is required'),
        ],
        ...Object.fromEntries(Object.values($s.enola.engines).flatMap((engine) => {
            const validations = [
                [`${engine.name}_key`, [
                    engine.$api_key,
                    required(`${engine.name} API key is required`),
                ]],
            ]

            if ('base_url' in engine) {
                validations.push([
                    `${engine.name}_base_url`, [
                        engine.$base_url,
                        required(`${engine.name} base URL is required`),
                    ],
                ])
            }

            return validations
        })),
    })

    useEffect(() => {

        (async() => {
            await loadConfig()
        })()
    }, [])

    return (
        <div class="c-config view">
            <FieldSelect
                help={$t(i18n.config.help.ui_language)}
                label={$t(i18n.config.label.ui_language)}
                model={$s.language_ui.$selection}
                options={$s.language_ui.options}
                placeholder={$t(i18n.config.placeholder.ui_language)}
                validation={validation?.value.language_ui}
            />

            <WorkspaceSelector workspaces={$s.workspaces}/>

            <div className="translators">
                {Object.values($s.enola.engines).map((engine) => {
                    return <div class="section">
                        {/* $t('config.help.anthropic_base_url') */}
                        {/* $t('config.help.anthropic_key') */}
                        {/* $t('config.help.deepl_base_url') */}
                        {/* $t('config.help.deepl_key') */}
                        {/* $t('config.label.anthropic_base_url') */}
                        {/* $t('config.label.anthropic_key') */}
                        {/* $t('config.label.deepl_key') */}
                        {/* $t('config.label.deepl_base_url') */}
                        <FieldText
                            help={$t(i18n.config.help[`${engine.name}_key` as keyof typeof i18n.config.help])}
                            label={$t(i18n.config.label[`${engine.name}_key` as keyof typeof i18n.config.label])}
                            model={engine.$api_key}
                            type="password"
                            copyable={true}
                            validation={validation?.value[`${engine.name}_key`]}
                        />

                        {'base_url' in engine && <FieldText
                            help={$t(i18n.config.help[`${engine.name}_base_url` as keyof typeof i18n.config.help])}
                            label={$t(i18n.config.label[`${engine.name}_base_url` as keyof typeof i18n.config.label])}
                            model={engine.$base_url}
                            validation={validation?.value[`${engine.name}_base_url`]}
                        />}
                    </div>
                })}
            </div>

            <Button
                disabled={!isValid?.value}
                label={$t(i18n.config.label.update_config)}
                onClick={async() => {
                    store.save()
                    await api.post('/api/config', {
                        enola: $s.enola,
                        language_ui: $s.language_ui.selection,
                        workspaces: $s.workspaces,
                    })

                    await loadConfig()
                    notifier.notify({message: $t(i18n.notifications.config_updated), type: 'info'})
                }}
                tip={errors?.value}
                type="info"
            />
        </div>
    )
}
