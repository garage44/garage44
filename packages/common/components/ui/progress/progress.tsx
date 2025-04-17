import {Icon} from '@garage44/common/components'

export function Progress({boundaries, loading, percentage, iso6391}) {
    if (!iso6391) {
        iso6391 = 'en-gb'
    }
    const intlRange = new Intl.NumberFormat(iso6391)
    const intlPercentage = new Intl.NumberFormat(iso6391, {
        maximumFractionDigits: 1,
        minimumFractionDigits: 1,
        style: 'percent',
    })

    return <div class="c-progress">
        <div class="bar" style={`width:${percentage}%`}>
            <div className="percentage">
                {loading ? <Icon name="loading" className="rotate" size="s" /> : `${intlPercentage.format(percentage)}`}
            </div>
        </div>
        {boundaries.length && <div className="boundaries">
            {loading ? <Icon name="loading" className="rotate" size="xs" /> : intlRange.formatRange(boundaries[0], boundaries[1])}
        </div>}
    </div>
}
