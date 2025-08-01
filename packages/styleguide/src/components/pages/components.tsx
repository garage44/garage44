import {
    Button,
    FieldCheckbox,
    FieldCheckboxGroup,
    FieldSelect,
    FieldText,
    FieldUpload,
    Icon,
    Notifications,
    Progress,
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
        notifications: [],
        selectValue: '',
        textInput: '',
        uploadValue: '',
    },
})

const notifier = new Notifier(data.model.notifications)

export const Components = () => (
    <div class="styleguide__page">
        <h1>Components</h1>
        <p>All available components from @garage44/common</p>

        <ComponentDemo title="Button" component="Button">
            <div class="demo-grid">
                <Button label="Default Button" onClick={() => {}} />
                <Button label="Primary Button" type="primary" onClick={() => {}} />
                <Button label="Secondary Button" type="secondary" onClick={() => {}} />
                <Button label="Danger Button" type="danger" onClick={() => {}} />
                <Button label="With Icon" onClick={() => {}} />
                <Button onClick={() => {}} />
                <Button label="Disabled" disabled onClick={() => {}} />
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
            <div class="icon-grid">
                {Object.keys(svg).map(iconName => (
                    <div key={iconName} class="icon-grid__item">
                        <Icon name={iconName} />
                        <span class="icon-grid__label">{iconName}</span>
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
                    className=""
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
    </div>
)