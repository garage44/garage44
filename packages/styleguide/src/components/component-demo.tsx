import {h} from 'preact'

interface ComponentDemoProps {
    children: any
    component: string
    title: string
}

export const ComponentDemo = ({title, component, children}: ComponentDemoProps) => (
    <section class="component-demo">
        <header class="component-demo__header">
            <h2 class="component-demo__title">{title}</h2>
            <code class="component-demo__component-name">{component}</code>
        </header>
        <div class="component-demo__content">
            {children}
        </div>
    </section>
)