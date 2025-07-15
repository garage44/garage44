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

export function TranslationProgress({
    active = false,
    type,
    percentage = 0,
    message = '',
    currentLanguage,
    batchInfo,
    status = 'started',
    className = '',
    showNotification = true,
    iso6391 = 'en-gb'
}) {
    if (!active) return null

    const intlPercentage = new Intl.NumberFormat(iso6391, {
        maximumFractionDigits: 1,
        minimumFractionDigits: 1,
        style: 'percent',
    })

    const getStatusIcon = () => {
        switch (status) {
            case 'started':
            case 'processing':
                return <Icon name="loading" className="rotate" size="s" />
            case 'completed':
                return <Icon name="check" size="s" />
            case 'error':
                return <Icon name="warning" size="s" />
            case 'retrying':
                return <Icon name="refresh" className="rotate" size="s" />
            default:
                return <Icon name="loading" className="rotate" size="s" />
        }
    }

    const getStatusClass = () => {
        switch (status) {
            case 'completed':
                return 'success'
            case 'error':
                return 'error'
            case 'retrying':
                return 'warning'
            default:
                return 'processing'
        }
    }

    return (
        <div className={`c-translation-progress ${className}`}>
            {showNotification && (
                <div className={`notification ${getStatusClass()}`}>
                    <div className="notification-content">
                        <div className="notification-header">
                            {getStatusIcon()}
                            <span className="notification-title">
                                {type === 'batch' ? 'Batch Translation' : 'Translation'} - {status}
                            </span>
                        </div>
                        <div className="notification-message">{message}</div>
                        {currentLanguage && (
                            <div className="notification-language">
                                Current: {currentLanguage}
                            </div>
                        )}
                        {batchInfo && (
                            <div className="notification-batch-info">
                                {batchInfo.processedLanguages}/{batchInfo.totalLanguages} languages • {batchInfo.processedTags}/{batchInfo.totalTags} items
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            <div className="progress-bar">
                <div className="bar" style={`width:${Math.max(0, Math.min(100, percentage))}%`}>
                    <div className="percentage">
                        {getStatusIcon()}
                        <span>{intlPercentage.format(percentage / 100)}</span>
                    </div>
                </div>
                <div className="progress-text">
                    {message}
                </div>
            </div>
        </div>
    )
}
