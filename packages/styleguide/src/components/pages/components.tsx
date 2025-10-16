import {
    Button,
    ButtonGroup,
    Chart,
    ContextInput,
    ContextSelect,
    FieldCheckbox,
    FieldCheckboxGroup,
    FieldMultiSelect,
    FieldNumber,
    FieldRadioGroup,
    FieldSelect,
    FieldSlider,
    FieldText,
    FieldTextarea,
    FieldUpload,
    Hint,
    Icon,
    IconChat,
    IconLogo,
    Notifications,
    PanelContext,
    Progress,
    Splash,
} from '@garage44/common/components'
import {ComponentDemo} from '../lib/component-demo'
import {Notifier} from '@garage44/common/lib/notifier'
import {StateView} from '../lib/state-view'
import {deepSignal} from 'deepsignal'
import {svg} from '@garage44/common/components/ui/icon/icon'


const data = deepSignal({
    model: {
        checkboxGroupValue: ['item1'],
        checkboxValue: false,
        contextInput: '',
        contextSelectValue: 'option1',
        multiSelectValue: [],
        notifications: [],
        numberValue: 0,
        radioValue: 'option1',
        selectValue: '',
        sliderValue: {value: 50, locked: false},
        textareaValue: '',
        textInput: '',
        uploadValue: '',
    },
})

const notifier = new Notifier(data.model.notifications)

export const Components = () => (
    <div class="styleguide-page">
        <h1>Components</h1>
        <p>All available components from @garage44/common</p>

        <ComponentDemo title="Button" component="Button">
            <div class="demo-grid">
                <div class="item-container">
                    <div class="item-label">Default</div>
                    <div class="item-variant">
                        <Button icon="workspace" label="Default" type="default"/>
                        <Button active={true} icon="workspace" label="Default Active" type="default"/>
                        <Button disabled={true} icon="workspace" label="Default Disabled" type="default"/>
                    </div>

                    <div class="item-variant">
                        <Button icon="workspace" label="Info" type="info"/>
                        <Button active={true} icon="workspace" label="Info Active" type="info"/>
                        <Button disabled={true} icon="workspace" label="Info Disabled" type="info"/>
                    </div>

                    <div class="item-variant">
                        <Button icon="workspace" label="Success" type="success"/>
                        <Button active={true} icon="workspace" label="Success Active" type="success"/>
                        <Button disabled={true} icon="workspace" label="Success Disabled" type="success"/>
                    </div>

                    <div class="item-variant">
                        <Button icon="workspace" label="Danger" type="danger"/>
                        <Button active={true} icon="workspace" label="Danger Active" type="danger"/>
                        <Button disabled={true} icon="workspace" label="Danger Disabled" type="danger"/>
                    </div>

                    <div class="item-variant">
                        <Button icon="workspace" label="Warning" type="warning"/>
                        <Button active={true} icon="workspace" label="Warning Active" type="warning"/>
                        <Button disabled={true} icon="workspace" label="Warning Disabled" type="warning"/>
                    </div>
                </div>
                <div class="item-container">
                    <div class="item-label">Toggle</div>
                    <div class="item-variant">
                        <Button icon="workspace" type="default" variant="toggle" />
                        <Button active={true} icon="workspace" type="default" variant="toggle" />
                        <Button disabled={true} icon="workspace" type="default" variant="toggle" />
                    </div>
                    <div class="item-variant">
                        <Button icon="workspace" type="info" variant="toggle" />
                        <Button active={true} icon="workspace" type="info" variant="toggle" />
                        <Button disabled={true} icon="workspace" type="info" variant="toggle" />
                    </div>
                    <div class="item-variant">
                        <Button icon="workspace" type="success" variant="toggle" />
                        <Button active={true} icon="workspace" type="success" variant="toggle" />
                        <Button disabled={true} icon="workspace" type="success" variant="toggle" />
                    </div>
                    <div class="item-variant">
                        <Button icon="workspace" type="danger" variant="toggle" />
                        <Button active={true} icon="workspace" type="danger" variant="toggle" />
                        <Button disabled={true} icon="workspace" type="danger" variant="toggle" />
                    </div>
                    <div class="item-variant">
                        <Button icon="workspace" type="warning" variant="toggle" />
                        <Button active={true} icon="workspace" type="warning" variant="toggle" />
                        <Button disabled={true} icon="workspace" type="warning" variant="toggle" />
                    </div>
                </div>



            </div>
        </ComponentDemo>

        <ComponentDemo title="Field Text" component="FieldText">
            <div class="demo-grid">
                <FieldText label="Basic Input" model={data.model.$textInput} />
                <FieldText label="With Placeholder" placeholder="Enter text..." model={data.model.$textInput} />
                <FieldText label="Required Field" model={data.model.$textInput} />
                <FieldText label="Disabled" disabled model={data.model.$textInput} />
            </div>
            <StateView state={{textInput: data.model.textInput}} title="Field Text State" />
        </ComponentDemo>

        <ComponentDemo title="Field Checkbox" component="FieldCheckbox">
            <div class="demo-grid">
                <FieldCheckbox label="Basic Checkbox" model={data.model.checkboxValue} />
                <FieldCheckbox label="Checked" model={data.model.checkboxValue} />
                <FieldCheckbox label="Disabled" model={data.model.checkboxValue} />
            </div>
            <StateView state={{checkboxValue: data.model.checkboxValue}} title="Field Checkbox State" />
        </ComponentDemo>

        <ComponentDemo title="Icon" component="Icon">
            <div class="c-icon-grid">
                {Object.keys(svg).map(iconName => (
                    <div key={iconName} class="item">
                        <Icon name={iconName} />
                        <span class="label">{iconName}</span>
                    </div>
                ))}
            </div>
        </ComponentDemo>

        <ComponentDemo title="Progress" component="Progress">
            <div class="demo-grid">
                <Progress boundaries={0} loading={false} percentage={0} iso6391="en" />
                <Progress boundaries={0} loading={false} percentage={0.25} iso6391="en" />
                <Progress boundaries={0} loading={false} percentage={0.5} iso6391="en" />
                <Progress boundaries={0} loading={false} percentage={0.75} iso6391="en" />
                <Progress boundaries={0} loading={false} percentage={1} iso6391="en" />
            </div>
        </ComponentDemo>



        <ComponentDemo title="Field Select" component="FieldSelect">
            <div class="demo-grid">
                <FieldSelect
                    help="I am a select description"
                    label="Basic Select"
                    model={data.model.$selectValue!}
                    options={[
                        {id: 'option1', name: 'Option 1'},
                        {id: 'option2', name: 'Option 2'},
                        {id: 'option3', name: 'Option 3'},
                    ]}
                />
            </div>
            <StateView state={{selectValue: data.model.selectValue}} title="Field Select State" />
        </ComponentDemo>

        <ComponentDemo title="Field Checkbox Group" component="FieldCheckboxGroup">
            <div class="demo-grid">
                <FieldCheckboxGroup
                    class=""
                    model={[
                        {label: 'Item 1', value: data.model.checkboxGroupValue.includes('item1')},
                        {label: 'Item 2', value: data.model.checkboxGroupValue.includes('item2')},
                        {label: 'Item 3', value: data.model.checkboxGroupValue.includes('item3')},
                    ]}
                >
                    <div />
                </FieldCheckboxGroup>
            </div>
            <StateView state={{checkboxGroupValue: data.model.checkboxGroupValue}} title="Field Checkbox Group State" />
        </ComponentDemo>

        <ComponentDemo title="Field Upload" component="FieldUpload">
            <div class="demo-grid">
                <FieldUpload
                    label="File Upload"
                    model={[data.model, 'uploadValue']}
                />
            </div>
            <StateView state={{uploadValue: data.model.uploadValue}} title="Field Upload State" />
        </ComponentDemo>

        <ComponentDemo title="Notifications" component="Notifications">
            <Button
                label="Add notification"
                onClick={() => {
                    console.log("CLICK")
                    notifier.notify({
                        icon: 'info',
                        id: Date.now(),
                        link: {text: '', url: ''},
                        list: [],
                        message: 'Hello there',
                        type: 'info'
                    })
                }}
            />
            <Notifications notifications={data.model.notifications}/>
            <StateView state={{notifications: data.model.notifications}} title="Notifications State" />
        </ComponentDemo>

        <ComponentDemo title="Button Group" component="ButtonGroup">
            <div class="demo-grid">
                <ButtonGroup active={false}>
                    <Button icon="settings" label="Settings" />
                    <Button icon="info" label="Info" />
                </ButtonGroup>
                <ButtonGroup active={true}>
                    <Button icon="settings" label="Settings" />
                    <Button icon="info" label="Info" />
                </ButtonGroup>
            </div>
        </ComponentDemo>

        <ComponentDemo title="Chart" component="Chart">
            <div class="demo-grid">
                <Chart data={[10, 20, 15, 30, 25, 40, 35, 50]} name="Sample Data" />
                <Chart data={[5, 15, 8, 22, 18, 30, 28, 40, 35, 45, 42, 50]} name="More Data" />
            </div>
        </ComponentDemo>

        <ComponentDemo title="Hint" component="Hint">
            <div class="demo-grid">
                <Hint text="This is a helpful hint" />
                <Hint text="Another hint with more information" />
            </div>
        </ComponentDemo>

        <ComponentDemo title="Splash" component="Splash">
            <div style={{height: '300px', background: 'var(--bg-secondary)'}}>
                <Splash
                    header="Welcome"
                    instruction="This is a splash screen"
                    IconComponent={IconLogo}
                />
            </div>
        </ComponentDemo>

        <ComponentDemo title="Icon Chat" component="IconChat">
            <div class="c-icon-grid">
                <div class="item">
                    <svg viewBox="0 0 24 24" style={{width: '48px', height: '48px'}}>
                        <IconChat />
                    </svg>
                    <span class="label">No unread</span>
                </div>
                <div class="item">
                    <svg viewBox="0 0 24 24" style={{width: '48px', height: '48px'}}>
                        <IconChat iconProps={{unread: 3}} />
                    </svg>
                    <span class="label">3 unread</span>
                </div>
                <div class="item">
                    <svg viewBox="0 0 24 24" style={{width: '48px', height: '48px'}}>
                        <IconChat iconProps={{unread: 10}} />
                    </svg>
                    <span class="label">10 unread</span>
                </div>
            </div>
        </ComponentDemo>

        <ComponentDemo title="Icon Logo" component="IconLogo">
            <div class="c-icon-grid">
                <div class="item">
                    <svg viewBox="0 0 24 24" style={{width: '96px', height: '96px'}}>
                        <IconLogo />
                    </svg>
                    <span class="label">Logo</span>
                </div>
            </div>
        </ComponentDemo>

        <ComponentDemo title="Field Number" component="FieldNumber">
            <div class="demo-grid">
                <FieldNumber
                    label="Enter a number"
                    value={data.model.numberValue}
                    onChange={(v) => data.model.numberValue = v}
                />
                <FieldNumber
                    label="With help text"
                    help="Enter a numeric value"
                    value={data.model.numberValue}
                    onChange={(v) => data.model.numberValue = v}
                />
            </div>
            <StateView state={{numberValue: data.model.numberValue}} title="Field Number State" />
        </ComponentDemo>

        <ComponentDemo title="Field Radio Group" component="FieldRadioGroup">
            <div class="demo-grid">
                <FieldRadioGroup
                    label="Choose an option"
                    value={data.model.radioValue}
                    onChange={(v) => data.model.radioValue = v}
                    options={[
                        ['option1', 'Option 1'],
                        ['option2', 'Option 2'],
                        ['option3', 'Option 3'],
                    ]}
                />
            </div>
            <StateView state={{radioValue: data.model.radioValue}} title="Field Radio Group State" />
        </ComponentDemo>

        <ComponentDemo title="Field Slider" component="FieldSlider">
            <div class="demo-grid">
                <div style={{height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <FieldSlider
                        value={data.model.sliderValue}
                        onChange={(v) => data.model.sliderValue = v}
                        IconComponent={Icon}
                    />
                </div>
            </div>
            <StateView state={{sliderValue: data.model.sliderValue}} title="Field Slider State" />
        </ComponentDemo>

        <ComponentDemo title="Field Textarea" component="FieldTextarea">
            <div class="demo-grid">
                <FieldTextarea
                    label="Enter text"
                    value={data.model.textareaValue}
                    onChange={(v) => data.model.textareaValue = v}
                />
                <FieldTextarea
                    label="With placeholder"
                    placeholder="Type something here..."
                    value={data.model.textareaValue}
                    onChange={(v) => data.model.textareaValue = v}
                />
            </div>
            <StateView state={{textareaValue: data.model.textareaValue}} title="Field Textarea State" />
        </ComponentDemo>

        <ComponentDemo title="Field Multi Select" component="FieldMultiSelect">
            <div class="demo-grid">
                <FieldMultiSelect
                    label="Select multiple"
                    value={data.model.multiSelectValue}
                    onChange={(v) => data.model.multiSelectValue = v}
                    options={[
                        {id: 'item1', name: 'Item 1'},
                        {id: 'item2', name: 'Item 2'},
                        {id: 'item3', name: 'Item 3'},
                        {id: 'item4', name: 'Item 4'},
                    ]}
                />
            </div>
            <StateView state={{multiSelectValue: data.model.multiSelectValue}} title="Field Multi Select State" />
        </ComponentDemo>

        <ComponentDemo title="Context Input" component="ContextInput">
            <div class="demo-grid">
                <ContextInput
                    value={{icon: 'send', title: 'Send Message'}}
                    submit={(text) => {
                        console.log('Submitted:', text)
                        data.model.contextInput = text
                    }}
                    FieldTextComponent={FieldText}
                />
            </div>
            <StateView state={{contextInput: data.model.contextInput}} title="Context Input State" />
        </ComponentDemo>

        <ComponentDemo title="Context Select" component="ContextSelect">
            <div class="demo-grid">
                <ContextSelect
                    value={data.model.contextSelectValue}
                    icon="settings"
                    title="Select an option"
                    options={[
                        {id: 'option1', name: 'Option 1'},
                        {id: 'option2', name: 'Option 2'},
                        {id: 'option3', name: 'Option 3'},
                    ]}
                    submit={(v) => {
                        console.log('Selected:', v)
                        data.model.contextSelectValue = v
                    }}
                    FieldSelectComponent={FieldSelect}
                />
            </div>
            <StateView state={{contextSelectValue: data.model.contextSelectValue}} title="Context Select State" />
        </ComponentDemo>
    </div>
)