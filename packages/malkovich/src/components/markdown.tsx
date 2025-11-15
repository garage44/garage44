import {useEffect, useRef} from 'preact/hooks'
import {effect} from '@preact/signals'
import {deepSignal} from 'deepsignal'
import {fetchMarkdown, convertLinksToLocalRoutes, renderMarkdown, prepareMermaidDiagrams} from '../lib/markdown'
import mermaid from 'mermaid'

interface MarkdownPageProps {
    filePath: string
}

// Helper to add transparency to hex colors (alpha as hex string like '40' = 25% opacity)
const addAlpha = (hexColor: string, alphaHex: string): string => {
    if (hexColor.startsWith('#')) {
        const r = parseInt(hexColor.slice(1, 3), 16)
        const g = parseInt(hexColor.slice(3, 5), 16)
        const b = parseInt(hexColor.slice(5, 7), 16)
        const alpha = parseInt(alphaHex, 16) / 255
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
    return hexColor
}

export const MarkdownPage = ({filePath}: MarkdownPageProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const stateRef = useRef(deepSignal({
        content: '',
        error: null as string | null,
        loading: true,
    }))
    const state = stateRef.current

    // Initialize mermaid once with theme-appropriate colors (detected on page load)
    useEffect(() => {
        // Detect if current theme is light mode by checking the DOM class
        const isLightMode = typeof document !== 'undefined' && document.documentElement.classList.contains('light')

        // Colors - adapt to light/dark theme
        const blockBackground = isLightMode ? '#e8ecf0' : '#1a2530'
        const textColor = isLightMode ? '#1a1f28' : '#d0d4db'
        const textColorBright = isLightMode ? '#0c1018' : '#e8ecf0'
        const textColorSecondary = isLightMode ? '#3a4550' : '#b0b8c4'
        const borderColor = isLightMode ? '#c8d0d8' : '#3a4a5a'
        const lineColor = isLightMode ? '#8a98a8' : '#5a6a7a'
        const primaryColor = '#4a7cf5'
        const primary5 = '#6b8ff7'
        const success4 = '#4abf7a'
        const danger4 = '#f56b4a'

        mermaid.initialize({
            fontFamily: 'inherit',
            securityLevel: 'loose',
            startOnLoad: false,
            theme: 'base',
            themeVariables: {
                activationBkgColor: addAlpha(primary5, '1A'),
                activationBorderColor: primary5,
                actorBkg: blockBackground,
                actorBorder: borderColor,
                actorLineColor: lineColor,
                actorTextColor: textColorBright,
                clusterBkg: blockBackground,
                clusterBorder: borderColor,
                cScale0: primaryColor,
                cScale1: primary5,
                cScale2: success4,
                cScaleLabel: textColorBright,
                edgeLabelBackground: blockBackground,
                errorBkgColor: addAlpha(danger4, '40'),
                errorTextColor: danger4,
                labelBoxBkgColor: blockBackground,
                labelBoxBorderColor: borderColor,
                labelColor: textColorBright,
                labelTextColor: textColorBright,
                lineColor: lineColor,
                loopTextColor: textColorBright,
                mainBkgColor: blockBackground,
                noteBkgColor: blockBackground,
                noteBorderColor: borderColor,
                noteTextColor: textColorBright,
                primaryBorderColor: borderColor,
                primaryColor: blockBackground,
                primaryTextColor: textColorBright,
                secondaryBorderColor: borderColor,
                secondaryColor: blockBackground,
                secondaryTextColor: textColorSecondary,
                secondBkgColor: blockBackground,
                sequenceNumberColor: textColorBright,
                signalColor: lineColor,
                signalTextColor: textColorBright,
                tertiaryBorderColor: borderColor,
                tertiaryColor: blockBackground,
                tertiaryTextColor: textColorSecondary,
                textColor: textColor,
            },
        })
    }, [])

    // Load markdown when filePath changes
    useEffect(() => {
        const loadMarkdown = async () => {
            state.loading = true
            state.error = null
            state.content = ''

            const trimmedPath = filePath?.trim() || ''
            if (!trimmedPath) {
                state.error = 'Path is required'
                state.loading = false
                return
            }

            const markdown = await fetchMarkdown(trimmedPath)

            if (markdown) {
                const converted = convertLinksToLocalRoutes(markdown, trimmedPath)
                state.content = converted
            } else {
                state.error = 'File not found'
            }
            state.loading = false
        }
        loadMarkdown()
        // Note: state is DeepSignal, accessed via ref - not needed in deps
    }, [filePath])

    // Render content and mermaid diagrams when content changes
    useEffect(() => {
        const unsubscribe = effect(() => {
            const content = state.content
            const loading = state.loading
            const error = state.error

            if (!containerRef.current) return

            if (loading) {
                containerRef.current.innerHTML = '<div class="styleguide-page">Loading...</div>'
                return
            }

            if (error) {
                containerRef.current.innerHTML = `<div class="styleguide-page error">${error}</div>`
                return
            }

            if (!content) {
                containerRef.current.innerHTML = ''
                return
            }

            const html = renderMarkdown(content)
            const htmlWithMermaid = prepareMermaidDiagrams(html)

            containerRef.current.innerHTML = htmlWithMermaid

            // Render mermaid diagrams synchronously
            const mermaidElements = containerRef.current.querySelectorAll('.mermaid')
            if (mermaidElements && mermaidElements.length > 0) {
                mermaid.run({
                    nodes: Array.from(mermaidElements) as HTMLElement[],
                }).catch((err) => {
                    console.error('Error rendering mermaid diagrams:', err)
                })
            }
        })

        return unsubscribe
    }, [])

    // Always render the container - effect handles content
    return <div ref={containerRef} class="c-markdown-page" />
}
