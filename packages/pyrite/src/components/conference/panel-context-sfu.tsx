import {VideoStrip} from './video/video-strip'
import {ControlsMain} from './controls/controls-main'
import {PanelContext} from '@garage44/common/components'
import {$s} from '@/app'
import {store} from '@garage44/common/app'

export function PanelContextSfu() {
    return <PanelContext
        className="c-panel-context-conference"
        collapsed={$s.panels.context.collapsed}
        width={$s.panels.context.width}
        defaultWidth={200}
        minWidth={64}
        onCollapseChange={(collapsed) => {
        // Synchronize collapse state: both panels collapse together
            $s.panels.context.collapsed = collapsed
            store.save()
        }}
        onWidthChange={(width) => {
        // Only allow width changes when not collapsed
            if (!$s.panels.context.collapsed) {
                $s.panels.context.width = width
                store.save()
            }
        }}
    >
        {$s.sfu.channel.connected && <>
            <ControlsMain key="controls" />,
            <VideoStrip key="video" />
        </> }
    </PanelContext>
}