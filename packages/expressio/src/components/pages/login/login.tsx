import {$s} from '@/app'
import {$t, api, notifier, ws} from '@garage44/common/app'
import {Button, FieldText, Notifications} from '@garage44/common/components'
import {createValidator, required} from '@garage44/common/lib/validation'
import {deepSignal} from 'deepsignal'
import {mergeDeep} from '@garage44/common/lib/utils'
import {useEffect} from 'preact/hooks'

const TRANSLATIONS = [
    'Expression', // English
    'Expressie', // Dutch
    'Espressione', // Italian
    'Выражение', // Russian (vyrazheniye)
    'Ausdruck', // German
    'Expressão', // Portuguese
    '表現', // Japanese (hyōgen)
    'التعبير', // Arabic (at-ta'bir)
    'การแสดงออก', // Thai (kaansadaeng-ook)
    'अभिव्यक्ति', // Hindi (abhivyakti)
    '표현', // Korean (pyohyeon)
    'ביטוי', // Hebrew (bitui)
    'வெளிப்பாடு', // Tamil (velippaadu)
    'ᐃᑌᓂᒧᐎᐣ', // Cree (itenimowin)
    'ສະແດງອອກ', // Lao (sadaeng-ook)
    'ထုတ်ဖော်မှု', // Burmese (htwet-phaw-hmu)
    'អភិវ្យក្តិ', // Khmer (abhivyakti)
    'ᠢᠯᠡᠷᠡᠭᠦᠯᠦᠯᠲᠡ', // Mongolian (ileregülülte)
    'ਪ੍ਰਗਟਾਅ', // Punjabi (pragtaa)
    'ಅಭಿವ್ಯಕ್ತಿ', // Kannada (abhivyakti)
    'പ്രകടനം', // Malayalam (prakatanam)
    'অভিব্যক্তি', // Bengali (obhibbekti)
    'መግለጫ', // Amharic (megletsha)
    'გამოხატვა', // Georgian (gamokhatva)
    'արտահայտություն', // Armenian (artahaytutyun)
    'Ekspresja', // Polish
    'Výraz', // Czech
    'Kifejezés', // Hungarian
    'Uttryck', // Swedish
    'Uttrykk', // Norwegian
    'Ilmaisu', // Finnish
    'Izražaj', // Croatian
    'Izraz', // Serbian
    'Ekspresio', // Esperanto
    'Shprehje', // Albanian
    'Изразяване', // Bulgarian
    'Ekspresie', // Afrikaans
    'Ekspresyon', // Haitian Creole
    'Pahayag', // Filipino/Tagalog
    'Ekspresi', // Indonesian
    'Biểu hiện', // Vietnamese
    'ການສະແດງອອກ', // Lao
    'Ifade', // Turkish
    'Ифода', // Tajik
    'Ifade', // Uzbek
    'Өрнөк', // Kyrgyz
    'Мәнер', // Kazakh
    'ביטוי', // Yiddish
    'Mynegiant', // Welsh
    'Sliocht', // Irish
]

// Animation configuration
const MAX_CONCURRENT_WORDS = 10
const MIN_SPAWN_DELAY = 200
const MAX_SPAWN_DELAY = 3000
const ANIMATION_DURATION = 10000

interface AnimatedWord {
    id: number
    text: string
    position: { x: number; y: number }
    scale: number
    opacity: number
    angle: number
    distance: number
}

const state = deepSignal({
    activeWords: [],
    animationFrame: 0,
    centerPosition: {x: window.innerWidth / 2, y: window.innerHeight / 2},
    nextWordId: 0,
    password: '',
    timeoutIds: [],
    username: '',
    wordsContainer: null,
})

const {validation, isValid, resetTouched} = createValidator({
    password: [state.$password, required('Password is required')],
    username: [state.$username, required('Username is required')],
})

export const Login = () => {

    const clearTimers = () => {
        if (state.animationFrame) {
            cancelAnimationFrame(state.animationFrame)
        }
        state.timeoutIds.forEach(clearTimeout)
        state.timeoutIds = []
    }

    const updateCenter = () => {
        state.centerPosition = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        }
    }

    const getRandomPosition = () => {
        const angle = Math.random() * Math.PI * 2
        return {
            angle,
            x: state.centerPosition.x,
            y: state.centerPosition.y,
        }
    }

    const spawnWord = () => {
        const text = TRANSLATIONS[Math.floor(Math.random() * TRANSLATIONS.length)]
        const {x, y, angle} = getRandomPosition()
        const scale = 10.2 + Math.random() * 0.4
        const distance = 1

        const newWord: AnimatedWord = {
            angle,
            distance,
            id: state.nextWordId++,
            opacity: 1,
            position: {x, y},
            scale,
            text,
        }

        state.activeWords = [...state.activeWords, newWord]

        // Just remove word after animation, don't schedule next
        const timeoutId = window.setTimeout(() => {
            state.activeWords = state.activeWords.filter(w => w.id !== newWord.id)
        }, ANIMATION_DURATION)

        state.timeoutIds = [...state.timeoutIds, timeoutId]
    }

    // Simplified continuous scheduling
    const scheduleNextWord = () => {
        const delay = MIN_SPAWN_DELAY + Math.random() * (MAX_SPAWN_DELAY - MIN_SPAWN_DELAY)
        const timeoutId = window.setTimeout(() => {
            if (state.activeWords.length < MAX_CONCURRENT_WORDS) {
                spawnWord()
            }
            scheduleNextWord() // Always schedule next regardless
        }, delay)
        state.timeoutIds = [...state.timeoutIds, timeoutId]
    }

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress)
        window.addEventListener('resize', updateCenter)
        spawnWord() // Spawn first word immediately
        scheduleNextWord() // Start scheduling next words
        return () => {
            document.removeEventListener('keydown', handleKeyPress)
            clearTimers()
            window.removeEventListener('resize', updateCenter)
        }
    }, [])

    const handleLogin = async() => {
        // Mark all fields as touched to show validation errors
        resetTouched()

        if (!isValid.value) {
            notifier.notify({message: $t('notifications.validation_errors'), type: 'warning'})
            return
        }

        const result = await api.post('/api/login', {
            password: state.password,
            username: state.username,
        })
        if (result.authenticated) {
            mergeDeep(state, {password: '', username: ''})
            notifier.notify({message: $t('notifications.logged_in'), type: 'info'})
            const config = await api.get('/api/config')
            mergeDeep($s, {
                enola: config.enola,
                user: result,
                workspaces: config.workspaces,
            }, {usage: {loading: false}})

            ws.connect()
        } else {
            notifier.notify({message: $t('notifications.logged_in_fail'), type: 'warning'})
        }
    }

    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin()
        }
    }

    return <div className="c-login fade-in">
        <span style="position: absolute; visibility: hidden;">
            {$t('direction_helper')}
        </span>

        <div ref={(el) => state.wordsContainer = el} className="words-container">
            {state.activeWords.map(word => (
                <div
                    key={word.id}
                    className="floating-translation fade-in"
                    style={{
                        '--angle': `${word.angle}rad`,
                        '--distance': word.distance,
                        left: `${word.position.x}px`,
                        top: `${word.position.y}px`,
                    }}
                >
                    {word.text}
                </div>
            ))}
        </div>

        <div className="login-container">
            <div className="logo">
                <img src="/public/img/logo.svg" alt="Expressio Logo"/>
                <span className="logo-text">Expressio</span>
            </div>

            <FieldText
                className="id-field"
                model={state.$username}
                label="Username"
                help="Enter your username"
                validation={validation.value.username}
            />
            <div className="field password-field">
                <FieldText
                    copyable={false}
                    help="Enter your password"
                    type="password"
                    model={state.$password}
                    label="Password"
                    validation={validation.value.password}
                />
            </div>
            <Button
                disabled={!isValid.value}
                label={$t('users.login')}
                onClick={handleLogin}
                type="info"
            />

        </div>

        <Notifications notifications={$s.notifications}/>
    </div>
}
