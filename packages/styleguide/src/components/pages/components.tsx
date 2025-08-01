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
import {StateView} from '../lib/state_view'
import {deepSignal} from 'deepsignal'

const data = deepSignal({
    model: {
        notifications: [],
        select: '',
    },
})

const notifier = new Notifier(data.model.notifications)

export const Components = () => (
    <div class="styleguide__page">
        <h1>Components</h1>
        <p>All available components from @garage44/common</p>

        <ComponentDemo title="Icon" component="Icon">
            <div class="demo-grid">
                <Icon name="settings" />
                <Icon name="close" />
                <Icon name="chevron_left" />
                <Icon name="chevron_right" />
                <Icon name="eye" />
                <Icon name="eye_off" />
                <Icon name="loading" />
            </div>
        </ComponentDemo>

        <ComponentDemo title="Button" component="Button">
            <div class="demo-grid">
                <Button label="Default Button" />
                <Button label="Primary Button" type="primary" />
                <Button label="Secondary Button" type="secondary" />
                <Button label="Danger Button" type="danger" />
                <Button icon="settings" label="With Icon" />
                <Button icon="settings" />
                <Button label="Disabled" disabled />
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

        <ComponentDemo title="Field Text" component="FieldText">
            <div class="demo-grid">
                <FieldText label="Basic Input" model="test" />
                <FieldText label="With Placeholder" placeholder="Enter text..." model="test" />
                <FieldText label="Required Field" model="test" />
                <FieldText label="Disabled" disabled model="test" />
            </div>
        </ComponentDemo>

        <ComponentDemo title="Field Checkbox" component="FieldCheckbox">
            <div class="demo-grid">
                <FieldCheckbox label="Basic Checkbox" model="test" />
                <FieldCheckbox label="Checked" checked model="test" />
                <FieldCheckbox label="Disabled" disabled model="test" />
            </div>
        </ComponentDemo>

        <ComponentDemo title="Field Select" component="FieldSelect">
            <div class="demo-grid">
                <FieldSelect
                    help="I am a select description"
                    label="Basic Select"
                    model="test"
                    options={[
                        {id: 'option1', name: 'Option 1'},
                        {id: 'option2', name: 'Option 2'},
                        {id: 'option3', name: 'Option 3'},
                    ]}
                />

                <StateView />
            </div>
        </ComponentDemo>

        <ComponentDemo title="Field Checkbox Group" component="FieldCheckboxGroup">
            <div class="demo-grid">
                <FieldCheckboxGroup
                    label="Multiple Choice"
                    model={[
                        {value: 'item1', label: 'Item 1'},
                        {value: 'item2', label: 'Item 2'},
                        {value: 'item3', label: 'Item 3'},
                    ]}
                />
            </div>
        </ComponentDemo>

        <ComponentDemo title="Field Upload" component="FieldUpload">
            <div class="demo-grid">
                <FieldUpload
                    label="File Upload"
                    model="test"
                />
            </div>
        </ComponentDemo>

        <ComponentDemo title="Notifications" component="Notifications">
            <Button
                label="Add notification"
                onClick={() => {
                    console.log("CLICK")
                    notifier.notify({type: 'info', message: 'Hello there'})
                }}
            />
            <Notifications notifications={data.model.notifications}/>
        </ComponentDemo>
    </div>
)