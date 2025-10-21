import {$s} from '@/app'
import {$t, api, notifier, store} from '@garage44/common/app'
import {Button, FieldCheckbox, FieldSelect, FieldText} from '@garage44/common/components'
import {createValidator, required} from '@garage44/common/lib/validation'
import classnames from 'classnames'
import {deepSignal} from 'deepsignal'
import {persistantState} from '@/lib/state'
import {useEffect} from 'preact/hooks'

const state = deepSignal({
    formality: [
        {id: 'less', name: 'Less formal'},
        {id: 'more', name: 'More formal'},
    ],
    target_languages: [],
})

export function WorkspaceSettings() {
    if (!$s.workspace) {
        return null
    }
    // Updated validator usage
    const {errors, isValid, validation} = createValidator({
        source: [
            $s.workspace.config.languages.$source,
            required('Source language is required'),
        ],
        ...Object.fromEntries(state.target_languages.flatMap((language) => [
            [`target_${language.id}_engine`, [
                language.$engine,
                {
                    message: `Translation engine required for ${language.name}`,
                    test: (v) => !language.selected || (language.selected && !!v),
                },
            ]],
            [`target_${language.id}_formality`, [
                language.$formality,
                {
                    message: `Formality setting required for ${language.name}`,
                    test: (v) => !language.selected ||
                        !language.formality_supported.includes(language.engine) ||
                        (language.selected && language.formality_supported.includes(language.engine) && !!v),
                },
            ]],
        ])),
    })

    useEffect(() => {
        state.target_languages.splice(0, state.target_languages.length, ...$s.enola.languages.target.map((language) => {
            const selected = $s.workspace.config.languages.target.find((i) => i.id === language.id)
            return {
                engine: selected ? selected.engine : '',
                engines: language.engines,
                formality: selected ? selected.formality : 'less',
                formality_supported: language.formality,
                id: language.id,
                name: language.name,
                selected: !!selected,
                transcription: language.transcription,
            }
        }))
    }, [$s.enola.languages.target, $s.workspace.config.languages.target])

    return (
        <div class="c-workspace-settings view">
            <FieldSelect
                help={$t('settings.help.source_language')}
                label={$t('settings.label.source_language')}
                model={$s.workspace.config.languages.$source}
                options={$s.enola.languages.source}
                placeholder={`${$t('settings.placeholder.source_language')}...`}
                validation={validation.value.source}
            />

            <div class="languages field">
                <div class="label">
                    {$t('settings.label.target_languages')}
                </div>
                <div className="options">
                    {state.target_languages.toSorted((a, b) => a.name.localeCompare(b.name)).map((language) => {
                        return <div class={classnames('option', {
                            'is-invalid': !validation.value[`target_${language.id}_engine`].isValid || !validation.value[`target_${language.id}_formality`].isValid,
                            'is-touched': validation.value[`target_${language.id}_engine`].isTouched || validation.value[`target_${language.id}_formality`].isTouched,
                        })}>
                            <div class="field-wrapper">
                                <FieldCheckbox
                                    onInput={(value) => {
                                        if (!value) {
                                            language.$engine.value = ''
                                        }

                                    }}
                                    label={language.name}
                                    model={language.$selected}
                                />
                                <FieldSelect
                                    disabled={!language.selected}
                                    model={language.$engine}
                                    options={Object.values($s.enola.engines).map((engine) => ({
                                        id: engine.name,
                                        name: engine.name,
                                    }))}
                                    placeholder={$t('settings.placeholder.translation')}
                                />

                            </div>
                            {language.formality_supported.includes(language.engine) && <div class="language-options">
                                <FieldSelect
                                    disabled={!language.selected}
                                    label={$t('settings.label.formality')}
                                    model={language.$formality}
                                    options={state.formality}
                                    placeholder={$t('settings.placeholder.formality')}
                                />
                            </div>}
                            <div class="validation">
                                {validation.value[`target_${language.id}_engine`].errors.join(', ')}
                                {validation.value[`target_${language.id}_formality`].errors.join(', ')}
                            </div>
                        </div>
                    })}
                </div>
                <div class="help">
                    {$t('settings.help.target_languages')}
                </div>
            </div>

            <FieldCheckbox
                help={$t('settings.help.sync_enabled')}
                model={$s.workspace.config.sync.$enabled}
                label={$t('settings.label.sync_enabled')}
            />
            <FieldText
                disabled={!$s.workspace.config.sync.enabled}
                help={$t('settings.help.sync_dir')}
                label={$t('settings.label.sync_dir')}
                model={$s.workspace.config.sync.$dir}
            />
            <Button
                label={$t('settings.label.update_settings')}
                onClick={async() => {
                    if (!isValid.value) {
                        notifier.notify({message: 'Please fix validation errors', type: 'error'})
                        return
                    }
                    store.save()
                    const selectedLanguages = state.target_languages
                        .filter((language) => language.selected)
                        .map((language) => {
                            return {
                                engine: language.engine,
                                formality: language.formality,
                                id: language.id,
                            }
                        })
                    // Merge the selected languages state back to the workspace config.
                    $s.workspace.config.languages.target.splice(0, $s.workspace.config.languages.target.length, ...selectedLanguages)
                    await api.post(`/api/workspaces/${$s.workspace.config.workspace_id}`, {
                        workspace: $s.workspace,
                    })
                    notifier.notify({message: $t('notifications.settings_updated'), type: 'info'})
                }}
                disabled={!isValid.value}
                tip={errors.value}
                type="info"
            />
        </div>
    )
}
